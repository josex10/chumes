import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { BankAccount } from "@/lib/supabase/types";

export async function getBankAccounts(): Promise<BankAccount[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getBankAccounts]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getBankAccountById(id: number): Promise<BankAccount | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getBankAccountById]", error.message);
    return null;
  }

  return data;
}
