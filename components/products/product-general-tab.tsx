"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProductGeneral } from "@/lib/products/actions";
import {
  productGeneralSchema,
  type ProductGeneralValues,
} from "@/lib/products/schema";
import type { ProductCategory } from "@/lib/supabase/types";
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

type ProductGeneralTabProps = {
  productId: string;
  categories: ProductCategory[];
  initialValues: ProductGeneralValues;
};

export function ProductGeneralTab({
  productId,
  categories,
  initialValues,
}: ProductGeneralTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<ProductGeneralValues>({
    resolver: zodResolver(productGeneralSchema),
    defaultValues: initialValues,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(values: ProductGeneralValues) {
    setSubmitError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProductGeneral(productId, values);
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
        <CardTitle>General information</CardTitle>
        <CardDescription>
          Basic product details used across quotes and the catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
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
            {errors.category_id ? (
              <p className="text-sm text-destructive">
                {errors.category_id.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
          {saved ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Changes saved.
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Saving..." : "Save general info"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
