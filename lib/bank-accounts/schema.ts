import { z } from "zod";
import { BANK_ACCOUNT_KIND } from "@/lib/bank-accounts/constants";

export const bankAccountFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  bank_name: z.string().trim().min(1, "La entidad bancaria es requerida"),
  account_number: z.string().trim().min(1, "El número de cuenta es requerido"),
  kind: z.enum([BANK_ACCOUNT_KIND.OPERATING, BANK_ACCOUNT_KIND.ADVANCES]),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().nonnegative(),
});

export type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>;

export function toBankAccountPayload(values: BankAccountFormValues) {
  return {
    name: values.name.trim(),
    bank_name: values.bank_name.trim(),
    account_number: values.account_number.trim(),
    kind: values.kind,
    is_active: values.is_active,
    sort_order: values.sort_order,
  };
}
