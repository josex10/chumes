import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getPrimaryImageUrl } from "@/lib/products/images";
import { getProductImagesByProductIds } from "@/lib/products/image-queries";
import type {
  ProductCategory,
  ProductWithRelations,
  PublicProduct,
} from "@/lib/supabase/types";

async function attachPricesAndImages(
  products: ProductWithRelations[],
): Promise<PublicProduct[]> {
  if (products.length === 0) {
    return [];
  }

  const supabase = createAdminSupabaseClient();
  const productIds = products.map((product) => product.id);

  const [pricesResult, imagesByProductId] = await Promise.all([
    supabase
      .from("product_prices")
      .select("*, product_price_types(*)")
      .in("product_id", productIds)
      .is("effective_to", null),
    getProductImagesByProductIds(productIds),
  ]);

  if (pricesResult.error) {
    console.error("[getPublicProducts prices]", pricesResult.error.message);
  }

  const pricesByProduct = new Map<string, { rental: number | null; sale: number | null }>();
  for (const product of products) {
    pricesByProduct.set(product.id, { rental: null, sale: null });
  }

  for (const price of pricesResult.data ?? []) {
    const current = pricesByProduct.get(price.product_id) ?? { rental: null, sale: null };
    const code = price.product_price_types?.code;
    if (code === "RENTAL") current.rental = Number(price.amount);
    if (code === "SALE") current.sale = Number(price.amount);
    pricesByProduct.set(price.product_id, current);
  }

  return products.map((product) => {
    const productPrices = pricesByProduct.get(product.id) ?? { rental: null, sale: null };
    const images = imagesByProductId.get(product.id) ?? [];
    return {
      ...product,
      rental_price: productPrices.rental,
      sale_price: productPrices.sale,
      images,
      primary_image_url: getPrimaryImageUrl(images),
    };
  });
}

export async function getPublicProductCategories(): Promise<ProductCategory[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getPublicProductCategories]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getPublicProducts(options?: {
  categoryId?: number;
}): Promise<PublicProduct[]> {
  const supabase = createAdminSupabaseClient();
  let query = supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .eq("is_active", true)
    .eq("is_public", true)
    .order("sort_order")
    .order("name");

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getPublicProducts]", error.message);
    return [];
  }

  return attachPricesAndImages((data ?? []) as ProductWithRelations[]);
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<PublicProduct | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) {
    console.error("[getPublicProductBySlug]", error?.message);
    return null;
  }

  const [product] = await attachPricesAndImages([data as ProductWithRelations]);
  return product ?? null;
}

export async function getPublicProductsByIds(
  productIds: string[],
): Promise<PublicProduct[]> {
  if (productIds.length === 0) {
    return [];
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .in("id", productIds)
    .eq("is_active", true)
    .eq("is_public", true);

  if (error) {
    console.error("[getPublicProductsByIds]", error.message);
    return [];
  }

  return attachPricesAndImages((data ?? []) as ProductWithRelations[]);
}
