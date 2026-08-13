"use client";

import { useMemo } from "react";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  useFieldArray,
} from "react-hook-form";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import {
  calculateLineTotals,
  getTaxRate,
} from "@/lib/quotes/calculations";
import { formatCurrency } from "@/lib/quotes/format";
import type { QuoteFormValues } from "@/lib/quotes/schema";
import type {
  QuotableProduct,
  QuoteLineType,
  Tax,
} from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuoteLineItemsProps = {
  control: Control<QuoteFormValues>;
  register: UseFormRegister<QuoteFormValues>;
  setValue: UseFormSetValue<QuoteFormValues>;
  watch: UseFormWatch<QuoteFormValues>;
  errors: FieldErrors<QuoteFormValues>;
  products: QuotableProduct[];
  lineTypes: QuoteLineType[];
  taxes: Tax[];
  defaultTaxId?: number;
  disabled?: boolean;
};

function getLineTypeCode(
  lineTypes: QuoteLineType[],
  lineTypeId: number | undefined,
): string | undefined {
  return lineTypes.find((type) => type.id === lineTypeId)?.code;
}

function getDefaultPrice(
  product: QuotableProduct | undefined,
  lineTypeCode: string | undefined,
): number {
  if (!product || !lineTypeCode) return 0;
  if (lineTypeCode === QUOTE_LINE_TYPE.RENTAL) return product.rental_price ?? 0;
  if (lineTypeCode === QUOTE_LINE_TYPE.SALE) return product.sale_price ?? 0;
  return 0;
}

export function QuoteLineItems({
  control,
  register,
  setValue,
  watch,
  errors,
  products,
  lineTypes,
  taxes,
  defaultTaxId,
  disabled = false,
}: QuoteLineItemsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  const productItems = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    [products],
  );

  const lineTypeItems = useMemo(
    () =>
      lineTypes.map((lineType) => ({
        value: String(lineType.id),
        label: lineType.name,
      })),
    [lineTypes],
  );

  const taxItems = useMemo(
    () => [
      { value: "none", label: "No tax" },
      ...taxes.map((tax) => ({
        value: String(tax.id),
        label: tax.name,
      })),
    ],
    [taxes],
  );

  function handleProductChange(index: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    const lineTypeId = items[index]?.line_type_id;
    const lineTypeCode = getLineTypeCode(lineTypes, lineTypeId);
    setValue(`items.${index}.product_id`, productId);
    setValue(`items.${index}.unit_price`, getDefaultPrice(product, lineTypeCode));
    setValue(`items.${index}.description`, product?.description ?? "");
  }

  function handleLineTypeChange(index: number, lineTypeId: number) {
    const product = products.find((item) => item.id === items[index]?.product_id);
    const lineTypeCode = getLineTypeCode(lineTypes, lineTypeId);
    setValue(`items.${index}.line_type_id`, lineTypeId);
    setValue(`items.${index}.unit_price`, getDefaultPrice(product, lineTypeCode));
  }

  function getLineTotal(index: number): number {
    const item = items[index];
    if (!item) return 0;

    const tax = taxes.find((entry) => entry.id === item.tax_id);
    return calculateLineTotals({
      quantity: Number(item.quantity) || 0,
      unit_price: Number(item.unit_price) || 0,
      tax_rate: getTaxRate(tax),
    }).line_total;
  }

  function addLine() {
    append({
      product_id: "",
      line_type_id: lineTypes[0]?.id ?? 0,
      quantity: 1,
      unit_price: 0,
      tax_id: defaultTaxId ?? null,
      description: "",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">Line items</h3>
          <p className="text-sm text-muted-foreground">
            Add products, quantities, and prices for this quote.
          </p>
        </div>
        {!disabled && (
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            Add line
          </Button>
        )}
      </div>

      {fields.length === 0 && !disabled && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No line items yet. Add one to start building this quote.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={addLine}
          >
            Add line
          </Button>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-muted-foreground">
              Line {index + 1}
            </p>
            <p className="text-sm font-semibold">
              Line total: {formatCurrency(getLineTotal(index))}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`items.${index}.product_id`}>Product</Label>
              <Select
                value={items[index]?.product_id || undefined}
                onValueChange={(value) => value && handleProductChange(index, value)}
                disabled={disabled}
                items={productItems}
              >
                <SelectTrigger id={`items.${index}.product_id`} className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.items?.[index]?.product_id && (
                <p className="text-sm text-destructive">
                  {errors.items[index]?.product_id?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`items.${index}.line_type_id`}>Line type</Label>
              <Select
                value={String(items[index]?.line_type_id ?? "")}
                onValueChange={(value) =>
                  value && handleLineTypeChange(index, Number(value))
                }
                disabled={disabled}
                items={lineTypeItems}
              >
                <SelectTrigger id={`items.${index}.line_type_id`} className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {lineTypes.map((lineType) => (
                    <SelectItem key={lineType.id} value={String(lineType.id)}>
                      {lineType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
              <Input
                id={`items.${index}.quantity`}
                type="number"
                min="0.01"
                step="0.01"
                disabled={disabled}
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`items.${index}.unit_price`}>Unit price</Label>
              <Input
                id={`items.${index}.unit_price`}
                type="number"
                min="0"
                step="0.01"
                disabled={disabled}
                {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`items.${index}.tax_id`}>Tax</Label>
              <Select
                value={
                  items[index]?.tax_id ? String(items[index]?.tax_id) : "none"
                }
                onValueChange={(value) =>
                  setValue(
                    `items.${index}.tax_id`,
                    value === "none" ? null : Number(value),
                  )
                }
                disabled={disabled}
                items={taxItems}
              >
                <SelectTrigger id={`items.${index}.tax_id`} className="w-full">
                  <SelectValue placeholder="Select tax" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tax</SelectItem>
                  {taxes.map((tax) => (
                    <SelectItem key={tax.id} value={String(tax.id)}>
                      {tax.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`items.${index}.description`}>Description</Label>
              <Input
                id={`items.${index}.description`}
                disabled={disabled}
                {...register(`items.${index}.description`)}
              />
            </div>
          </div>

          {!disabled && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove line
              </Button>
            </div>
          )}
        </div>
      ))}

      {errors.items?.message && (
        <p className="text-sm text-destructive">{errors.items.message}</p>
      )}
    </div>
  );
}
