"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { EVENT_PHASE, EVENT_STATUS } from "@/lib/events/constants";
import { getEventById } from "@/lib/events/queries";
import { updateEventStatus } from "@/lib/events/actions";
import { getStatusPhase } from "@/lib/events/status-transitions";
import { dateKeyToIso } from "@/lib/follow-ups/calendar";
import {
  DEFAULT_LOST_FOLLOW_UP_REASON,
  type FollowUpStep,
} from "@/lib/follow-ups/constants";
import {
  getFollowUpProgress,
  getNextFollowUpDateKey,
} from "@/lib/follow-ups/schedule";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

function revalidateFollowUpPaths(eventId: string) {
  revalidatePath("/seguimientos");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

async function getCompletedFollowUps(eventId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_follow_ups")
    .select("step, completed_at")
    .eq("event_id", eventId);

  if (error) {
    console.error("[getCompletedFollowUps]", error.message);
    throw new Error("No se pudo cargar el historial de seguimientos.");
  }

  return data ?? [];
}

export async function completeEventFollowUp(input: {
  eventId: string;
  step: FollowUpStep;
  templateId?: string | null;
  messageBody: string;
}): Promise<ActionResult> {
  const messageBody = input.messageBody.trim();
  if (!messageBody) {
    return { success: false, error: "El mensaje no puede estar vacío." };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const event = await getEventById(input.eventId);

    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    if (getStatusPhase(event.event_statuses.code) !== EVENT_PHASE.COMMERCIAL) {
      return {
        success: false,
        error: "Solo se dan seguimientos a eventos comerciales.",
      };
    }

    const completed = await getCompletedFollowUps(event.id);
    const progress = getFollowUpProgress(
      event.created_at,
      completed,
      event.follow_up_paused_at,
    );

    if (progress.kind !== "pending" || progress.step !== input.step) {
      return {
        success: false,
        error: "Este seguimiento ya no corresponde al paso actual.",
      };
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("event_follow_ups").insert({
      event_id: event.id,
      step: input.step,
      due_at: dateKeyToIso(progress.dueDateKey),
      completed_at: now,
      channel: "whatsapp",
      template_id: input.templateId || null,
      message_body: messageBody,
      created_by: userId,
    });

    if (error) {
      console.error("[completeEventFollowUp]", error.message);
      return { success: false, error: "No se pudo registrar el seguimiento." };
    }

    const nextProgress = getFollowUpProgress(
      event.created_at,
      [...completed, { step: input.step, completed_at: now }],
      null,
    );
    const nextDueKey = getNextFollowUpDateKey(nextProgress);

    const { error: updateError } = await supabase
      .from("events")
      .update({
        last_contact_at: now,
        follow_up_at: nextDueKey ? dateKeyToIso(nextDueKey) : null,
        follow_up_paused_at: null,
        updated_by: userId,
      })
      .eq("id", event.id);

    if (updateError) {
      console.error("[completeEventFollowUp update]", updateError.message);
      return {
        success: false,
        error: "El WhatsApp se puede enviar, pero no se actualizó el evento.",
      };
    }

    revalidateFollowUpPaths(event.id);
    return { success: true };
  } catch (error) {
    console.error("[completeEventFollowUp]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo registrar el seguimiento.",
    };
  }
}

export async function pauseEventFollowUp(eventId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("events")
      .update({
        follow_up_paused_at: now,
        follow_up_at: null,
        updated_by: userId,
      })
      .eq("id", eventId);

    if (error) {
      console.error("[pauseEventFollowUp]", error.message);
      return { success: false, error: "No se pudo pausar el seguimiento." };
    }

    revalidateFollowUpPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[pauseEventFollowUp]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo pausar el seguimiento.",
    };
  }
}

export async function resumeEventFollowUp(eventId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const event = await getEventById(eventId);

    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const completed = await getCompletedFollowUps(eventId);
    const progress = getFollowUpProgress(event.created_at, completed, null);
    const nextDueKey = getNextFollowUpDateKey(progress);

    const { error } = await supabase
      .from("events")
      .update({
        follow_up_paused_at: null,
        follow_up_at: nextDueKey ? dateKeyToIso(nextDueKey) : null,
        updated_by: userId,
      })
      .eq("id", eventId);

    if (error) {
      console.error("[resumeEventFollowUp]", error.message);
      return { success: false, error: "No se pudo reanudar el seguimiento." };
    }

    revalidateFollowUpPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[resumeEventFollowUp]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo reanudar el seguimiento.",
    };
  }
}

export async function markEventLostFromFollowUp(
  eventId: string,
): Promise<ActionResult> {
  const result = await updateEventStatus(eventId, EVENT_STATUS.LOST, {
    lostReason: DEFAULT_LOST_FOLLOW_UP_REASON,
  });

  if (!result.success) return result;

  revalidatePath("/seguimientos");
  return { success: true };
}

export async function updateFollowUpTemplate(input: {
  id: string;
  name: string;
  body: string;
  step: FollowUpStep;
  isActive: boolean;
}): Promise<ActionResult> {
  const name = input.name.trim();
  const body = input.body.trim();

  if (!name || !body) {
    return { success: false, error: "El nombre y el mensaje son obligatorios." };
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("follow_up_templates")
      .update({
        name,
        body,
        step: input.step,
        is_active: input.isActive,
      })
      .eq("id", input.id);

    if (error) {
      console.error("[updateFollowUpTemplate]", error.message);
      return { success: false, error: "No se pudo guardar la plantilla." };
    }

    revalidatePath("/seguimientos");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("[updateFollowUpTemplate]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo guardar la plantilla.",
    };
  }
}
