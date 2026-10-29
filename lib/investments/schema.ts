import { z } from "zod";
import { fromDatetimeLocalValue } from "@/lib/events/format-dates";

const dateTimeField = z
  .string()
  .min(1, "La fecha es obligatoria")
  .refine((value) => fromDatetimeLocalValue(value) !== null, "Fecha inválida");

export const creditorFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  is_active: z.boolean(),
});

export type CreditorFormValues = z.infer<typeof creditorFormSchema>;

export const investmentFormSchema = z.object({
  creditor_id: z
    .number({
      required_error: "Selecciona quién invirtió",
      invalid_type_error: "Selecciona quién invirtió",
    })
    .int()
    .positive("Selecciona quién invirtió"),
  title: z.string().trim().min(1, "El título es requerido"),
  amount: z
    .number({
      required_error: "El monto es obligatorio",
      invalid_type_error: "El monto es obligatorio",
    })
    .positive("El monto debe ser mayor a cero"),
  invested_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha es obligatoria"),
  notes: z.string().trim(),
});

export type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

export const investmentPaymentFormSchema = z.object({
  payment_method_id: z
    .number({
      required_error: "Selecciona cómo se pagó",
      invalid_type_error: "Selecciona cómo se pagó",
    })
    .int()
    .positive("Selecciona cómo se pagó"),
  amount: z
    .number({
      required_error: "El monto es obligatorio",
      invalid_type_error: "El monto es obligatorio",
    })
    .positive("El monto debe ser mayor a cero"),
  paid_at: dateTimeField,
  notes: z.string().trim(),
});

export type InvestmentPaymentFormValues = z.infer<
  typeof investmentPaymentFormSchema
>;
