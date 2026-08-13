"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createProduct, updateProduct } from "@/lib/products/actions";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/products/schema";
import type { ProductCategory } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductFormProps = {
  categories: ProductCategory[];
  initialValues?: Partial<ProductFormValues>;
  productId?: string;
};

export function ProductForm({
  categories,
  initialValues,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(productId);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      category_id: initialValues?.category_id,
      rental_available: initialValues?.rental_available ?? true,
      sale_available: initialValues?.sale_available ?? false,
      minimum_stock: initialValues?.minimum_stock,
      rental_price: initialValues?.rental_price,
      sale_price: initialValues?.sale_price,
      replacement_cost: initialValues?.replacement_cost,
      is_active: initialValues?.is_active ?? true,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const rentalAvailable = watch("rental_available");
  const saleAvailable = watch("sale_available");

  function onSubmit(values: ProductFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(productId!, values)
        : await createProduct(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push(
        isEditing ? `/products/${productId}/edit` : `/products/${result.productId}/edit`,
      );
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit product" : "New product"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update product catalog details."
            : "Add a simple quantity-tracked product."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">
              Category <span className="text-destructive">*</span>
            </Label>
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
                  <SelectTrigger id="category_id" className="w-full">
                    <SelectValue placeholder="Select a category" />
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
              <p className="text-sm text-destructive">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("rental_available")} />
              Available for rental
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("sale_available")} />
              Available for sale
            </label>
          </div>

          {rentalAvailable && (
            <div className="space-y-2">
              <Label htmlFor="rental_price">Rental price</Label>
              <Input
                id="rental_price"
                type="number"
                min="0"
                step="0.01"
                {...register("rental_price", {
                  setValueAs: (value) =>
                    value === "" || Number.isNaN(Number(value))
                      ? undefined
                      : Number(value),
                })}
              />
              {errors.rental_price && (
                <p className="text-sm text-destructive">
                  {errors.rental_price.message}
                </p>
              )}
            </div>
          )}

          {saleAvailable && (
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale price</Label>
              <Input
                id="sale_price"
                type="number"
                min="0"
                step="0.01"
                {...register("sale_price", {
                  setValueAs: (value) =>
                    value === "" || Number.isNaN(Number(value))
                      ? undefined
                      : Number(value),
                })}
              />
              {errors.sale_price && (
                <p className="text-sm text-destructive">
                  {errors.sale_price.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Minimum stock</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                step="0.01"
                {...register("minimum_stock", {
                  setValueAs: (value) =>
                    value === "" || Number.isNaN(Number(value))
                      ? undefined
                      : Number(value),
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replacement_cost">Replacement cost</Label>
              <Input
                id="replacement_cost"
                type="number"
                min="0"
                step="0.01"
                {...register("replacement_cost", {
                  setValueAs: (value) =>
                    value === "" || Number.isNaN(Number(value))
                      ? undefined
                      : Number(value),
                })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} />
            Active product
          </label>

          {errors.rental_available && (
            <p className="text-sm text-destructive">
              {errors.rental_available.message}
            </p>
          )}

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Cancel
            </Link>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
