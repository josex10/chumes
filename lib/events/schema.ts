import { z } from "zod";
import { EVENT_PRIORITY } from "@/lib/events/constants";
import { fromDatetimeLocalValue } from "@/lib/events/format-dates";

export const eventFormSchema = z.object({
  title: z.string().trim().min(1, "El título es requerido"),
  customer_id: z.string().uuid("Seleccione un cliente"),
  contact_id: z.string().uuid().optional().nullable(),
  source_id: z.coerce
    .number()
    .int()
    .positive("Seleccione una fuente"),
  event_date: z.string().trim().optional(),
  delivery_date: z.string().trim().optional(),
  pickup_date: z.string().trim().optional(),
  estimated_location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  priority: z.enum([
    EVENT_PRIORITY.LOW,
    EVENT_PRIORITY.NORMAL,
    EVENT_PRIORITY.HIGH,
  ]),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function toEventPayload(values: EventFormValues) {
  return {
    title: values.title.trim(),
    customer_id: values.customer_id,
    contact_id: values.contact_id ?? null,
    source_id: values.source_id,
    event_date: values.event_date?.trim() || null,
    delivery_date: fromDatetimeLocalValue(values.delivery_date),
    pickup_date: fromDatetimeLocalValue(values.pickup_date),
    estimated_location: values.estimated_location?.trim() || null,
    notes: values.notes?.trim() || null,
    priority: values.priority,
  };
}
