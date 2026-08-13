"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
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
import type { QuoteFormValues, QuoteLineItemValues } from "@/lib/quotes/schema";
import type {
  ProductCategory,
  QuotableProduct,
  QuoteLineType,
  Tax,
} from "@/lib/supabase/types";
import { ProductCombobox } from "@/components/quotes/product-combobox";
import { QuickProductModal } from "@/components/quotes/quick-product-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type QuoteLineItemsProps = {
  control: Control<QuoteFormValues>;
  register: UseFormRegister<QuoteFormValues>;
  setValue: UseFormSetValue<QuoteFormValues>;
  watch: UseFormWatch<QuoteFormValues>;
  errors: FieldErrors<QuoteFormValues>;
  products: QuotableProduct[];
  lineTypes: QuoteLineType[];
  taxes: Tax[];
  categories: ProductCategory[];
  defaultTaxId?: number;
  disabled?: boolean;
  onProductCreated: (product: QuotableProduct) => void;
};

const cellClass = "px-3 py-3 align-middle";
const fieldClass =
  "h-9 w-full rounded-lg border border-input/60 bg-background px-2.5 text-sm shadow-none";
const readOnlyFieldClass =
  "h-9 w-full cursor-default rounded-lg border border-input/40 bg-muted/20 px-2.5 text-sm shadow-none";

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

function getLineTotal(
  item: QuoteLineItemValues | undefined,
  taxes: Tax[],
): number {
  if (!item) return 0;

  const tax = taxes.find((entry) => entry.id === item.tax_id);
  return calculateLineTotals({
    quantity: Number(item.quantity) || 0,
    unit_price: Number(item.unit_price) || 0,
    tax_rate: getTaxRate(tax),
  }).line_total;
}

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateLayout = () => setIsDesktop(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  return isDesktop;
}

