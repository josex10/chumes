"use client";

import type {
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  STANDARD_VAT_PERCENT,
  vatBreakdownFromGross,
} from "@/lib/pricing/vat";
import { formatCurrency } from "@/lib/quotes/format";

type GrossPriceFieldProps<T extends FieldValues> = {
  id: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  value: unknown;
  error?: string;
  label?: string;
};

export function parseOptionalNumber(value: unknown): number | undefined {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function GrossPriceField<T extends FieldValues>({
  id,
  name,
  register,
  value,
  error,
  label = "Precio final (IVA incluido)",
}: GrossPriceFieldProps<T>) {
  const numericValue =
    typeof value === "number" ? value : parseOptionalNumber(value);
  const breakdown =
    numericValue != null ? vatBreakdownFromGross(numericValue) : null;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min="0"
        step="0.01"
        placeholder="0"
        className="tabular-nums"
        {...register(name, { setValueAs: parseOptionalNumber })}
      />
      {breakdown ? (
        <p className="text-sm text-muted-foreground">
          Base {formatCurrency(breakdown.net)} · IVA {STANDARD_VAT_PERCENT}%{" "}
          {formatCurrency(breakdown.vat)}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Escriba el monto que paga el cliente. La base neta se calcula con IVA{" "}
          {STANDARD_VAT_PERCENT}%.
        </p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
