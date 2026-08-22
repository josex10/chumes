"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRODUCT_SEARCH_DEBOUNCE_MS } from "@/lib/products/constants";
import {
  getProductByIdAction,
  searchQuotableProductsAction,
  searchSimpleProductsAction,
} from "@/lib/products/actions";
import type { ProductWithRelations, QuotableProduct } from "@/lib/supabase/types";
import {
  AsyncSearchCombobox,
  type AsyncSearchComboboxFetchResult,
} from "@/components/ui/async-search-combobox";

type ProductOption = Pick<ProductWithRelations, "id" | "name" | "product_number"> &
  Partial<Pick<QuotableProduct, "description" | "rental_price" | "sale_price">>;

type ProductComboboxProps = {
  value?: string;
  onValueChange: (productId: string, product?: QuotableProduct) => void;
  defaultProduct?: ProductOption;
  disabled?: boolean;
  id?: string;
  onCreateNew?: () => void;
  source?: "quotable" | "simple";
  excludeId?: string;
};

export function getProductDisplayLabel(product: ProductOption): string {
  return `${product.product_number} · ${product.name}`;
}

function toComboboxItem(product: ProductOption) {
  return {
    value: product.id,
    label: getProductDisplayLabel(product),
    description: product.description ?? undefined,
  };
}

export function ProductCombobox({
  value,
  onValueChange,
  defaultProduct,
  disabled = false,
  id,
  onCreateNew,
  source = "quotable",
  excludeId,
}: ProductComboboxProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
    defaultProduct ? getProductDisplayLabel(defaultProduct) : undefined,
  );
  const productsByIdRef = useRef(new Map<string, QuotableProduct>());

  useEffect(() => {
    if (defaultProduct && defaultProduct.id === value) {
      setSelectedLabel(getProductDisplayLabel(defaultProduct));
    }
  }, [defaultProduct, value]);

  useEffect(() => {
    if (!value) {
      setSelectedLabel(undefined);
      return;
    }

    if (defaultProduct?.id === value) {
      setSelectedLabel(getProductDisplayLabel(defaultProduct));
      return;
    }

    let cancelled = false;

    void getProductByIdAction(value).then((product) => {
      if (!cancelled && product) {
        setSelectedLabel(getProductDisplayLabel(product));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value, defaultProduct]);

  const handleFetch = useCallback(
    async (query: string, page: number): Promise<AsyncSearchComboboxFetchResult> => {
      if (source === "simple") {
        const result = await searchSimpleProductsAction({
          query,
          page,
          excludeId,
        });
        return {
          items: result.products.map(toComboboxItem),
          hasMore: result.hasMore,
        };
      }

      const result = await searchQuotableProductsAction({ query, page });
      for (const product of result.products) {
        productsByIdRef.current.set(product.id, product);
      }
      return {
        items: result.products.map(toComboboxItem),
        hasMore: result.hasMore,
      };
    },
    [source, excludeId],
  );

  const pinnedItem = useMemo(() => {
    if (!value || !selectedLabel) return null;
    return {
      value,
      label: selectedLabel,
      description: defaultProduct?.description ?? undefined,
    };
  }, [value, selectedLabel, defaultProduct]);

  const handleFetchWithPinned = useCallback(
    async (query: string, page: number): Promise<AsyncSearchComboboxFetchResult> => {
      const result = await handleFetch(query, page);
      if (!pinnedItem || page !== 1) {
        return result;
      }

      const alreadyIncluded = result.items.some((item) => item.value === pinnedItem.value);
      if (alreadyIncluded) {
        return result;
      }

      return {
        ...result,
        items: [pinnedItem, ...result.items],
      };
    },
    [handleFetch, pinnedItem],
  );

  return (
    <AsyncSearchCombobox
      id={id}
      value={value}
      selectedLabel={selectedLabel}
      onValueChange={(nextValue, item) => {
        if (item) {
          setSelectedLabel(item.label);
        }
        onValueChange(nextValue, productsByIdRef.current.get(nextValue));
      }}
      onFetch={handleFetchWithPinned}
      placeholder="Buscar producto..."
      searchPlaceholder="Código o nombre..."
      emptyMessage="No se encontraron productos."
      createLabel="Nuevo producto"
      disabled={disabled}
      onCreateNew={onCreateNew}
      triggerClassName="min-w-[220px]"
      debounceMs={PRODUCT_SEARCH_DEBOUNCE_MS}
    />
  );
}
