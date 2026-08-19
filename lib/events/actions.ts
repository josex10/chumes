"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { EVENT_STATUS } from "@/lib/events/constants";
import { hasCompleteDates } from "@/lib/events/dates-status";
import { getEventSourceById } from "@/lib/event-sources/queries";
import {
  getEventById,
  getEventLinkedQuote,
  getInquiryStatusId,
} from "@/lib/events/queries";
import {
  eventFormSchema,
  toEventPayload,
  type EventFormValues,
} from "@/lib/events/schema";
import {
  canTransitionStatus,
  getStatusPhase,
} from "@/lib/events/status-transitions";
import { EVENT_PHASE } from "@/lib/events/constants";

type ActionResult =
  | { success: true; eventId?: string }
  | { success: false; error: string };

async function validateEventSourceId(
  sourceId: number,
  currentSourceId?: number,
): Promise<string | null> {
  if (currentSourceId && sourceId === currentSourceId) {
    return null;
  }

  const source = await getEventSourceById(sourceId);
  if (!source) {
    return "La fuente seleccionada no existe.";
  }

  if (!source.is_active) {
    return "La fuente seleccionada está deshabilitada.";
  }

  return null;
}

async function getStatusIdByCode(code: string): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_statuses")
    .select("id")
    .eq("code", code)
    .single();

  if (error || !data) {
    throw new Error(`Could not load status ${code}.`);
  }

  return data.id;
}

export async function createEvent(values: EventFormValues): Promise<ActionResult> {
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const inquiryStatusId = await getInquiryStatusId();
    const now = new Date().toISOString();

    const sourceError = await validateEventSourceId(parsed.data.source_id);
    if (sourceError) {
      return { success: false, error: sourceError };
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        ...toEventPayload(parsed.data),
        status_id: inquiryStatusId,
        first_contact_at: now,
        last_contact_at: now,
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createEvent]", error?.message);
      return { success: false, error: "No se pudo crear el evento." };
    }

    revalidatePath("/events");
    return { success: true, eventId: data.id };
  } catch (error) {
    console.error("[createEvent]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo crear el evento.",
    };
  }
}

export async function updateEvent(
  id: string,
  values: EventFormValues,
): Promise<ActionResult> {
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();

    const event = await getEventById(id);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const phase = getStatusPhase(event.event_statuses.code);
    if (phase !== EVENT_PHASE.COMMERCIAL) {
      return {
        success: false,
        error: "Solo se pueden editar eventos en fase comercial.",
      };
    }

    const sourceError = await validateEventSourceId(
      parsed.data.source_id,
      event.source_id,
    );
    if (sourceError) {
      return { success: false, error: sourceError };
    }

    const { error } = await supabase
      .from("events")
      .update({
        ...toEventPayload(parsed.data),
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateEvent]", error.message);
      return { success: false, error: "No se pudo actualizar el evento." };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true, eventId: id };
  } catch (error) {
    console.error("[updateEvent]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar el evento.",
    };
  }
}

export async function updateEventStatus(
  id: string,
  nextStatusCode: string,
  options?: { lostReason?: string },
): Promise<ActionResult> {
  if (nextStatusCode === EVENT_STATUS.RESERVED) {
    return confirmAndReserve(id);
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const event = await getEventById(id);

    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const currentCode = event.event_statuses.code;
    if (!canTransitionStatus(currentCode, nextStatusCode)) {
      return { success: false, error: "Transición de estado inválida." };
    }

    const nextStatusId = await getStatusIdByCode(nextStatusCode);
    const now = new Date().toISOString();

    const updates: {
      status_id: number;
      updated_by: string | null;
      no_response_at?: string;
      lost_reason?: string | null;
    } = {
      status_id: nextStatusId,
      updated_by: userId,
    };

    if (nextStatusCode === EVENT_STATUS.NO_RESPONSE) {
      updates.no_response_at = now;
    }

    if (nextStatusCode === EVENT_STATUS.LOST) {
      updates.lost_reason = options?.lostReason?.trim() || null;
    }

    const { error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[updateEventStatus]", error.message);
      return { success: false, error: "No se pudo actualizar el estado." };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true, eventId: id };
  } catch (error) {
    console.error("[updateEventStatus]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar el estado.",
    };
  }
}

export async function confirmAndReserve(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const event = await getEventById(id);

    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const currentPhase = getStatusPhase(event.event_statuses.code);
    if (currentPhase !== EVENT_PHASE.COMMERCIAL) {
      return { success: false, error: "Este evento ya fue reservado." };
    }

    if (
      !hasCompleteDates(
        event.event_date,
        event.delivery_date,
        event.pickup_date,
      )
    ) {
      return {
        success: false,
        error: "Complete las fechas del evento, entrega y recogida antes de reservar.",
      };
    }

    const linkedQuote = await getEventLinkedQuote(id);
    if (!linkedQuote || !linkedQuote.quote_items?.length) {
      return {
        success: false,
        error: "Se requiere una cotización vinculada con productos para reservar.",
      };
    }

    const reservedStatusId = await getStatusIdByCode(EVENT_STATUS.RESERVED);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("events")
      .update({
        status_id: reservedStatusId,
        reserved_at: now,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[confirmAndReserve]", error.message);
      return { success: false, error: "No se pudo confirmar la reserva." };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true, eventId: id };
  } catch (error) {
    console.error("[confirmAndReserve]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo confirmar la reserva.",
    };
  }
}

