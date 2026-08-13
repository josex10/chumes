import { z } from "zod";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";

export const quoteLineItemSchema = z.object({
  product_id: z.string().uuid("Seleccione un producto"),
  line_type_id: z.coerce.number().int().positive("Line type is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unit_price: z.coerce.number().nonnegative("Unit price must be zero or greater"),
  tax_id: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().trim().optional(),
});

export const quoteFormSchema = z.object({
  customer_id: z.string().uuid("Customer is required"),
  estimated_location: z.string().trim().optional(),
  delivery_zone_id: z.coerce.number().int().positive().optional().nullable(),
  delivery_fee: z.coerce.number().nonnegative().optional().nullable(),
  discount_code: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  valid_until: z.string().trim().optional(),
  items: z.array(quoteLineItemSchema).min(1, "Add at least one line item"),
});

export type QuoteLineItemValues = z.infer<typeof quoteLineItemSchema>;
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export function toQuoteHeaderPayload(values: QuoteFormValues) {
  return {
    customer_id: values.customer_id,
    estimated_location: values.estimated_location?.trim() || null,
    delivery_zone_id: values.delivery_zone_id ?? null,
    notes: values.notes?.trim() || null,
    valid_until: values.valid_until?.trim() || null,
  };
}
