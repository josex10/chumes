"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_SEARCH_DEBOUNCE_MS } from "@/lib/products/constants";
import {
  getProductCategoryByIdAction,
  searchProductCategoriesAction,
} from "@/lib/products/actions";
import type { ProductCategory } from "@/lib/supabase/types";
import {
  AsyncSearchCombobox,
  type AsyncSearchComboboxFetchResult,
} from "@/components/ui/async-search-combobox";

type CategoryComboboxProps = {
  value?: string;
  onValueChange: (categoryId: string, category?: ProductCategory) => void;
  defaultCategory?: ProductCategory;
  disabled?: boolean;
  id?: string;
  onCreateNew?: () => void;
  triggerClassName?: string;
};

function toComboboxItem(category: ProductCategory) {
  return {
    value: String(category.id),
    label: category.name,
    description: category.code,
  };
}

export function CategoryCombobox({
  value,
  onValueChange,
  defaultCategory,
  disabled = false,
  id,
  onCreateNew,
  triggerClassName,
}: CategoryComboboxProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
    defaultCategory?.name,
  );
  const categoriesByIdRef = useRef(new Map<string, ProductCategory>());

  if (defaultCategory) {
    categoriesByIdRef.current.set(String(defaultCategory.id), defaultCategory);
  }

  useEffect(() => {
    if (defaultCategory && String(defaultCategory.id) === value) {
      setSelectedLabel(defaultCategory.name);
      categoriesByIdRef.current.set(String(defaultCategory.id), defaultCategory);
    }
  }, [defaultCategory, value]);

  useEffect(() => {
    if (!value) {
      setSelectedLabel(undefined);
      return;
    }

    if (defaultCategory && String(defaultCategory.id) === value) {
      setSelectedLabel(defaultCategory.name);
      return;
    }

    const numericId = Number(value);
    if (!Number.isFinite(numericId)) {
      return;
    }

    let cancelled = false;

    void getProductCategoryByIdAction(numericId).then((category) => {
      if (!cancelled && category) {
        setSelectedLabel(category.name);
        categoriesByIdRef.current.set(String(category.id), category);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value, defaultCategory]);

  const handleFetch = useCallback(
    async (query: string, page: number): Promise<AsyncSearchComboboxFetchResult> => {
      const result = await searchProductCategoriesAction({ query, page });
      for (const category of result.categories) {
        categoriesByIdRef.current.set(String(category.id), category);
      }
      return {
        items: result.categories.map(toComboboxItem),
        hasMore: result.hasMore,
      };
    },
    [],
  );

  const pinnedItem = useMemo(() => {
    if (!value || !selectedLabel) return null;
    const pinned = categoriesByIdRef.current.get(value) ?? defaultCategory;
    return {
      value,
      label: selectedLabel,
      description: pinned?.code,
    };
  }, [value, selectedLabel, defaultCategory]);

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
        onValueChange(nextValue, categoriesByIdRef.current.get(nextValue));
      }}
      onFetch={handleFetchWithPinned}
      placeholder="Buscar categoría..."
      searchPlaceholder="Nombre o código..."
      emptyMessage="No se encontraron categorías."
      createLabel="Nueva categoría"
      disabled={disabled}
      onCreateNew={onCreateNew}
      triggerClassName={triggerClassName ?? "min-w-[180px]"}
      debounceMs={CATEGORY_SEARCH_DEBOUNCE_MS}
    />
  );
}
