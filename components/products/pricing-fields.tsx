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
import { GrossPriceField, parseOptionalNumber } from "@/components/products/gross-price-field";
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
  const rentalPrice = watch("rental_price" as Path<T>) as number | undefined;
  const salePrice = watch("sale_price" as Path<T>) as number | undefined;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium">Precios</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Escriba el monto final con IVA. El sistema calcula la base de alquiler o
          venta para cotizaciones y facturas sin impuesto.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PriceOptionCard
          title="Alquiler"
          description="Precio final por unidad de alquiler, con IVA incluido."
          icon={Timer}
          enabled={Boolean(rentalAvailable)}
          onToggle={() =>
            setValue(
              "rental_available" as Path<T>,
              !rentalAvailable as Parameters<UseFormSetValue<T>>[1],
            )
          }
        >
          <GrossPriceField
            id="rental_price"
            name={"rental_price" as Path<T>}
            register={register}
            value={rentalPrice}
            error={
              typeof errors.rental_price?.message === "string"
                ? errors.rental_price.message
                : undefined
            }
          />
        </PriceOptionCard>

        <PriceOptionCard
          title="Venta"
          description="Precio final cuando el cliente compra el artículo, con IVA incluido."
          icon={ShoppingBag}
          enabled={Boolean(saleAvailable)}
          onToggle={() =>
            setValue(
              "sale_available" as Path<T>,
              !saleAvailable as Parameters<UseFormSetValue<T>>[1],
            )
          }
        >
          <GrossPriceField
            id="sale_price"
            name={"sale_price" as Path<T>}
            register={register}
            value={salePrice}
            error={
              typeof errors.sale_price?.message === "string"
                ? errors.sale_price.message
                : undefined
            }
          />
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
                setValueAs: parseOptionalNumber,
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
