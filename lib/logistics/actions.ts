"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { EVENT_STATUS } from "@/lib/events/constants";
import { getEventById } from "@/lib/events/queries";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/events/format-dates";
import { canTransitionOperational } from "@/lib/events/operational-transitions";
import {
  isDeliveryCollaboratorCode,
  orderedAssigneeCodes,
} from "@/lib/logistics/collaborators";
import {
  isPrepStep,
  PREP_STEP_COLUMNS,
  type PrepStep,
} from "@/lib/logistics/constants";
import { createAdvance } from "@/lib/payments/actions";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

const confirmDeliverySchema = z.object({
  eventId: z.string().uuid(),
  pickupDate: z.string().min(1, "La hora de retiro es obligatoria."),
  collectPayment: z.boolean().optional(),
  payment: z
    .object({
      amount: z.coerce.number().positive("El monto debe ser mayor a cero."),
      payment_method_id: z.coerce.number().int().positive(),
      bank_account_id: z.coerce.number().int().positive(),
    })
    .optional(),
});

function revalidateLogisticsPaths(eventId: string) {
  revalidatePath("/logistica");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
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

async function upsertLogisticsField(
  eventId: string,
  fields: Partial<{
    inventory_checked_at: string | null;
    pulled_at: string | null;
    repaired_at: string | null;
    ironed_at: string | null;
    packed_at: string | null;
    delivered_at: string | null;
    picked_up_at: string | null;
    hours_confirmed_at: string | null;
    assignee_codes: string[];
  }>,
): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("event_logistics").upsert(
    {
      event_id: eventId,
      ...fields,
    },
    { onConflict: "event_id" },
  );

  if (error) {
    console.error("[upsertLogisticsField]", error.message);
    return { success: false, error: "No se pudo actualizar la logística." };
  }

  return { success: true };
}

export async function togglePrepStep(
  eventId: string,
  step: PrepStep,
): Promise<ActionResult> {
  if (!isPrepStep(step)) {
    return { success: false, error: "Paso de alistado inválido." };
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const supabase = createAdminSupabaseClient();
    const { data: existing, error: loadError } = await supabase
      .from("event_logistics")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    if (loadError) {
      console.error("[togglePrepStep]", loadError.message);
      return { success: false, error: "No se pudo cargar el alistado." };
    }

    const column = PREP_STEP_COLUMNS[step];
    const currentlySet = existing?.[column] ?? null;
    const nextValue = currentlySet ? null : new Date().toISOString();
    const fields = { [column]: nextValue } as Record<
      (typeof PREP_STEP_COLUMNS)[PrepStep],
      string | null
    >;

    const result = await upsertLogisticsField(eventId, fields);
    if (!result.success) return result;

    revalidateLogisticsPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[togglePrepStep]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el alistado.",
    };
  }
}

export async function toggleHoursConfirmed(
  eventId: string,
): Promise<ActionResult> {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const supabase = createAdminSupabaseClient();
    const { data: existing, error: loadError } = await supabase
      .from("event_logistics")
      .select("hours_confirmed_at")
      .eq("event_id", eventId)
      .maybeSingle();

    if (loadError) {
      console.error("[toggleHoursConfirmed]", loadError.message);
      return { success: false, error: "No se pudo cargar la confirmación de horas." };
    }

    const nextValue = existing?.hours_confirmed_at
      ? null
      : new Date().toISOString();
    const result = await upsertLogisticsField(eventId, {
      hours_confirmed_at: nextValue,
    });
    if (!result.success) return result;

    revalidateLogisticsPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[toggleHoursConfirmed]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la confirmación de horas.",
    };
  }
}

export async function toggleReadyPacked(
  eventId: string,
): Promise<ActionResult> {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const supabase = createAdminSupabaseClient();
    const { data: existing, error: loadError } = await supabase
      .from("event_logistics")
      .select("packed_at")
      .eq("event_id", eventId)
      .maybeSingle();

    if (loadError) {
      console.error("[toggleReadyPacked]", loadError.message);
      return { success: false, error: "No se pudo cargar el alistado." };
    }

    const result = await upsertLogisticsField(eventId, {
      packed_at: existing?.packed_at ? null : new Date().toISOString(),
    });
    if (!result.success) return result;

    revalidateLogisticsPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[toggleReadyPacked]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el alistado.",
    };
  }
}

