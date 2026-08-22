"use client";

import { Lock, ShoppingBag, Timer } from "lucide-react";
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PricingFieldsProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  showReplacementCost?: boolean;
};

function PriceOptionCard({
  title,
  description,
  icon: Icon,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition",
        enabled
          ? "border-foreground/20 bg-card shadow-sm"
          : "border-border/70 bg-muted/20",
      )}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 font-medium">
            <Icon className="size-4 text-muted-foreground" />
            {title}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </label>
      {enabled ? <div className="mt-4 pl-7">{children}</div> : null}
    </div>
  );
}

function InternalCostCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-5 lg:col-span-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2 font-medium">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

export function PricingFields<T extends FieldValues>({
  register,
  watch,
  setValue,
  errors,
  showReplacementCost = true,
}: PricingFieldsProps<T>) {
  const rentalAvailable = watch("rental_available" as Path<T>);
  const saleAvailable = watch("sale_available" as Path<T>);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium">Precios</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina cómo se ofrece este producto. Puede activar alquiler, venta o ambos.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PriceOptionCard
          title="Alquiler"
          description="Precio por unidad de alquiler para eventos y cotizaciones."
          icon={Timer}
          enabled={Boolean(rentalAvailable)}
          onToggle={() =>
            setValue(
              "rental_available" as Path<T>,
              !rentalAvailable as Parameters<UseFormSetValue<T>>[1],
            )
          }
        >
          <div className="space-y-2">
            <Label htmlFor="rental_price">Precio de alquiler (CRC)</Label>
            <Input
              id="rental_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              {...register("rental_price" as Path<T>, {
                setValueAs: (value) =>
                  value === "" || Number.isNaN(Number(value))
                    ? undefined
                    : Number(value),
              })}
            />
            {typeof errors.rental_price?.message === "string" ? (
              <p className="text-sm text-destructive">
                {errors.rental_price.message}
              </p>
            ) : null}
          </div>
        </PriceOptionCard>

        <PriceOptionCard
          title="Venta"
          description="Precio cuando el cliente compra el artículo directamente."
          icon={ShoppingBag}
          enabled={Boolean(saleAvailable)}
          onToggle={() =>
            setValue(
              "sale_available" as Path<T>,
              !saleAvailable as Parameters<UseFormSetValue<T>>[1],
            )
          }
        >
          <div className="space-y-2">
            <Label htmlFor="sale_price">Precio de venta (CRC)</Label>
            <Input
              id="sale_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              {...register("sale_price" as Path<T>, {
                setValueAs: (value) =>
                  value === "" || Number.isNaN(Number(value))
                    ? undefined
                    : Number(value),
              })}
            />
            {typeof errors.sale_price?.message === "string" ? (
              <p className="text-sm text-destructive">{errors.sale_price.message}</p>
            ) : null}
          </div>
        </PriceOptionCard>

        {showReplacementCost ? (
          <InternalCostCard
            title="Costo de reposición"
            description="Solo uso interno. No se muestra en la web ni en cotizaciones."
            icon={Lock}
          >
            <Label htmlFor="replacement_cost">Costo de reposición (CRC)</Label>
            <Input
              id="replacement_cost"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              {...register("replacement_cost" as Path<T>, {
                setValueAs: (value) =>
                  value === "" || Number.isNaN(Number(value))
                    ? undefined
                    : Number(value),
              })}
            />
          </InternalCostCard>
        ) : null}
      </div>

      {typeof errors.rental_available?.message === "string" ? (
        <p className="text-sm text-destructive">{errors.rental_available.message}</p>
      ) : null}
    </div>
  );
}
