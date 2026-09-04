"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layers } from "lucide-react";
import { createCategoryAndFetch } from "@/lib/products/actions";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/products/schema";
import type { ProductCategory } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type QuickCategoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: ProductCategory) => void;
};

const EMPTY_VALUES: CategoryFormValues = {
  name: "",
  description: "",
  is_active: true,
};

export function QuickCategoryModal({
  open,
  onOpenChange,
  onCreated,
}: QuickCategoryModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) {
      reset(EMPTY_VALUES);
    }
  }, [open, reset]);

  function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      const result = await createCategoryAndFetch(values);
      if (!result.success || !result.category) {
        form.setError("root", {
          message: result.success
            ? "No se pudo cargar la categoría."
            : result.error,
        });
        return;
      }

      onCreated(result.category);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="size-4 text-action-add" />
            Nueva categoría
          </DialogTitle>
          <DialogDescription>
            El código se genera automáticamente a partir del nombre.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-category-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quick-category-name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-category-description">Descripción</Label>
            <Textarea
              id="quick-category-description"
              rows={2}
              {...register("description")}
            />
          </div>

          {errors.root ? (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
