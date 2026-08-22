"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, Tags, X } from "lucide-react";
import { PRODUCT_SEARCH_DEBOUNCE_MS } from "@/lib/products/constants";
import type { ProductCategory } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductsFiltersProps = {
  categories: ProductCategory[];
  initialQuery?: string;
  initialCategoryId?: string;
};

const ALL_CATEGORIES = "all";

function buildFilterParams(query: string, categoryId: string) {
  const params = new URLSearchParams();
  const trimmed = query.trim();

  if (trimmed) {
    params.set("q", trimmed);
  }

  if (categoryId && categoryId !== ALL_CATEGORIES) {
    params.set("category", categoryId);
  }

  return params;
}

export function ProductsFilters({
  categories,
  initialQuery = "",
  initialCategoryId = ALL_CATEGORIES,
}: ProductsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const skipInitialSearchNavigation = useRef(true);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    if (skipInitialSearchNavigation.current) {
      skipInitialSearchNavigation.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const params = buildFilterParams(query, categoryId);
      const nextFilters = params.toString();
      const currentFilters = buildFilterParams(
        searchParams.get("q") ?? "",
        searchParams.get("category") ?? ALL_CATEGORIES,
      ).toString();

      if (nextFilters === currentFilters) {
        return;
      }

      router.push(nextFilters ? `${pathname}?${nextFilters}` : pathname);
    }, PRODUCT_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, pathname, router, categoryId]);

  function handleCategoryChange(value: string | null) {
    const nextCategory = value ?? ALL_CATEGORIES;
    setCategoryId(nextCategory);

    const params = buildFilterParams(query, nextCategory);
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  }

  function clearFilters() {
    setQuery("");
    setCategoryId(ALL_CATEGORIES);
    router.push(pathname);
  }

  const hasActiveFilters =
    query.trim().length > 0 || (categoryId && categoryId !== ALL_CATEGORIES);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <Filter className="size-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-end">
          <div className="grid gap-2">
            <Label
              htmlFor="products-search"
              className="inline-flex h-5 items-center gap-1.5"
            >
              <Search className="size-3.5" />
              Buscar
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="products-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nombre o código de producto..."
                className="h-9 pl-9"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="products-category"
              className="inline-flex h-5 items-center gap-1.5"
            >
              <Tags className="size-3.5" />
              Categoría
            </Label>
            <Select
              value={categoryId || ALL_CATEGORIES}
              onValueChange={handleCategoryChange}
              items={[
                { value: ALL_CATEGORIES, label: "Todas las categorías" },
                ...categories.map((category) => ({
                  value: String(category.id),
                  label: category.name,
                })),
              ]}
            >
              <SelectTrigger id="products-category" className="h-9 w-full">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="inline-flex h-9 items-center gap-1.5"
              onClick={clearFilters}
            >
              <X className="size-4" />
              Limpiar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
