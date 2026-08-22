"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBundleGeneral } from "@/lib/products/actions";
import {
  bundleGeneralSchema,
  type BundleGeneralValues,
} from "@/lib/products/schema";
import type { Product, ProductCategory } from "@/lib/supabase/types";
import { ProductCombobox } from "@/components/quotes/product-combobox";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BundleGeneralTabProps = {
  bundleId: string;
  categories: ProductCategory[];
  componentProducts: Product[];
  initialValues: BundleGeneralValues;
};

export function BundleGeneralTab({
  bundleId,
  categories,
  componentProducts,
  initialValues,
}: BundleGeneralTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<BundleGeneralValues>({
    resolver: zodResolver(bundleGeneralSchema),
    defaultValues: initialValues,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "components",
  });

  function onSubmit(values: BundleGeneralValues) {
    setSubmitError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateBundleGeneral(bundleId, values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bundle details</CardTitle>
        <CardDescription>
          Name, category, description, and component products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Components</Label>
              <Button
                type="button"
                variant="add"
                size="sm"
                onClick={() => append({ component_product_id: "", quantity: 1 })}
              >
                Add component
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_140px_auto]"
              >
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
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...register(`components.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
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
            ))}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
          {saved ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Bundle saved.
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Saving..." : "Save bundle"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
