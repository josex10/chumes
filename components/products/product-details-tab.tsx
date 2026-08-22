"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PricingFields } from "@/components/products/pricing-fields";
import { updateProductDetails } from "@/lib/products/actions";
import {
  productDetailsSchema,
  type ProductDetailsValues,
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

type ProductDetailsTabProps = {
  productId: string;
  categories: ProductCategory[];
  initialValues: ProductDetailsValues;
};

export function ProductDetailsTab({
  productId,
  categories,
  initialValues,
}: ProductDetailsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<ProductDetailsValues>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues: initialValues,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  register("rental_available");
  register("sale_available");

  function onSubmit(values: ProductDetailsValues) {
    setSubmitError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProductDetails(productId, values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuración del producto</CardTitle>
        <CardDescription>
          Detalles básicos y precios usados en cotizaciones y el catálogo público.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
              {typeof errors.name?.message === "string" ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">
                Categoría <span className="text-destructive">*</span>
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
                      <SelectValue placeholder="Seleccione una categoría" />
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
              {typeof errors.category_id?.message === "string" ? (
                <p className="text-sm text-destructive">
                  {errors.category_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={4} {...register("description")} />
            </div>
          </div>

          <div className="border-t border-border/60 pt-8">
            <PricingFields
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
          {saved ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Producto guardado.
            </p>
          ) : null}

          <div className="flex justify-end border-t border-border/60 pt-6">
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
