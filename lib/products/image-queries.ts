import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ProductImage } from "@/lib/supabase/types";

export async function getProductImages(
  productId: string,
): Promise<ProductImage[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order")
    .order("created_at");

  if (error) {
    console.error("[getProductImages]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getProductImagesByProductIds(
  productIds: string[],
): Promise<Map<string, ProductImage[]>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order")
    .order("created_at");

  if (error) {
    console.error("[getProductImagesByProductIds]", error.message);
    return new Map();
  }

  const map = new Map<string, ProductImage[]>();
  for (const image of data ?? []) {
    const current = map.get(image.product_id) ?? [];
    current.push(image);
    map.set(image.product_id, current);
  }

  return map;
}
