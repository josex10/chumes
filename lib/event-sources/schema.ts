import { z } from "zod";

export const eventSourceFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  code: z
    .string()
    .trim()
    .min(1, "El código es requerido")
    .regex(/^[A-Z0-9_]+$/, "Use solo letras mayúsculas, números y guiones bajos"),
  description: z.string().trim().optional(),
  is_active: z.boolean(),
  is_favorite: z.boolean(),
  sort_order: z.coerce.number().int().nonnegative(),
});

export type EventSourceFormValues = z.infer<typeof eventSourceFormSchema>;

export function toEventSourcePayload(values: EventSourceFormValues) {
  return {
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description?.trim() || null,
    is_active: values.is_active,
    is_favorite: values.is_favorite,
    sort_order: values.sort_order,
  };
}

export function slugifyEventSourceCode(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}
