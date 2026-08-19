"use client";

import { Truck } from "lucide-react";
import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { formatCurrency } from "@/lib/quotes/format";
import type { QuoteFormValues } from "@/lib/quotes/schema";
import type { DeliveryZone } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuoteDeliveryBarProps = {
  control: Control<QuoteFormValues>;
  register: UseFormRegister<QuoteFormValues>;
  deliveryZones: DeliveryZone[];
  deliveryZoneItems: { value: string; label: string }[];
  onZoneChange: (zoneId: number | null) => void;
  suggestedFee?: number | null;
  disabled?: boolean;
};

export function QuoteDeliveryBar({
  control,
  register,
  deliveryZones,
  deliveryZoneItems,
  onZoneChange,
  suggestedFee,
  disabled = false,
}: QuoteDeliveryBarProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 px-4 py-4 md:px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-2 md:pb-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-background ring-1 ring-border/60">
            <Truck className="size-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium">Envío y transporte</p>
            <p className="text-xs text-muted-foreground">
              La zona sugiere el monto; aparece como línea al final.
            </p>
          </div>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2 md:max-w-xl">
          <div className="space-y-1.5">
            <Label htmlFor="delivery_zone_id" className="text-xs">
              Zona
            </Label>
            <Controller
              control={control}
              name="delivery_zone_id"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : "none"}
                  onValueChange={(value) =>
                    onZoneChange(value === "none" ? null : Number(value))
                  }
                  disabled={disabled}
                  items={deliveryZoneItems}
                >
                  <SelectTrigger id="delivery_zone_id" className="w-full bg-background">
                    <SelectValue placeholder="Sin zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin zona</SelectItem>
                    {deliveryZones.map((zone) => (
                      <SelectItem key={zone.id} value={String(zone.id)}>
                        {zone.name}
                        {zone.suggested_fee != null
                          ? ` · ${formatCurrency(zone.suggested_fee)}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery_fee" className="text-xs">
              Monto transporte
              {suggestedFee != null ? (
                <span className="ml-1 font-normal text-muted-foreground">
                  (sugerido {formatCurrency(suggestedFee)})
                </span>
              ) : null}
            </Label>
            <Input
              id="delivery_fee"
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              className="bg-background tabular-nums"
              {...register("delivery_fee", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
