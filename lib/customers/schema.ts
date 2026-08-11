import { z } from "zod";
import {
  extractPhoneDigits,
  formatPhoneNumber,
  isValidPhoneNumber,
} from "@/lib/customers/phone";

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  identification: z.string().trim().optional(),
  customer_type_id: z.coerce
    .number()
    .int()
    .positive("Customer type is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine(isValidPhoneNumber, "Enter an 8-digit phone number"),
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
