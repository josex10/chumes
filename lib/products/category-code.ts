import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export function toCategoryCode(name: string): string {
  const code = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return code || "CATEGORY";
}

export async function ensureUniqueCategoryCode(name: string): Promise<string> {
  const base = toCategoryCode(name);
  const supabase = createAdminSupabaseClient();
  let code = base;
  let counter = 2;

  while (true) {
    const { data, error } = await supabase
      .from("product_categories")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      console.error("[ensureUniqueCategoryCode]", error.message);
      throw error;
    }

    if (!data) {
      return code;
    }

    code = `${base}_${counter}`;
    counter += 1;
  }
}
