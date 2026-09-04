"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { ProductCategory } from "@/lib/supabase/types";
import { CategoryCombobox } from "@/components/products/category-combobox";
import { QuickCategoryModal } from "@/components/products/quick-category-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CategoryFieldProps = {
  value?: number;
  onChange: (categoryId: number, category?: ProductCategory) => void;
  defaultCategory?: ProductCategory;
  id?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
};

export function CategoryField({
  value,
  onChange,
  defaultCategory,
  id = "category_id",
  disabled = false,
  error,
  required = true,
}: CategoryFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [createdCategory, setCreatedCategory] = useState<ProductCategory>();

  const activeCategory =
    createdCategory && createdCategory.id === value
      ? createdCategory
      : defaultCategory;

  function handleCreated(category: ProductCategory) {
    setCreatedCategory(category);
    onChange(category.id, category);
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={id}>
          Categoría
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <CategoryCombobox
              id={id}
              value={value ? String(value) : undefined}
              defaultCategory={activeCategory}
              onValueChange={(categoryId, category) => {
                const numericId = Number(categoryId);
                if (!Number.isFinite(numericId)) return;
                onChange(numericId, category);
              }}
              onCreateNew={() => setModalOpen(true)}
              disabled={disabled}
              triggerClassName="w-full min-w-0"
            />
          </div>
          <Button
            type="button"
            variant="add"
            size="icon"
            aria-label="Nueva categoría"
            disabled={disabled}
            onClick={() => setModalOpen(true)}
          >
            <Plus />
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <QuickCategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreated={handleCreated}
      />
    </>
  );
}
