import type { ReactNode } from "react";
import Link from "next/link";
import {
  CATALOG_PRICE_FILTERS,
  CATALOG_TYPE_FILTERS,
  catalogHref,
  getCategorySlug,
  sortCatalogCategories,
  type CatalogFilters,
} from "@/lib/storefront/catalog";
import type { ProductCategory } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type CatalogFiltersProps = {
  categories: ProductCategory[];
  filters: CatalogFilters;
};

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-brand bg-brand text-ivory"
          : "border-arena bg-ivory text-charcoal hover:border-brand/40",
      )}
    >
      {children}
    </Link>
  );
}

export function CatalogFilters({ categories, filters }: CatalogFiltersProps) {
  const ordered = sortCatalogCategories(categories);
  const current = {
    categoria: filters.category ? getCategorySlug(filters.category) : null,
    tipo: filters.typeSlug,
    precio: filters.priceSlug,
  };

  return (
    <div className="space-y-5">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        <Chip href={catalogHref({ ...current, categoria: null })} active={!filters.category}>
          Todos
        </Chip>
        {ordered.map((category) => {
          const slug = getCategorySlug(category);
          return (
            <Chip
              key={category.id}
              href={catalogHref({ ...current, categoria: slug })}
              active={filters.category?.id === category.id}
            >
              {category.name}
            </Chip>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip href={catalogHref({ ...current, tipo: null })} active={!filters.typeSlug}>
          Todo el equipo
        </Chip>
        {CATALOG_TYPE_FILTERS.map((item) => (
          <Chip
            key={item.slug}
            href={catalogHref({ ...current, tipo: item.slug })}
            active={filters.typeSlug === item.slug}
          >
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip href={catalogHref({ ...current, precio: null })} active={!filters.priceSlug}>
          Cualquier precio
        </Chip>
        {CATALOG_PRICE_FILTERS.map((item) => (
          <Chip
            key={item.slug}
            href={catalogHref({ ...current, precio: item.slug })}
            active={filters.priceSlug === item.slug}
          >
            {item.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
