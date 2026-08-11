import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";

export async function getCustomerTypes(): Promise<CustomerType[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customer_types")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getCustomerTypes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCustomers(): Promise<CustomerWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*, customer_types(*)")
    .order("name");

  if (error) {
    console.error("[getCustomers]", error.message);
    return [];
  }

  return (data ?? []) as CustomerWithRelations[];
}

export async function getCustomerById(
  id: string,
): Promise<CustomerWithRelations | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*, customer_types(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getCustomerById]", error.message);
    return null;
  }

  return data as CustomerWithRelations | null;
}
