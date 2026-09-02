"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  bankAccountFormSchema,
  toBankAccountPayload,
  type BankAccountFormValues,
} from "@/lib/bank-accounts/schema";

type ActionResult =
  | { success: true; accountId?: number }
  | { success: false; error: string };

function revalidateAccountPaths(accountId?: number) {
  revalidatePath("/events", "layout");
  revalidatePath("/events/settings/accounts");
  if (accountId) {
    revalidatePath(`/events/settings/accounts/${accountId}/edit`);
  }
}

export async function createBankAccount(
  values: BankAccountFormValues,
): Promise<ActionResult> {
  const parsed = bankAccountFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .insert(toBankAccountPayload(parsed.data))
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createBankAccount]", error?.message);
    return { success: false, error: "No se pudo crear la cuenta." };
  }

  revalidateAccountPaths(data.id);
  return { success: true, accountId: data.id };
}

export async function updateBankAccount(
  id: number,
  values: BankAccountFormValues,
): Promise<ActionResult> {
  const parsed = bankAccountFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("bank_accounts")
    .update(toBankAccountPayload(parsed.data))
    .eq("id", id);

  if (error) {
    console.error("[updateBankAccount]", error.message);
    return { success: false, error: "No se pudo actualizar la cuenta." };
  }

  revalidateAccountPaths(id);
  return { success: true, accountId: id };
}

export async function toggleBankAccountActive(
  id: number,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("bank_accounts")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[toggleBankAccountActive]", error.message);
    return { success: false, error: "No se pudo actualizar el estado." };
  }

  revalidateAccountPaths(id);
  return { success: true, accountId: id };
}
