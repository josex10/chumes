import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { computeBundleAvailability } from "@/lib/products/bundle-availability";
import { PRODUCT_TYPE } from "@/lib/products/constants";
import type {
  ProductBundleItemWithRelations,
  ProductCategory,
  ProductPriceType,
  ProductPriceWithRelations,
  ProductTrackingType,
  ProductType,
  ProductWithRelations,
  QuotableProduct,
} from "@/lib/supabase/types";

export type ProductListItem = ProductWithRelations & {
  stock: number | null;
};

async function getStockByProductId(): Promise<Map<string, number>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_stock_balances")
    .select("product_id, balance");

  if (error) {
    console.error("[getStockByProductId]", error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [row.product_id, Number(row.balance)]),
  );
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getProductCategories]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getProductTypes(): Promise<ProductType[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_types")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getProductTypes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getProductTrackingTypes(): Promise<ProductTrackingType[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_tracking_types")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getProductTrackingTypes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getProductPriceTypes(): Promise<ProductPriceType[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_price_types")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getProductPriceTypes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getProducts(): Promise<ProductListItem[]> {
  const supabase = createAdminSupabaseClient();
  const [productsResult, stockByProductId] = await Promise.all([
    supabase
      .from("products")
      .select(
        "*, product_categories(*), product_types(*), product_tracking_types(*)",
      )
      .order("name"),
    getStockByProductId(),
  ]);

  if (productsResult.error) {
    console.error("[getProducts]", productsResult.error.message);
    return [];
  }

  const products = (productsResult.data ?? []) as ProductWithRelations[];
  const bundleItemsByProductId = new Map<string, ProductBundleItemWithRelations[]>();

  const bundleIds = products
    .filter((product) => product.product_types.code === PRODUCT_TYPE.BUNDLE)
    .map((product) => product.id);

  if (bundleIds.length > 0) {
    const { data: bundleItems, error } = await supabase
      .from("product_bundle_items")
      .select("*")
      .in("bundle_product_id", bundleIds);

    if (error) {
      console.error("[getProducts] bundle items", error.message);
    } else {
      for (const item of bundleItems ?? []) {
        const current = bundleItemsByProductId.get(item.bundle_product_id) ?? [];
        current.push(item);
        bundleItemsByProductId.set(item.bundle_product_id, current);
      }
    }
  }

  return products.map((product) => {
    if (product.product_types.code === PRODUCT_TYPE.BUNDLE) {
      const components = bundleItemsByProductId.get(product.id) ?? [];
      return {
        ...product,
        stock: computeBundleAvailability(
          components.map((component) => ({
            component_product_id: component.component_product_id,
            quantity: Number(component.quantity),
          })),
          stockByProductId,
        ),
      };
    }

    return {
      ...product,
      stock: stockByProductId.get(product.id) ?? 0,
    };
  });
}

export async function getSimpleProducts(): Promise<ProductWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getSimpleProducts]", error.message);
    return [];
  }

  return ((data ?? []) as ProductWithRelations[]).filter(
    (product) => product.product_types.code === PRODUCT_TYPE.SIMPLE,
  );
}

export async function getProductById(
  id: string,
): Promise<ProductWithRelations | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getProductById]", error.message);
    return null;
  }

  return data as ProductWithRelations | null;
}

export async function getProductPrices(
  productId: string,
): Promise<ProductPriceWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_prices")
    .select("*, product_price_types(*)")
    .eq("product_id", productId)
    .is("effective_to", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProductPrices]", error.message);
    return [];
  }

  return (data ?? []) as ProductPriceWithRelations[];
}

export async function getProductCosts(productId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_costs")
    .select("*")
    .eq("product_id", productId)
    .is("effective_to", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProductCosts]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getBundleComponents(
  bundleProductId: string,
): Promise<ProductBundleItemWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_bundle_items")
    .select("*, products!product_bundle_items_component_product_id_fkey(*)")
    .eq("bundle_product_id", bundleProductId)
    .order("created_at");

  if (error) {
    console.error("[getBundleComponents]", error.message);
    return [];
  }

  return (data ?? []) as ProductBundleItemWithRelations[];
}

export async function getProductStock(productId: string): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_stock_balances")
    .select("balance")
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    console.error("[getProductStock]", error.message);
    return 0;
  }

  return Number(data?.balance ?? 0);
}

export async function getBundleAvailability(
  bundleProductId: string,
): Promise<number> {
  const [components, stockByProductId] = await Promise.all([
    getBundleComponents(bundleProductId),
    getStockByProductId(),
  ]);

  return computeBundleAvailability(
    components.map((component) => ({
      component_product_id: component.component_product_id,
      quantity: Number(component.quantity),
    })),
    stockByProductId,
  );
}

export async function getQuotableProducts(): Promise<QuotableProduct[]> {
  const supabase = createAdminSupabaseClient();
  const { data: products, error } = await supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getQuotableProducts]", error.message);
    return [];
  }

  const productList = (products ?? []) as ProductWithRelations[];
  if (productList.length === 0) return [];

  const productIds = productList.map((p) => p.id);
  const { data: prices, error: pricesError } = await supabase
    .from("product_prices")
    .select("*, product_price_types(*)")
    .in("product_id", productIds)
    .is("effective_to", null);

  if (pricesError) {
    console.error("[getQuotableProducts prices]", pricesError.message);
  }

  const pricesByProduct = new Map<string, { rental: number | null; sale: number | null }>();
  for (const product of productList) {
    pricesByProduct.set(product.id, { rental: null, sale: null });
  }

  for (const price of prices ?? []) {
    const current = pricesByProduct.get(price.product_id) ?? { rental: null, sale: null };
    const code = price.product_price_types?.code;
    if (code === "RENTAL") current.rental = Number(price.amount);
    if (code === "SALE") current.sale = Number(price.amount);
    pricesByProduct.set(price.product_id, current);
  }

  return productList.map((product) => {
    const productPrices = pricesByProduct.get(product.id) ?? { rental: null, sale: null };
    return {
      ...product,
      rental_price: productPrices.rental,
      sale_price: productPrices.sale,
    };
  });
}


export async function getQuotableProductById(
  id: string,
): Promise<QuotableProduct | null> {
  const supabase = createAdminSupabaseClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !product) {
    console.error("[getQuotableProductById]", error?.message);
    return null;
  }

  const { data: prices, error: pricesError } = await supabase
    .from("product_prices")
    .select("*, product_price_types(*)")
    .eq("product_id", id)
    .is("effective_to", null);

  if (pricesError) {
    console.error("[getQuotableProductById prices]", pricesError.message);
  }

  let rentalPrice: number | null = null;
  let salePrice: number | null = null;

  for (const price of prices ?? []) {
    const code = price.product_price_types?.code;
    if (code === "RENTAL") rentalPrice = Number(price.amount);
    if (code === "SALE") salePrice = Number(price.amount);
  }

  return {
    ...(product as ProductWithRelations),
    rental_price: rentalPrice,
    sale_price: salePrice,
  };
}
