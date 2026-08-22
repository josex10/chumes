"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Tag } from "lucide-react";
import { updateProductPricing } from "@/lib/products/actions";
import {
  productPricingSchema,
  type ProductPricingValues,
} from "@/lib/products/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProductPricingTabProps = {
  productId: string;
  initialValues: ProductPricingValues;
};

export function ProductPricingTab({
  productId,
  initialValues,
}: ProductPricingTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<ProductPricingValues>({
    resolver: zodResolver(productPricingSchema),
    defaultValues: initialValues,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  register("rental_available");
  register("sale_available");

  const rentalAvailable = watch("rental_available");
  const saleAvailable = watch("sale_available");

  function onSubmit(values: ProductPricingValues) {
    setSubmitError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProductPricing(productId, values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Tag className="size-4" />
            Pricing
          </CardTitle>
          <CardDescription>
            Configure rental and sale prices shown in quotes and the public catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="inline-flex rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setValue("rental_available", !rentalAvailable)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition",
                  rentalAvailable
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Rental
              </button>
              <button
                type="button"
                onClick={() => setValue("sale_available", !saleAvailable)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition",
                  saleAvailable
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sale
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {rentalAvailable ? (
                <div className="space-y-2 rounded-xl border border-border/70 p-4">
                  <Label htmlFor="rental_price">Rental price (CRC)</Label>
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
                  {errors.rental_price ? (
                    <p className="text-sm text-destructive">
                      {errors.rental_price.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {saleAvailable ? (
                <div className="space-y-2 rounded-xl border border-border/70 p-4">
                  <Label htmlFor="sale_price">Sale price (CRC)</Label>
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
                  {errors.sale_price ? (
                    <p className="text-sm text-destructive">
                      {errors.sale_price.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {errors.rental_available ? (
              <p className="text-sm text-destructive">
                {errors.rental_available.message}
              </p>
            ) : null}

            <div className="space-y-2 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
              <Label
                htmlFor="replacement_cost"
                className="inline-flex items-center gap-1.5"
              >
                <Lock className="size-3.5" />
                Replacement cost (internal)
              </Label>
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
              <p className="text-xs text-muted-foreground">
                Not shown on the public website or customer quotes.
              </p>
            </div>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
            {saved ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Pricing saved.
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" variant="commit" disabled={isPending}>
                {isPending ? "Saving..." : "Save pricing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
