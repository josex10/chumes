"use client";

import { useMemo } from "react";
import type { QuotableProduct } from "@/lib/supabase/types";
import { SearchCombobox } from "@/components/ui/search-combobox";

type ProductComboboxProps = {
  products: QuotableProduct[];
  value?: string;
  onValueChange: (productId: string) => void;
  disabled?: boolean;
  id?: string;
  onCreateNew?: () => void;
};

export function getProductDisplayLabel(product: QuotableProduct): string {
  return `${product.product_number} · ${product.name}`;
}

export function ProductCombobox({
  products,
  value,
  onValueChange,
  disabled = false,
  id,
  onCreateNew,
}: ProductComboboxProps) {
  const items = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: getProductDisplayLabel(product),
        searchText: `${product.product_number} ${product.name} ${product.description ?? ""}`,
        description: product.description ?? undefined,
      })),
    [products],
  );

  return (
    <SearchCombobox
      id={id}
      items={items}
      value={value}
      onValueChange={onValueChange}
      placeholder="Buscar producto..."
      searchPlaceholder="Código o descripción..."
      emptyMessage="No se encontraron productos."
      createLabel="Nuevo producto"
      disabled={disabled}
      triggerClassName="min-w-[220px]"
      onCreateNew={onCreateNew}
    />
  );
}
