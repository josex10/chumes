"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getEventLinkedQuote } from "@/lib/events/queries";
import { getPaymentAccess } from "@/lib/payments/access";
import { getEventPaymentSummary } from "@/lib/payments/queries";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { FINANCIAL_MOVEMENT_TYPE } from "@/lib/payments/constants";
import {
  advanceFormSchema,
  refundFormSchema,
  toMovementDateIso,
  updateMovementSchema,
  type AdvanceFormValues,
  type RefundFormValues,
  type UpdateMovementFormValues,
} from "@/lib/payments/schema";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

type PaymentMutationKind = "advance" | "refund" | "edit" | "delete";

async function validateEventForPayment(eventId: string): Promise<ActionResult | null> {
  const linkedQuote = await getEventLinkedQuote(eventId);

  if (!linkedQuote) {
    return { success: false, error: "El evento no tiene cotización vinculada." };
  }

  if (Number(linkedQuote.total) <= 0) {
    return {
      success: false,
      error: "La cotización vinculada no tiene un total válido.",
    };
  }

  return null;
}

async function validatePaymentMutation(
  eventId: string,
  kind: PaymentMutationKind,
  nextMovementType?: "ADVANCE" | "REFUND",
): Promise<ActionResult | null> {
  const supabase = createAdminSupabaseClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id, event_statuses(code, phase)")
    .eq("id", eventId)
    .maybeSingle();

  if (error || !event) {
    return { success: false, error: "Evento no encontrado." };
  }

  const summary = await getEventPaymentSummary(eventId);
  if (!summary) {
    return { success: false, error: "No se pudo validar el estado de pago." };
  }

  const access = getPaymentAccess(
    event.event_statuses.phase,
    event.event_statuses.code,
    summary.paymentStatus,
  );

  if ((kind === "edit" || kind === "delete") && access.editDisabled) {
    return {
      success: false,
      error: "Este evento está cerrado y ya no acepta cambios en pagos.",
    };
  }

  if (kind === "refund" && access.refundDisabled) {
    return {
      success: false,
      error: "Este evento está cerrado y ya no acepta devoluciones.",
    };
  }

  if (
    (kind === "advance" || (kind === "edit" && nextMovementType === "ADVANCE")) &&
    access.advanceDisabled
  ) {
    return {
      success: false,
      error:
        access.movementsLocked
          ? "Este evento está cerrado y ya no acepta adelantos."
          : "La factura ya está cancelada. Solo puedes registrar devoluciones.",
    };
  }

  return null;
}

async function validatePaymentMethod(
  paymentMethodId: number,
): Promise<ActionResult | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("id")
    .eq("id", paymentMethodId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: "Forma de pago no válida." };
  }

  return null;
}

function revalidateEventPaths(eventId: string) {
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

export async function createAdvance(
  eventId: string,
  values: AdvanceFormValues,
): Promise<ActionResult> {
  const parsed = advanceFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const eventError = await validateEventForPayment(eventId);
  if (eventError) return eventError;

  const accessError = await validatePaymentMutation(eventId, "advance");
  if (accessError) return accessError;

  const methodError = await validatePaymentMethod(parsed.data.payment_method_id);
  if (methodError) return methodError;

  let movementDate: string;
  try {
    movementDate = toMovementDateIso(parsed.data.movement_date);
  } catch {
    return { success: false, error: "Fecha inválida." };
  }

  const { userId } = await auth();
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase.from("event_financial_movements").insert({
    event_id: eventId,
    movement_type: FINANCIAL_MOVEMENT_TYPE.ADVANCE,
    amount: parsed.data.amount,
    payment_method_id: parsed.data.payment_method_id,
    movement_date: movementDate,
    notes: parsed.data.notes?.trim() || null,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    console.error("[createAdvance]", error.message);
    return { success: false, error: "No se pudo registrar el adelanto." };
  }

  revalidateEventPaths(eventId);
  return { success: true };
}

export async function createRefund(
  eventId: string,
  values: RefundFormValues,
): Promise<ActionResult> {
  const parsed = refundFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const eventError = await validateEventForPayment(eventId);
  if (eventError) return eventError;

  const accessError = await validatePaymentMutation(eventId, "refund");
  if (accessError) return accessError;

  const methodError = await validatePaymentMethod(parsed.data.payment_method_id);
  if (methodError) return methodError;

  let movementDate: string;
  try {
    movementDate = toMovementDateIso(parsed.data.movement_date);
  } catch {
    return { success: false, error: "Fecha inválida." };
  }

  const { userId } = await auth();
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase.from("event_financial_movements").insert({
    event_id: eventId,
    movement_type: FINANCIAL_MOVEMENT_TYPE.REFUND,
    amount: parsed.data.amount,
    payment_method_id: parsed.data.payment_method_id,
    movement_date: movementDate,
    notes: parsed.data.notes?.trim() || null,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    console.error("[createRefund]", error.message);
    return { success: false, error: "No se pudo registrar la devolución." };
  }

  revalidateEventPaths(eventId);
  return { success: true };
}

export async function updateMovement(
  movementId: string,
  values: UpdateMovementFormValues,
): Promise<ActionResult> {
  const parsed = updateMovementSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const methodError = await validatePaymentMethod(parsed.data.payment_method_id);
  if (methodError) return methodError;

  let movementDate: string;
  try {
    movementDate = toMovementDateIso(parsed.data.movement_date);
  } catch {
    return { success: false, error: "Fecha inválida." };
  }

  const supabase = createAdminSupabaseClient();

  const { data: existing, error: existingError } = await supabase
    .from("event_financial_movements")
    .select("event_id")
    .eq("id", movementId)
    .maybeSingle();

  if (existingError || !existing) {
    return { success: false, error: "Movimiento no encontrado." };
  }

  const accessError = await validatePaymentMutation(
    existing.event_id,
    "edit",
    parsed.data.movement_type,
  );
  if (accessError) return accessError;

  const { userId } = await auth();

  const { error } = await supabase
    .from("event_financial_movements")
    .update({
      movement_type: parsed.data.movement_type,
      amount: parsed.data.amount,
      payment_method_id: parsed.data.payment_method_id,
      movement_date: movementDate,
      notes: parsed.data.notes?.trim() || null,
      updated_by: userId,
    })
    .eq("id", movementId);

  if (error) {
    console.error("[updateMovement]", error.message);
    return { success: false, error: "No se pudo actualizar el movimiento." };
  }

  revalidateEventPaths(existing.event_id);
  return { success: true };
}

export async function deleteMovement(movementId: string): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();

  const { data: existing, error: existingError } = await supabase
    .from("event_financial_movements")
    .select("event_id")
    .eq("id", movementId)
    .maybeSingle();

  if (existingError || !existing) {
    return { success: false, error: "Movimiento no encontrado." };
  }

  const accessError = await validatePaymentMutation(existing.event_id, "delete");
  if (accessError) return accessError;

  const { error } = await supabase
    .from("event_financial_movements")
    .delete()
    .eq("id", movementId);

  if (error) {
    console.error("[deleteMovement]", error.message);
    return { success: false, error: "No se pudo eliminar el movimiento." };
  }

  revalidateEventPaths(existing.event_id);
  return { success: true };
}
