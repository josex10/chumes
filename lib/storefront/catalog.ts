import { PRODUCT_CATEGORY, PRODUCT_TYPE } from "@/lib/products/constants";
import { slugify } from "@/lib/products/slug";
import type { ProductCategory, PublicProduct } from "@/lib/supabase/types";

export const CATEGORY_SLUG_BY_CODE: Record<string, string> = {
  [PRODUCT_CATEGORY.TABLES]: "mesas",
  [PRODUCT_CATEGORY.CHAIRS]: "sillas",
  [PRODUCT_CATEGORY.TABLE_LINENS]: "manteleria",
  [PRODUCT_CATEGORY.CHAIR_COVERS]: "forros-de-silla",
  [PRODUCT_CATEGORY.DECORATION]: "decoracion",
  [PRODUCT_CATEGORY.ACCESSORIES]: "accesorios",
  [PRODUCT_CATEGORY.TENTS]: "toldos",
  [PRODUCT_CATEGORY.COCKTAIL_TABLES]: "mesas-cocteleras",
  [PRODUCT_CATEGORY.OTHER]: "otros",
};

export const CATEGORY_CODE_BY_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_BY_CODE).map(([code, slug]) => [slug, code]),
) as Record<string, string>;

const CATEGORY_CHIP_ORDER = [
  PRODUCT_CATEGORY.TABLES,
  PRODUCT_CATEGORY.CHAIRS,
  PRODUCT_CATEGORY.TABLE_LINENS,
  PRODUCT_CATEGORY.COCKTAIL_TABLES,
  PRODUCT_CATEGORY.TENTS,
  PRODUCT_CATEGORY.CHAIR_COVERS,
  PRODUCT_CATEGORY.DECORATION,
  PRODUCT_CATEGORY.ACCESSORIES,
  PRODUCT_CATEGORY.OTHER,
] as const;

export const CATALOG_TYPE_FILTERS = [
  { slug: "simple", label: "Productos", typeCode: PRODUCT_TYPE.SIMPLE },
  { slug: "combo", label: "Combos", typeCode: PRODUCT_TYPE.BUNDLE },
] as const;

export const CATALOG_PRICE_FILTERS = [
  { slug: "hasta-5000", label: "Hasta ₡5.000", min: 0, max: 5000 },
  { slug: "5000-15000", label: "₡5.000 – ₡15.000", min: 5000, max: 15000 },
  { slug: "mas-15000", label: "Más de ₡15.000", min: 15000, max: null },
] as const;

export type CatalogSearchParams = {
  categoria?: string;
  tipo?: string;
  precio?: string;
};

export type CatalogFilters = {
  category: ProductCategory | null;
  categoryParam: string | null;
  typeSlug: string | null;
  priceSlug: string | null;
};

export function getCategorySlug(category: ProductCategory): string {
  return (
    CATEGORY_SLUG_BY_CODE[category.code] ??
    (slugify(category.name) || String(category.id))
  );
}

export function sortCatalogCategories(categories: ProductCategory[]) {
  return [...categories].sort((left, right) => {
    const leftIndex = CATEGORY_CHIP_ORDER.indexOf(
      left.code as (typeof CATEGORY_CHIP_ORDER)[number],
    );
    const rightIndex = CATEGORY_CHIP_ORDER.indexOf(
      right.code as (typeof CATEGORY_CHIP_ORDER)[number],
    );
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });
}

export function resolveCatalogFilters(
  params: CatalogSearchParams,
  categories: ProductCategory[],
): CatalogFilters {
  const categoryParam = params.categoria?.trim() || null;
  let category: ProductCategory | null = null;

  if (categoryParam) {
    if (/^\d+$/.test(categoryParam)) {
      category = categories.find((item) => item.id === Number(categoryParam)) ?? null;
    } else {
      const code = CATEGORY_CODE_BY_SLUG[categoryParam];
      category =
        categories.find((item) => item.code === code) ??
        categories.find((item) => getCategorySlug(item) === categoryParam) ??
        null;
    }
  }

  const typeSlug =
    CATALOG_TYPE_FILTERS.some((item) => item.slug === params.tipo)
      ? params.tipo ?? null
      : null;
  const priceSlug =
    CATALOG_PRICE_FILTERS.some((item) => item.slug === params.precio)
      ? params.precio ?? null
      : null;

  return {
    category,
    categoryParam: category ? getCategorySlug(category) : categoryParam,
    typeSlug,
    priceSlug,
  };
}

export function catalogHref(filters: {
  categoria?: string | null;
  tipo?: string | null;
  precio?: string | null;
}): string {
  const search = new URLSearchParams();
  if (filters.categoria) search.set("categoria", filters.categoria);
  if (filters.tipo) search.set("tipo", filters.tipo);
  if (filters.precio) search.set("precio", filters.precio);
  const query = search.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

export function getCatalogUnitPrice(product: PublicProduct): number | null {
  if (product.rental_available && product.rental_price != null) {
    return product.rental_price;
  }
  if (product.sale_available && product.sale_price != null) {
    return product.sale_price;
  }
  return product.rental_price ?? product.sale_price;
}

export function filterCatalogProducts(
  products: PublicProduct[],
  filters: CatalogFilters,
): PublicProduct[] {
  const typeCode = CATALOG_TYPE_FILTERS.find(
    (item) => item.slug === filters.typeSlug,
  )?.typeCode;
  const price = CATALOG_PRICE_FILTERS.find((item) => item.slug === filters.priceSlug);

  return products.filter((product) => {
    if (filters.category && product.category_id !== filters.category.id) {
      return false;
    }
    if (typeCode && product.product_types.code !== typeCode) {
      return false;
    }
    if (price) {
      const amount = getCatalogUnitPrice(product);
      if (amount == null) {
        return false;
      }
      if (price.max == null) {
        return amount > price.min;
      }
      if (price.min === 0) {
        return amount <= price.max;
      }
      return amount >= price.min && amount <= price.max;
    }
    return true;
  });
}