function QuantityInput({
  index,
  disabled,
  register,
  className,
}: {
  index: number;
  disabled: boolean;
  register: UseFormRegister<QuoteFormValues>;
  className?: string;
}) {
  return (
    <Input
      type="number"
      min="0.01"
      step="0.01"
      disabled={disabled}
      className={cn(fieldClass, className)}
      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
    />
  );
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
  categories,
  defaultTaxId,
  disabled = false,
  onProductCreated,
}: QuoteLineItemsProps) {
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [quickAddLineIndex, setQuickAddLineIndex] = useState<number | null>(null);
  const isDesktop = useDesktopLayout();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

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
      { value: "none", label: "Ninguno" },
      ...taxes.map((tax) => ({
        value: String(tax.id),
        label: tax.name,
      })),
    ],
    [taxes],
  );

  function buildLineFromProduct(
    product: QuotableProduct,
    existing?: Partial<QuoteLineItemValues>,
  ): QuoteLineItemValues {
    const lineTypeId = existing?.line_type_id ?? lineTypes[0]?.id ?? 0;
    const lineTypeCode = getLineTypeCode(lineTypes, lineTypeId);
    return {
      product_id: product.id,
      line_type_id: lineTypeId,
      quantity: existing?.quantity ?? 1,
      unit_price: getDefaultPrice(product, lineTypeCode),
      tax_id: existing?.tax_id ?? defaultTaxId ?? null,
      description: product.description ?? product.name ?? "",
    };
  }

  function applyProductToLine(index: number, product: QuotableProduct) {
    const line = buildLineFromProduct(product, items[index]);
    update(index, line);
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    applyProductToLine(index, product);
  }

  function openProductModal(lineIndex: number) {
    setQuickAddLineIndex(lineIndex);
    setProductModalOpen(true);
  }

  function handleProductCreated(product: QuotableProduct) {
    onProductCreated(product);

    const targetIndex =
      quickAddLineIndex ?? (fields.length > 0 ? fields.length - 1 : null);

    if (targetIndex !== null && targetIndex < fields.length) {
      applyProductToLine(targetIndex, product);
    } else {
      append(buildLineFromProduct(product));
    }

    setQuickAddLineIndex(null);
  }

  function handleLineTypeChange(index: number, lineTypeId: number) {
    const product = products.find((item) => item.id === items[index]?.product_id);
    const lineTypeCode = getLineTypeCode(lineTypes, lineTypeId);
    setValue(`items.${index}.line_type_id`, lineTypeId, { shouldValidate: true });
    setValue(
      `items.${index}.unit_price`,
      getDefaultPrice(product, lineTypeCode),
      { shouldValidate: true },
    );
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
      {isDesktop ? (
        <div className="overflow-x-auto rounded-lg ring-1 ring-border/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className={cn(cellClass, "w-20 py-2")}>Cant.</TableHead>
              <TableHead className={cn(cellClass, "min-w-[260px] py-2")}>Producto</TableHead>
              <TableHead className={cn(cellClass, "min-w-[280px] py-2")}>Descripción</TableHead>
              <TableHead className={cn(cellClass, "w-32 py-2")}>Tipo</TableHead>
              <TableHead className={cn(cellClass, "w-36 py-2")}>Precio</TableHead>
              <TableHead className={cn(cellClass, "w-28 py-2")}>IVA</TableHead>
              <TableHead className={cn(cellClass, "w-32 py-2 text-right")}>Total</TableHead>
              <TableHead className={cn(cellClass, "w-12 py-2")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Sin artículos. Agregue una línea para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field, index) => (
                <TableRow key={field.id} className="hover:bg-muted/20">
                  <TableCell className={cellClass}>
                    <QuantityInput
                      index={index}
                      disabled={disabled}
                      register={register}
                      className="w-20 text-center tabular-nums"
                    />
                  </TableCell>
                  <TableCell className={cellClass}>
                    <ProductCombobox
                      products={products}
                      value={items[index]?.product_id || undefined}
                      onValueChange={(value) => handleProductChange(index, value)}
                      disabled={disabled}
                      onCreateNew={() => openProductModal(index)}
                    />
                    {errors.items?.[index]?.product_id && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.items[index]?.product_id?.message}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className={cellClass}>
                    <Textarea
                      rows={2}
                      readOnly
                      disabled
                      className={cn(readOnlyFieldClass, "min-h-9 resize-none py-2 leading-relaxed")}
                      value={items[index]?.description?.trim() || "—"}
                    />
                  </TableCell>
                  <TableCell className={cellClass}>
                    <Select
                      value={String(items[index]?.line_type_id ?? "")}
                      onValueChange={(value) =>
                        value && handleLineTypeChange(index, Number(value))
                      }
                      disabled={disabled}
                      items={lineTypeItems}
                    >
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {lineTypes.map((lineType) => (
                          <SelectItem key={lineType.id} value={String(lineType.id)}>
                            {lineType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <Input
                      readOnly
                      disabled
                      tabIndex={-1}
                      className={cn(readOnlyFieldClass, "tabular-nums")}
                      value={formatCurrency(Number(items[index]?.unit_price) || 0)}
                    />
                  </TableCell>
                  <TableCell className={cellClass}>
                    <Select
                      value={
                        items[index]?.tax_id ? String(items[index]?.tax_id) : "none"
                      }
                      onValueChange={(value) =>
                        setValue(
                          `items.${index}.tax_id`,
                          value === "none" ? null : Number(value),
                          { shouldValidate: true },
                        )
                      }
                      disabled={disabled}
                      items={taxItems}
                    >
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="IVA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {taxes.map((tax) => (
                          <SelectItem key={tax.id} value={String(tax.id)}>
                            {tax.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <Input
                      readOnly
                      disabled
                      tabIndex={-1}
                      className={cn(readOnlyFieldClass, "text-right font-medium tabular-nums")}
                      value={formatCurrency(getLineTotal(items[index], taxes))}
                    />
                  </TableCell>
                  <TableCell className={cellClass}>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-9 text-muted-foreground"
                        onClick={() => remove(index)}
                        aria-label="Eliminar línea"
                      >
                        <X className="size-3.5" strokeWidth={1.5} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      ) : (
        <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Sin artículos. Agregue una línea para comenzar.
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-lg p-4 ring-1 ring-border/60">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Línea {index + 1}
                </span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-muted-foreground"
                    onClick={() => remove(index)}
                    aria-label="Eliminar línea"
                  >
                    <X className="size-3.5" strokeWidth={1.5} />
                  </Button>
                )}
              </div>
              <ProductCombobox
                products={products}
                value={items[index]?.product_id || undefined}
                onValueChange={(value) => handleProductChange(index, value)}
                disabled={disabled}
                onCreateNew={() => openProductModal(index)}
              />
              <Textarea
                rows={2}
                readOnly
                disabled
                className={cn(readOnlyFieldClass, "min-h-9 resize-none py-2")}
                value={items[index]?.description?.trim() || "Sin descripción"}
              />
              <div className="grid grid-cols-2 gap-3">
                <QuantityInput
                  index={index}
                  disabled={disabled}
                  register={register}
                  className="tabular-nums"
                />
                <Input
                  readOnly
                  disabled
                  className={cn(readOnlyFieldClass, "tabular-nums")}
                  value={formatCurrency(Number(items[index]?.unit_price) || 0)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={String(items[index]?.line_type_id ?? "")}
                  onValueChange={(value) =>
                    value && handleLineTypeChange(index, Number(value))
                  }
                  disabled={disabled}
                  items={lineTypeItems}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {lineTypes.map((lineType) => (
                      <SelectItem key={lineType.id} value={String(lineType.id)}>
                        {lineType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={items[index]?.tax_id ? String(items[index]?.tax_id) : "none"}
                  onValueChange={(value) =>
                    setValue(
                      `items.${index}.tax_id`,
                      value === "none" ? null : Number(value),
                      { shouldValidate: true },
                    )
                  }
                  disabled={disabled}
                  items={taxItems}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="IVA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {taxes.map((tax) => (
                      <SelectItem key={tax.id} value={String(tax.id)}>
                        {tax.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                readOnly
                disabled
                className={cn(readOnlyFieldClass, "text-right font-medium tabular-nums")}
                value={formatCurrency(getLineTotal(items[index], taxes))}
              />
            </div>
          ))
        )}
        </div>
      )}

      {!disabled && (
        <Button type="button" variant="add" size="sm" onClick={addLine}>
          + Nueva línea
        </Button>
      )}

      {errors.items?.message && (
        <p className="text-sm text-destructive">{errors.items.message}</p>
      )}

      <QuickProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        categories={categories}
        onCreated={handleProductCreated}
      />
    </div>
  );
}