export async function updateDeliveryTime(
  eventId: string,
  deliveryDateLocal: string,
): Promise<ActionResult> {
  const deliveryDate = fromDatetimeLocalValue(deliveryDateLocal);
  if (!deliveryDate) {
    return { success: false, error: "La fecha y hora de entrega no son válidas." };
  }

  try {
    const { userId } = await auth();
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    if (toDatetimeLocalValue(event.delivery_date) === deliveryDateLocal.trim()) {
      return { success: true };
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("events")
      .update({
        delivery_date: deliveryDate,
        updated_by: userId,
      })
      .eq("id", eventId);

    if (error) {
      console.error("[updateDeliveryTime]", error.message);
      return { success: false, error: "No se pudo actualizar la fecha de entrega." };
    }

    const { data: existing, error: loadError } = await supabase
      .from("event_logistics")
      .select("hours_confirmed_at")
      .eq("event_id", eventId)
      .maybeSingle();

    if (loadError) {
      console.error("[updateDeliveryTime]", loadError.message);
      return {
        success: false,
        error: "La fecha se guardó, pero no se pudo actualizar la confirmación.",
      };
    }

    if (existing?.hours_confirmed_at) {
      const cleared = await upsertLogisticsField(eventId, {
        hours_confirmed_at: null,
      });
      if (!cleared.success) return cleared;
    }

    revalidateLogisticsPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[updateDeliveryTime]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la fecha de entrega.",
    };
  }
}

export async function setDeliveryAssignees(
  eventId: string,
  codes: string[],
): Promise<ActionResult> {
  if (codes.some((code) => !isDeliveryCollaboratorCode(code))) {
    return { success: false, error: "Hay un colaborador inválido." };
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    const result = await upsertLogisticsField(eventId, {
      assignee_codes: orderedAssigneeCodes(codes),
    });
    if (!result.success) return result;

    revalidateLogisticsPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[setDeliveryAssignees]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo asignar el equipo.",
    };
  }
}

export async function confirmDelivery(
  input: z.infer<typeof confirmDeliverySchema>,
): Promise<ActionResult> {
  const parsed = confirmDeliverySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const pickupDate = fromDatetimeLocalValue(parsed.data.pickupDate);
  if (!pickupDate) {
    return { success: false, error: "La hora de retiro no es válida." };
  }

  try {
    const { userId } = await auth();
    const event = await getEventById(parsed.data.eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    if (
      !canTransitionOperational(
        event.event_statuses.code,
        EVENT_STATUS.DELIVERED,
      )
    ) {
      return {
        success: false,
        error: "Este evento no se puede marcar como entregado.",
      };
    }

    if (parsed.data.collectPayment && !parsed.data.payment) {
      return {
        success: false,
        error: "Completa el cobro o desmarcalo para entregar sin registrar pago.",
      };
    }

    if (parsed.data.collectPayment && parsed.data.payment) {
      const paymentResult = await createAdvance(event.id, {
        amount: parsed.data.payment.amount,
        payment_method_id: parsed.data.payment.payment_method_id,
        bank_account_id: parsed.data.payment.bank_account_id,
        movement_date: new Date().toISOString(),
        notes: "Cobro al entregar",
      });
      if (!paymentResult.success) return paymentResult;
    }

    const deliveredStatusId = await getStatusIdByCode(EVENT_STATUS.DELIVERED);
    const now = new Date().toISOString();
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("events")
      .update({
        status_id: deliveredStatusId,
        pickup_date: pickupDate,
        updated_by: userId,
      })
      .eq("id", event.id);

    if (error) {
      console.error("[confirmDelivery]", error.message);
      return { success: false, error: "No se pudo confirmar la entrega." };
    }

    const logisticsResult = await upsertLogisticsField(event.id, {
      delivered_at: now,
    });
    if (!logisticsResult.success) return logisticsResult;

    revalidateLogisticsPaths(event.id);
    return { success: true };
  } catch (error) {
    console.error("[confirmDelivery]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo confirmar la entrega.",
    };
  }
}

export async function confirmPickup(eventId: string): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: "Evento no encontrado." };
    }

    if (
      !canTransitionOperational(
        event.event_statuses.code,
        EVENT_STATUS.PICKED_UP,
      )
    ) {
      return {
        success: false,
        error: "Este evento no se puede marcar como retirado.",
      };
    }

    const pickedUpStatusId = await getStatusIdByCode(EVENT_STATUS.PICKED_UP);
    const now = new Date().toISOString();
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("events")
      .update({
        status_id: pickedUpStatusId,
        updated_by: userId,
      })
      .eq("id", event.id);

    if (error) {
      console.error("[confirmPickup]", error.message);
      return { success: false, error: "No se pudo confirmar el retiro." };
    }

    const logisticsResult = await upsertLogisticsField(eventId, {
      picked_up_at: now,
    });
    if (!logisticsResult.success) return logisticsResult;

    revalidateLogisticsPaths(eventId);
    return { success: true };
  } catch (error) {
    console.error("[confirmPickup]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo confirmar el retiro.",
    };
  }
}
