"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PricingFields } from "@/components/products/pricing-fields";
import { updateBundleDetails } from "@/lib/products/actions";
import {
  bundleDetailsSchema,
  type BundleDetailsValues,
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

type BundleDetailsTabProps = {
  bundleId: string;
  categories: ProductCategory[];
  componentProducts: Product[];
  initialValues: BundleDetailsValues;
};

export function BundleDetailsTab({
  bundleId,
  categories,
  componentProducts,
  initialValues,
}: BundleDetailsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<BundleDetailsValues>({
    resolver: zodResolver(bundleDetailsSchema),
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "components",
  });

  function onSubmit(values: BundleDetailsValues) {
    setSubmitError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateBundleDetails(bundleId, values);
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
        <CardTitle>Configuración del paquete</CardTitle>
        <CardDescription>
          Componentes, precios y detalles de este paquete comercial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} />
              {typeof errors.name?.message === "string" ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría</Label>
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
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" rows={3} {...register("description")} />
            </div>
          </div>

          <div className="space-y-4 border-t border-border/60 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Componentes</h3>
                <p className="text-sm text-muted-foreground">
                  Productos simples que conforman este paquete.
                </p>
              </div>
              <Button
                type="button"
                variant="add"
                size="sm"
                onClick={() => append({ component_product_id: "", quantity: 1 })}
              >
                Agregar componente
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border border-border/70 p-4 lg:grid-cols-[1fr_140px_auto]"
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
                  Quitar
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 pt-8">
            <PricingFields
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              showReplacementCost={false}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
          {saved ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Paquete guardado.
            </p>
          ) : null}

          <div className="flex justify-end border-t border-border/60 pt-6">
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar paquete"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
