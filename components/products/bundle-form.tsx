"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createBundle, updateBundle } from "@/lib/products/actions";
import {
  bundleFormSchema,
  type BundleFormValues,
} from "@/lib/products/schema";
import type { Product, ProductCategory } from "@/lib/supabase/types";
import { ProductCombobox } from "@/components/quotes/product-combobox";
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

type BundleFormProps = {
  categories: ProductCategory[];
  componentProducts?: Product[];
  initialValues?: Partial<BundleFormValues>;
  bundleId?: string;
};

export function BundleForm({
  categories,
  componentProducts = [],
  initialValues,
  bundleId,
}: BundleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(bundleId);

  const form = useForm<BundleFormValues>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      category_id: initialValues?.category_id,
      rental_available: initialValues?.rental_available ?? true,
      sale_available: initialValues?.sale_available ?? false,
      rental_price: initialValues?.rental_price,
      sale_price: initialValues?.sale_price,
      is_active: initialValues?.is_active ?? true,
      is_public: initialValues?.is_public ?? false,
      slug: initialValues?.slug ?? "",
      components: initialValues?.components?.length
        ? initialValues.components
        : [{ component_product_id: "", quantity: 1 }],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "components",
  });

  const rentalAvailable = watch("rental_available");
  const saleAvailable = watch("sale_available");

  function onSubmit(values: BundleFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateBundle(bundleId!, values)
        : await createBundle(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push(
        isEditing ? `/products/${bundleId}/edit` : `/products/${result.productId}/edit`,
      );
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit bundle" : "New bundle"}</CardTitle>
        <CardDescription>
          Bundles do not hold their own stock. Availability is derived from
          component products.
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Components</Label>
              <Button
                type="button"
                variant="add"
                size="sm"
                onClick={() =>
                  append({ component_product_id: "", quantity: 1 })
                }
              >
                Add component
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_140px_auto]"
              >
                <div className="space-y-2">
                  <Label htmlFor={`component-${index}`}>Product</Label>
                  <Controller
                    control={control}
                    name={`components.${index}.component_product_id`}
                    render={({ field: componentField }) => (
                      <ProductCombobox
                        id={`component-${index}`}
                        source="simple"
                        excludeId={bundleId}
                        value={componentField.value || undefined}
                        defaultProduct={componentProducts.find(
                          (product) => product.id === componentField.value,
                        )}
                        onValueChange={componentField.onChange}
                      />
                    )}
                  />
                  {errors.components?.[index]?.component_product_id && (
                    <p className="text-sm text-destructive">
                      {
                        errors.components[index]?.component_product_id
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    {...register(`components.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.components?.[index]?.quantity && (
                    <p className="text-sm text-destructive">
                      {errors.components[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {errors.components && !Array.isArray(errors.components) && (
              <p className="text-sm text-destructive">
                {errors.components.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} />
            Active bundle
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_public")} />
            Visible in public catalog
          </label>

          <div className="space-y-2">
            <Label htmlFor="slug">Public slug</Label>
            <Input
              id="slug"
              placeholder="Auto-generated if empty"
              {...register("slug")}
            />
          </div>

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
                  : "Create bundle"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
