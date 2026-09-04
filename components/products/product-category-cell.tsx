"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProductCategory } from "@/lib/products/actions";
import type { ProductCategory } from "@/lib/supabase/types";
import { CategoryCombobox } from "@/components/products/category-combobox";
import { QuickCategoryModal } from "@/components/products/quick-category-modal";

type ProductCategoryCellProps = {
  productId: string;
  category: ProductCategory;
};

export function ProductCategoryCell({
  productId,
  category: initialCategory,
}: ProductCategoryCellProps) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [createdCategory, setCreatedCategory] = useState<ProductCategory>();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const activeCategory =
    createdCategory && createdCategory.id === category.id
      ? createdCategory
      : category;

  function assignCategory(next: ProductCategory) {
    if (next.id === category.id) {
      return;
    }

    const previous = category;
    setCategory(next);
    setError(null);

    startTransition(async () => {
      const result = await updateProductCategory(productId, next.id);
      if (!result.success) {
        setCategory(previous);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleCreated(next: ProductCategory) {
    setCreatedCategory(next);
    assignCategory(next);
  }

  return (
    <div className="min-w-[200px]">
      <CategoryCombobox
        value={String(category.id)}
        defaultCategory={activeCategory}
        disabled={isPending}
        onValueChange={(categoryId, nextCategory) => {
          if (!nextCategory) return;
          assignCategory(nextCategory);
        }}
        onCreateNew={() => setModalOpen(true)}
        triggerClassName="min-w-[180px]"
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
      <QuickCategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
