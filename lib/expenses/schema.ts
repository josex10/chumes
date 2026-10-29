import { z } from "zod";
import { fromDatetimeLocalValue } from "@/lib/events/format-dates";

const dateTimeField = z
  .string()
  .min(1, "La fecha es obligatoria")
  .refine((value) => fromDatetimeLocalValue(value) !== null, "Fecha inválida");

export function buildExpenseFormSchema(
  categories: { id: number; requires_detail: boolean }[],
) {
  return z
    .object({
      category_id: z
        .number({
          required_error: "Selecciona una categoría",
          invalid_type_error: "Selecciona una categoría",
        })
        .int()
        .positive("Selecciona una categoría"),
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
      spent_at: dateTimeField,
      detail: z.string().trim(),
    })
    .superRefine((data, context) => {
      const category = categories.find((item) => item.id === data.category_id);
      if (category?.requires_detail && data.detail.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["detail"],
          message: "Describe qué se compró",
        });
      }
    });
}

export type ExpenseFormValues = z.infer<ReturnType<typeof buildExpenseFormSchema>>;

export const expenseCategoryFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  requires_detail: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().nonnegative(),
});

export type ExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormSchema>;

export const companyPaymentMethodFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().nonnegative(),
});

export type CompanyPaymentMethodFormValues = z.infer<
  typeof companyPaymentMethodFormSchema
>;

export function toCategoryCode(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);

  return base || "CATEGORIA";
}