export async function registerEventContact(id: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("events")
      .update({
        last_contact_at: now,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[registerEventContact]", error.message);
      return { success: false, error: "No se pudo registrar el contacto." };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true, eventId: id };
  } catch (error) {
    console.error("[registerEventContact]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo registrar el contacto.",
    };
  }
}

export async function scheduleEventFollowUp(
  id: string,
  followUpAt: string,
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("events")
      .update({
        follow_up_at: followUpAt,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[scheduleEventFollowUp]", error.message);
      return { success: false, error: "No se pudo programar el seguimiento." };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true, eventId: id };
  } catch (error) {
    console.error("[scheduleEventFollowUp]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo programar el seguimiento.",
    };
  }
}

export async function linkQuoteToEvent(
  quoteId: string,
  eventId: string,
): Promise<ActionResult> {
  try {
    const supabase = createAdminSupabaseClient();
    const event = await getEventById(eventId);

    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, customer_id, event_id")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return { success: false, error: "Cotización no encontrada." };
    }

    if (quote.event_id) {
      return { success: false, error: "La cotización ya está vinculada a un evento." };
    }

    if (quote.customer_id !== event.customer_id) {
      return {
        success: false,
        error: "La cotización debe pertenecer al mismo cliente del evento.",
      };
    }

    if (getStatusPhase(event.event_statuses.code) !== EVENT_PHASE.COMMERCIAL) {
      return {
        success: false,
        error: "Solo se pueden vincular cotizaciones a eventos en fase comercial.",
      };
    }

    const existingQuote = await getEventLinkedQuote(eventId);
    if (existingQuote) {
      return {
        success: false,
        error: "Este evento ya tiene una cotización vinculada.",
      };
    }

    const { error } = await supabase
      .from("quotes")
      .update({ event_id: eventId })
      .eq("id", quoteId);

    if (error) {
      console.error("[linkQuoteToEvent]", error.message);
      return { success: false, error: "No se pudo vincular la cotización." };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}/edit`);
    return { success: true, eventId };
  } catch (error) {
    console.error("[linkQuoteToEvent]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo vincular la cotización.",
    };
  }
}

export async function unlinkQuoteFromEvent(
  quoteId: string,
): Promise<ActionResult> {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, event_id")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      return { success: false, error: "Cotización no encontrada." };
    }

    if (!quote.event_id) {
      return { success: false, error: "La cotización no está vinculada a un evento." };
    }

    const event = await getEventById(quote.event_id);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    if (getStatusPhase(event.event_statuses.code) !== EVENT_PHASE.COMMERCIAL) {
      return {
        success: false,
        error: "No se puede desvincular en fase operativa.",
      };
    }

    const { error } = await supabase
      .from("quotes")
      .update({ event_id: null })
      .eq("id", quoteId);

    if (error) {
      console.error("[unlinkQuoteFromEvent]", error.message);
      return { success: false, error: "No se pudo desvincular la cotización." };
    }

    revalidatePath("/events");
    revalidatePath(`/events/${quote.event_id}`);
    revalidatePath("/quotes");
    revalidatePath(`/quotes/${quoteId}/edit`);
    return { success: true, eventId: quote.event_id };
  } catch (error) {
    console.error("[unlinkQuoteFromEvent]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo desvincular la cotización.",
    };
  }
}

export async function createQuoteForEvent(
  eventId: string,
  values: import("@/lib/quotes/schema").QuoteFormValues,
): Promise<ActionResult & { quoteId?: string }> {
  const event = await getEventById(eventId);
  if (!event) {
    return { success: false, error: "Evento no encontrado." };
  }

  const existingQuote = await getEventLinkedQuote(eventId);
  if (existingQuote) {
    return {
      success: false,
      error: "Este evento ya tiene una cotización vinculada.",
    };
  }

  if (values.customer_id !== event.customer_id) {
    return {
      success: false,
      error: "La cotización debe usar el cliente del evento.",
    };
  }

  const { createQuote } = await import("@/lib/quotes/actions");
  const result = await createQuote(values);

  if (!result.success || !result.quoteId) {
    return result;
  }

  const linkResult = await linkQuoteToEvent(result.quoteId, eventId);
  if (!linkResult.success) {
    return linkResult;
  }

  return { success: true, eventId, quoteId: result.quoteId };
}
