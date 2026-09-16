"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { EVENT_PHASE } from "@/lib/events/constants";
import { getEventById } from "@/lib/events/queries";
import { getStatusPhase } from "@/lib/events/status-transitions";
import {
  RESEARCH_STATUS,
  RESEARCH_UPDATE_KIND,
  type ResearchStatus,
} from "@/lib/research/constants";
import { getResearchRequestById } from "@/lib/research/queries";
import {
  addResearchNoteSchema,
  createResearchRequestSchema,
  researchRequestStatusSchema,
} from "@/lib/research/schema";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

function revalidateResearchPaths(eventId: string) {
  revalidatePath("/seguimientos");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

function canEditResearch(phase: string) {
  return phase === EVENT_PHASE.COMMERCIAL || phase === EVENT_PHASE.OPERATIONAL;
}

export async function createResearchRequest(input: {
  eventId: string;
  title: string;
}): Promise<ActionResult> {
  const parsed = createResearchRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const { userId } = await auth();
    const event = await getEventById(parsed.data.eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const phase = getStatusPhase(event.event_statuses.code);
    if (!canEditResearch(phase)) {
      return {
        success: false,
        error: "No se pueden agregar investigaciones a un evento archivado.",
      };
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("event_research_requests").insert({
      event_id: event.id,
      title: parsed.data.title,
      status: RESEARCH_STATUS.OPEN,
      created_by: userId,
      updated_by: userId,
    });

    if (error) {
      console.error("[createResearchRequest]", error.message);
      return { success: false, error: "No se pudo crear la investigación." };
    }

    revalidateResearchPaths(event.id);
    return { success: true };
  } catch (error) {
    console.error("[createResearchRequest]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo crear la investigación.",
    };
  }
}

export async function addResearchNote(input: {
  requestId: string;
  body: string;
}): Promise<ActionResult> {
  const parsed = addResearchNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const { userId } = await auth();
    const request = await getResearchRequestById(parsed.data.requestId);
    if (!request) {
      return { success: false, error: "Investigación no encontrada." };
    }

    const event = await getEventById(request.event_id);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const phase = getStatusPhase(event.event_statuses.code);
    if (!canEditResearch(phase)) {
      return {
        success: false,
        error: "Este evento ya está archivado.",
      };
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("event_research_updates").insert({
      request_id: request.id,
      kind: RESEARCH_UPDATE_KIND.NOTE,
      body: parsed.data.body,
      created_by: userId,
    });

    if (error) {
      console.error("[addResearchNote]", error.message);
      return { success: false, error: "No se pudo guardar la nota." };
    }

    revalidateResearchPaths(event.id);
    return { success: true };
  } catch (error) {
    console.error("[addResearchNote]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "No se pudo guardar la nota.",
    };
  }
}

export async function notifyResearchClient(input: {
  requestId: string;
  templateId?: string | null;
  messageBody: string;
}): Promise<ActionResult> {
  const messageBody = input.messageBody.trim();
  if (!messageBody) {
    return { success: false, error: "El mensaje no puede estar vacío." };
  }

  try {
    const { userId } = await auth();
    const request = await getResearchRequestById(input.requestId);
    if (!request) {
      return { success: false, error: "Investigación no encontrada." };
    }

    if (request.status === RESEARCH_STATUS.DONE) {
      return {
        success: false,
        error: "Esta investigación ya está cerrada.",
      };
    }

    const event = await getEventById(request.event_id);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const phase = getStatusPhase(event.event_statuses.code);
    if (!canEditResearch(phase)) {
      return {
        success: false,
        error: "Este evento ya está archivado.",
      };
    }

    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();
    const { error: followUpError } = await supabase
      .from("event_follow_ups")
      .insert({
        event_id: event.id,
        step: null,
        due_at: now,
        completed_at: now,
        channel: "whatsapp",
        template_id: input.templateId || null,
        message_body: messageBody,
        created_by: userId,
      });

    if (followUpError) {
      console.error("[notifyResearchClient follow-up]", followUpError.message);
      return { success: false, error: "No se pudo registrar el WhatsApp." };
    }

    const { error: updateError } = await supabase
      .from("event_research_updates")
      .insert({
        request_id: request.id,
        kind: RESEARCH_UPDATE_KIND.WHATSAPP,
        body: `WhatsApp enviado sobre ${request.title}.`,
        message_body: messageBody,
        created_by: userId,
      });

    if (updateError) {
      console.error("[notifyResearchClient update]", updateError.message);
      return {
        success: false,
        error: "El WhatsApp se puede enviar, pero no se guardó en la investigación.",
      };
    }

    const { error: eventError } = await supabase
      .from("events")
      .update({
        last_contact_at: now,
        updated_by: userId,
      })
      .eq("id", event.id);

    if (eventError) {
      console.error("[notifyResearchClient event]", eventError.message);
    }

    revalidateResearchPaths(event.id);
    return { success: true };
  } catch (error) {
    console.error("[notifyResearchClient]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo registrar el WhatsApp.",
    };
  }
}

export async function setResearchRequestStatus(input: {
  requestId: string;
  status: ResearchStatus;
}): Promise<ActionResult> {
  const parsedStatus = researchRequestStatusSchema.safeParse(input.status);
  if (!parsedStatus.success) {
    return { success: false, error: "Estado inválido." };
  }

  try {
    const { userId } = await auth();
    const request = await getResearchRequestById(input.requestId);
    if (!request) {
      return { success: false, error: "Investigación no encontrada." };
    }

    const event = await getEventById(request.event_id);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const phase = getStatusPhase(event.event_statuses.code);
    if (!canEditResearch(phase)) {
      return {
        success: false,
        error: "Este evento ya está archivado.",
      };
    }

    const now = new Date().toISOString();
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("event_research_requests")
      .update({
        status: parsedStatus.data,
        completed_at:
          parsedStatus.data === RESEARCH_STATUS.DONE ? now : null,
        updated_by: userId,
      })
      .eq("id", request.id);

    if (error) {
      console.error("[setResearchRequestStatus]", error.message);
      return { success: false, error: "No se pudo actualizar la investigación." };
    }

    revalidateResearchPaths(event.id);
    return { success: true };
  } catch (error) {
    console.error("[setResearchRequestStatus]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la investigación.",
    };
  }
}
