"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { DISCOUNT_TYPE } from "@/lib/quotes/constants";
import type { QuoteFormValues } from "@/lib/quotes/schema";
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
  subtotal: number;
  taxableSubtotal: number;
  taxTotal: number;
  discountAmount: number;
  total: number;
  disabled?: boolean;
};

export function QuoteDocumentFooter({
  control,
  register,
  subtotal,
  taxableSubtotal,
  taxTotal,
  discountAmount,
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

        <div className="space-y-3 rounded-lg border bg-muted/10 p-4">
          <Label>Descuento</Label>
          <Controller
            control={control}
            name="discount_mode"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin descuento</SelectItem>
                  <SelectItem value="manual">Manual (% o monto)</SelectItem>
                  <SelectItem value="code">Por código</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            control={control}
            name="discount_mode"
            render={({ field: modeField }) => (
              <>
                {modeField.value === "code" && (
                  <div className="space-y-2">
                    <Label htmlFor="discount_code">Código de descuento</Label>
                    <Input
                      id="discount_code"
                      placeholder="ej. SALON10"
                      disabled={disabled}
                      {...register("discount_code")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Para clientes con pacto comercial predefinido.
                    </p>
                  </div>
                )}

                {modeField.value === "manual" && (
                  <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                    <div className="space-y-2">
                      <Label htmlFor="manual_discount_type">Tipo</Label>
                      <Controller
                        control={control}
                        name="manual_discount_type"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={disabled}
                          >
                            <SelectTrigger id="manual_discount_type" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={DISCOUNT_TYPE.PERCENTAGE}>
                                Porcentaje (%)
                              </SelectItem>
                              <SelectItem value={DISCOUNT_TYPE.FIXED}>
                                Monto fijo (₡)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual_discount_value">Valor</Label>
                      <Input
                        id="manual_discount_value"
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                        className="tabular-nums"
                        {...register("manual_discount_value", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          />
        </div>
      </div>

      <div className="lg:pt-2">
        <QuoteSummary
          subtotal={subtotal}
          taxableSubtotal={taxableSubtotal}
          taxTotal={taxTotal}
          discountAmount={discountAmount}
          total={total}
        />
      </div>
    </div>
  );
}
