"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import type { QuoteFormValues } from "@/lib/quotes/schema";
import type { DeliveryZone } from "@/lib/supabase/types";
import { QuoteSummary } from "@/components/quotes/quote-summary";
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

type QuoteDocumentFooterProps = {
  control: Control<QuoteFormValues>;
  register: UseFormRegister<QuoteFormValues>;
  deliveryZones: DeliveryZone[];
  deliveryZoneItems: { value: string; label: string }[];
  onZoneChange: (zoneId: number | null) => void;
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  disabled?: boolean;
};

export function QuoteDocumentFooter({
  control,
  register,
  deliveryZones,
  deliveryZoneItems,
  onZoneChange,
  subtotal,
  taxTotal,
  discountAmount,
  deliveryFee,
  total,
  disabled = false,
}: QuoteDocumentFooterProps) {
  return (
    <div className="grid gap-8 border-t border-border/60 pt-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.8fr)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            rows={4}
            placeholder="Notas visibles en la cotización"
            disabled={disabled}
            className="resize-none"
            {...register("notes")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="discount_code">Código descuento</Label>
            <Input
              id="discount_code"
              placeholder="ej. SALON10"
              disabled={disabled}
              {...register("discount_code")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_zone_id">Zona de envío</Label>
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
                  <SelectTrigger id="delivery_zone_id" className="w-full">
                    <SelectValue placeholder="Sin zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin zona</SelectItem>
                    {deliveryZones.map((zone) => (
                      <SelectItem key={zone.id} value={String(zone.id)}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Tarifa envío</Label>
            <Input
              id="delivery_fee"
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              className="tabular-nums"
              {...register("delivery_fee", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <div className="lg:pt-2">
        <QuoteSummary
          subtotal={subtotal}
          taxTotal={taxTotal}
          discountAmount={discountAmount}
          deliveryFee={deliveryFee}
          total={total}
        />
      </div>
    </div>
  );
}
