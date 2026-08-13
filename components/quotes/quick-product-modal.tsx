"use client";

import { useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductAndFetch } from "@/lib/products/actions";
import { productFormSchema, type ProductFormValues } from "@/lib/products/schema";
import type { ProductCategory, QuotableProduct } from "@/lib/supabase/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuickProductModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ProductCategory[];
  onCreated: (product: QuotableProduct) => void;
};

export function QuickProductModal({
  open,
  onOpenChange,
  categories,
  onCreated,
}: QuickProductModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: categories[0]?.id,
      rental_available: true,
      sale_available: false,
      rental_price: undefined,
      sale_price: undefined,
      is_active: true,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const rentalAvailable = watch("rental_available");
  const saleAvailable = watch("sale_available");

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        description: "",
        category_id: categories[0]?.id,
        rental_available: true,
        sale_available: false,
        rental_price: undefined,
        sale_price: undefined,
        is_active: true,
      });
    }
  }, [open, reset, categories]);

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const result = await createProductAndFetch(values);
      if (!result.success || !result.product) {
        form.setError("root", {
          message: result.success ? "Could not load product." : result.error,
        });
        return;
      }

      onCreated(result.product);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
          <DialogDescription>
            Agregue un producto sin salir de la cotización.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-product-name">Nombre *</Label>
            <Input id="quick-product-name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-product-category">Categoría *</Label>
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                  items={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                >
                  <SelectTrigger id="quick-product-category" className="w-full">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_id && (
              <p className="text-sm text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-product-description">Descripción</Label>
            <Textarea id="quick-product-description" rows={2} {...register("description")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("rental_available")} />
              Disponible alquiler
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("sale_available")} />
              Disponible venta
            </label>
          </div>

          {rentalAvailable && (
            <div className="space-y-2">
              <Label htmlFor="quick-product-rental-price">Precio alquiler *</Label>
              <Input
                id="quick-product-rental-price"
                type="number"
                min="0"
                step="0.01"
                className="tabular-nums"
                {...register("rental_price", { valueAsNumber: true })}
              />
              {errors.rental_price && (
                <p className="text-sm text-destructive">{errors.rental_price.message}</p>
              )}
            </div>
          )}

          {saleAvailable && (
            <div className="space-y-2">
              <Label htmlFor="quick-product-sale-price">Precio venta *</Label>
              <Input
                id="quick-product-sale-price"
                type="number"
                min="0"
                step="0.01"
                className="tabular-nums"
                {...register("sale_price", { valueAsNumber: true })}
              />
              {errors.sale_price && (
                <p className="text-sm text-destructive">{errors.sale_price.message}</p>
              )}
            </div>
          )}

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
