import { z } from "zod";
import {
  extractPhoneDigits,
  isValidPhoneNumber,
} from "@/lib/customers/phone";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";

export const cartLineSchema = z.object({
  product_id: z.string().uuid(),
  line_type: z.enum([QUOTE_LINE_TYPE.RENTAL, QUOTE_LINE_TYPE.SALE]),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a cero"),
});

export const quoteRequestSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  phone: z
    .string()
    .trim()
    .min(1, "El teléfono es requerido")
    .refine(isValidPhoneNumber, "Ingrese un teléfono de 8 dígitos"),
  email: z
    .string()
    .trim()
    .email("Ingrese un correo válido")
    .optional()
    .or(z.literal("")),
  event_date: z.string().trim().optional(),
  estimated_location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z.array(cartLineSchema).min(1, "Agregue al menos un producto"),
  website: z.string().optional(),
});

export type CartLineInput = z.infer<typeof cartLineSchema>;
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export function getQuoteRequestRateLimitKey(phone: string): string {
  return extractPhoneDigits(phone);
}
