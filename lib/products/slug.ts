import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureUniqueProductSlug(
  name: string,
  excludeProductId?: string,
): Promise<string> {
  const base = slugify(name) || "producto";
  const supabase = createAdminSupabaseClient();
  let slug = base;
  let counter = 1;

  while (true) {
    let query = supabase.from("products").select("id").eq("slug", slug);
    if (excludeProductId) {
      query = query.neq("id", excludeProductId);
    }

    const { data } = await query.maybeSingle();
    if (!data) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter += 1;
  }
}
