import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { computeBundleAvailability } from "@/lib/products/bundle-availability";
import {
  PRODUCT_COMBOBOX_PAGE_SIZE,
  PRODUCT_LIST_PAGE_SIZE,
  PRODUCT_TYPE,
} from "@/lib/products/constants";
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
  rental_price: number | null;
  sale_price: number | null;
};

export type SearchProductsParams = {
  query?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
  excludeId?: string;
};

export type SearchProductsResult = {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SearchQuotableProductsResult = {
  products: QuotableProduct[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type SearchSimpleProductsResult = {
  products: ProductWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function buildProductSearchFilter(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "";

  const escaped = escapeIlikePattern(trimmed);
  const pattern = `%${escaped}%`;
  return [`name.ilike.${pattern}`, `product_number.ilike.${pattern}`].join(",");
}

async function getStockByProductId(
  productIds?: string[],
): Promise<Map<string, number>> {
  if (productIds && productIds.length === 0) {
    return new Map();
  }

  const supabase = createAdminSupabaseClient();
  let builder = supabase
    .from("product_stock_balances")
    .select("product_id, balance");

  if (productIds) {
    builder = builder.in("product_id", productIds);
  }

  const { data, error } = await builder;

  if (error) {
    console.error("[getStockByProductId]", error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [row.product_id, Number(row.balance)]),
  );
}

async function withStock(
  products: Array<
    ProductWithRelations & {
      rental_price?: number | null;
      sale_price?: number | null;
    }
  >,
): Promise<ProductListItem[]> {
  if (products.length === 0) {
    return [];
  }

  const supabase = createAdminSupabaseClient();
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
      console.error("[withStock] bundle items", error.message);
    } else {
      for (const item of bundleItems ?? []) {
        const current = bundleItemsByProductId.get(item.bundle_product_id) ?? [];
        current.push(item);
        bundleItemsByProductId.set(item.bundle_product_id, current);
      }
    }
  }

  const stockIds = [
    ...products.map((product) => product.id),
    ...[...bundleItemsByProductId.values()].flatMap((items) =>
      items.map((item) => item.component_product_id),
    ),
  ];
  const stockByProductId = await getStockByProductId(stockIds);

  return products.map((product) => {
    const prices = {
      rental_price: product.rental_price ?? null,
      sale_price: product.sale_price ?? null,
    };

    if (product.product_types.code === PRODUCT_TYPE.BUNDLE) {
      const components = bundleItemsByProductId.get(product.id) ?? [];
      return {
        ...product,
        ...prices,
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
      ...prices,
      stock: stockByProductId.get(product.id) ?? 0,
    };
  });
}

async function attachPricesToListItems(
  products: ProductWithRelations[],
): Promise<Array<ProductWithRelations & { rental_price: number | null; sale_price: number | null }>> {
  if (products.length === 0) {
    return [];
  }

  const supabase = createAdminSupabaseClient();
  const productIds = products.map((product) => product.id);
  const { data: prices, error: pricesError } = await supabase
    .from("product_prices")
    .select("*, product_price_types(*)")
    .in("product_id", productIds)
    .is("effective_to", null);

  if (pricesError) {
    console.error("[attachPricesToListItems]", pricesError.message);
  }

  const pricesByProduct = new Map<string, { rental: number | null; sale: number | null }>();
  for (const product of products) {
    pricesByProduct.set(product.id, { rental: null, sale: null });
  }

  for (const price of prices ?? []) {
    const current = pricesByProduct.get(price.product_id) ?? { rental: null, sale: null };
    const code = price.product_price_types?.code;
    if (code === "RENTAL") current.rental = Number(price.amount);
    if (code === "SALE") current.sale = Number(price.amount);
    pricesByProduct.set(price.product_id, current);
  }

  return products.map((product) => {
    const productPrices = pricesByProduct.get(product.id) ?? { rental: null, sale: null };
    return {
      ...product,
      rental_price: productPrices.rental,
      sale_price: productPrices.sale,
    };
  });
}

async function attachPricesToProducts(
  products: ProductWithRelations[],
): Promise<QuotableProduct[]> {
  const withPrices = await attachPricesToListItems(products);
  return withPrices.map((product) => ({
    ...product,
    rental_price: product.rental_price,
    sale_price: product.sale_price,
  }));
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

export async function searchProducts({
  query = "",
  categoryId,
  page = 1,
  pageSize = PRODUCT_LIST_PAGE_SIZE,
}: SearchProductsParams = {}): Promise<SearchProductsResult> {
  const supabase = createAdminSupabaseClient();
  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.max(1, pageSize);
  const offset = (normalizedPage - 1) * normalizedPageSize;
  const searchFilter = buildProductSearchFilter(query);

  let builder = supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
      { count: "exact" },
    )
    .order("name", { ascending: true });

  if (searchFilter) {
    builder = builder.or(searchFilter);
  }

  if (categoryId) {
    builder = builder.eq("category_id", categoryId);
  }

  const { data, error, count } = await builder.range(
    offset,
    offset + normalizedPageSize - 1,
  );

  if (error) {
    console.error("[searchProducts]", error.message);
    return {
      products: [],
      total: 0,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      hasMore: false,
    };
  }

  const total = count ?? 0;
  const withPrices = await attachPricesToListItems(
    (data ?? []) as ProductWithRelations[],
  );
  const products = await withStock(withPrices);

  return {
    products,
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    hasMore: normalizedPage * normalizedPageSize < total,
  };
}

/** @deprecated Use searchProducts() for paginated lists. */
export async function getProducts(): Promise<ProductListItem[]> {
  const { products } = await searchProducts({
    page: 1,
    pageSize: 1000,
  });
  return products;
}

export async function searchSimpleProducts({
  query = "",
  page = 1,
  pageSize = PRODUCT_COMBOBOX_PAGE_SIZE,
  excludeId,
}: SearchProductsParams = {}): Promise<SearchSimpleProductsResult> {
  const supabase = createAdminSupabaseClient();
  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.max(1, pageSize);
  const offset = (normalizedPage - 1) * normalizedPageSize;
  const searchFilter = buildProductSearchFilter(query);

  const { data: simpleType, error: typeError } = await supabase
    .from("product_types")
    .select("id")
    .eq("code", PRODUCT_TYPE.SIMPLE)
    .maybeSingle();

  if (typeError || !simpleType) {
    console.error("[searchSimpleProducts] type", typeError?.message);
    return {
      products: [],
      total: 0,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      hasMore: false,
    };
  }

  let builder = supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
      { count: "exact" },
    )
    .eq("is_active", true)
    .eq("product_type_id", simpleType.id)
    .order("name", { ascending: true });

  if (excludeId) {
    builder = builder.neq("id", excludeId);
  }

  if (searchFilter) {
    builder = builder.or(searchFilter);
  }

  const { data, error, count } = await builder.range(
    offset,
    offset + normalizedPageSize - 1,
  );

  if (error) {
    console.error("[searchSimpleProducts]", error.message);
    return {
      products: [],
      total: 0,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      hasMore: false,
    };
  }

  const total = count ?? 0;

  return {
    products: (data ?? []) as ProductWithRelations[],
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    hasMore: normalizedPage * normalizedPageSize < total,
  };
}

export async function searchSimpleProductsForCombobox(
  params: SearchProductsParams,
): Promise<SearchSimpleProductsResult> {
  return searchSimpleProducts({
    ...params,
    pageSize: params.pageSize ?? PRODUCT_COMBOBOX_PAGE_SIZE,
  });
}

/** @deprecated Use searchSimpleProducts() for paginated lists. */
export async function getSimpleProducts(): Promise<ProductWithRelations[]> {
  const { products } = await searchSimpleProducts({
    page: 1,
    pageSize: 1000,
  });
  return products;
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

export async function searchQuotableProducts({
  query = "",
  page = 1,
  pageSize = PRODUCT_COMBOBOX_PAGE_SIZE,
}: SearchProductsParams = {}): Promise<SearchQuotableProductsResult> {
  const supabase = createAdminSupabaseClient();
  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.max(1, pageSize);
  const offset = (normalizedPage - 1) * normalizedPageSize;
  const searchFilter = buildProductSearchFilter(query);

  let builder = supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (searchFilter) {
    builder = builder.or(searchFilter);
  }

  const { data, error, count } = await builder.range(
    offset,
    offset + normalizedPageSize - 1,
  );

  if (error) {
    console.error("[searchQuotableProducts]", error.message);
    return {
      products: [],
      total: 0,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      hasMore: false,
    };
  }

  const total = count ?? 0;
  const products = await attachPricesToProducts(
    (data ?? []) as ProductWithRelations[],
  );

  return {
    products,
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    hasMore: normalizedPage * normalizedPageSize < total,
  };
}

export async function searchQuotableProductsForCombobox(
  params: SearchProductsParams,
): Promise<SearchQuotableProductsResult> {
  return searchQuotableProducts({
    ...params,
    pageSize: params.pageSize ?? PRODUCT_COMBOBOX_PAGE_SIZE,
  });
}

/** @deprecated Use searchQuotableProducts() for paginated lists. */
export async function getQuotableProducts(): Promise<QuotableProduct[]> {
  const { products } = await searchQuotableProducts({
    page: 1,
    pageSize: 1000,
  });
  return products;
}

export async function getQuotableProductsByIds(
  ids: string[],
): Promise<QuotableProduct[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return [];
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, product_categories(*), product_types(*), product_tracking_types(*)",
    )
    .in("id", uniqueIds);

  if (error) {
    console.error("[getQuotableProductsByIds]", error.message);
    return [];
  }

  return attachPricesToProducts((data ?? []) as ProductWithRelations[]);
}

export async function getQuotableProductById(
  id: string,
): Promise<QuotableProduct | null> {
  const products = await getQuotableProductsByIds([id]);
  return products[0] ?? null;
}
