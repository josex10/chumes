import { z } from "zod";
import {
  formatPhoneNumber,
  isValidPhoneNumber,
} from "@/lib/customers/phone";

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  identification: z.string().trim().optional(),
  customer_type_id: z.coerce
    .number()
    .int()
    .positive("El tipo de cliente es requerido"),
  email: z
    .string()
    .trim()
    .email("Ingrese un correo válido")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(1, "El teléfono es requerido")
    .refine(isValidPhoneNumber, "Ingrese un teléfono de 8 dígitos"),
  notes: z.string().trim().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export function toCustomerPayload(values: CustomerFormValues) {
  return {
    name: values.name.trim(),
    identification: values.identification?.trim() || null,
    customer_type_id: values.customer_type_id,
    email: values.email?.trim() || null,
    phone: formatPhoneNumber(values.phone),
    notes: values.notes?.trim() || null,
  };
}
