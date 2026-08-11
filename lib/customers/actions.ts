"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  customerFormSchema,
  toCustomerPayload,
  type CustomerFormValues,
} from "@/lib/customers/schema";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

type ParseResult =
  | { ok: true; data: ReturnType<typeof toCustomerPayload> }
  | { ok: false; error: string };

function parseFormValues(values: CustomerFormValues): ParseResult {
  const parsed = customerFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  return { ok: true, data: toCustomerPayload(parsed.data) };
}

export async function createCustomer(
  values: CustomerFormValues,
): Promise<ActionResult> {
  const parsed = parseFormValues(values);

  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("customers").insert(parsed.data);

  if (error) {
    console.error("[createCustomer]", error.message);
    return { success: false, error: "Could not create customer." };
  }

  revalidatePath("/customers");
  return { success: true };
}

export async function updateCustomer(
  id: string,
  values: CustomerFormValues,
): Promise<ActionResult> {
  const parsed = parseFormValues(values);

  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("customers")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("[updateCustomer]", error.message);
    return { success: false, error: "Could not update customer." };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}/edit`);
  return { success: true };
}
