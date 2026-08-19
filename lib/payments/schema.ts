import { z } from "zod";
import { FINANCIAL_MOVEMENT_TYPE } from "@/lib/payments/constants";

const movementBaseSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a cero"),
  payment_method_id: z.coerce
    .number()
    .int()
    .positive("Selecciona una forma de pago"),
  movement_date: z.string().min(1, "La fecha es obligatoria"),
  notes: z.string().trim().optional(),
});

export const advanceFormSchema = movementBaseSchema;

export const refundFormSchema = movementBaseSchema;

export const updateMovementSchema = movementBaseSchema.extend({
  movement_type: z.enum([
    FINANCIAL_MOVEMENT_TYPE.ADVANCE,
    FINANCIAL_MOVEMENT_TYPE.REFUND,
  ]),
});

export type AdvanceFormValues = z.infer<typeof advanceFormSchema>;
export type RefundFormValues = z.infer<typeof refundFormSchema>;
export type UpdateMovementFormValues = z.infer<typeof updateMovementSchema>;

export function toMovementDateIso(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Fecha inválida");
  }
  return date.toISOString();
}
