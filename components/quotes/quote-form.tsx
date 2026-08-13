"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createQuote, updateQuote } from "@/lib/quotes/actions";
import { calculateQuoteTotals, getTaxRate } from "@/lib/quotes/calculations";
import { getDefaultValidUntilDate } from "@/lib/quotes/format";
import {
  quoteFormSchema,
  type QuoteFormValues,
} from "@/lib/quotes/schema";
import type {
  CustomerWithRelations,
  DeliveryZone,
  DiscountCode,
  QuotableProduct,
  QuoteLineType,
  QuoteWithRelations,
  Tax,
} from "@/lib/supabase/types";
import { QuoteLineItems } from "@/components/quotes/quote-line-items";
import { QuoteSummary } from "@/components/quotes/quote-summary";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuoteFormProps = {
  customers: CustomerWithRelations[];
  products: QuotableProduct[];
  lineTypes: QuoteLineType[];
  taxes: Tax[];
  deliveryZones: DeliveryZone[];
  discountCodes: DiscountCode[];
  defaultTaxId?: number;
  quote?: QuoteWithRelations;
};

function buildInitialValues(
  quote: QuoteWithRelations | undefined,
  lineTypes: QuoteLineType[],
  defaultTaxId?: number,
): QuoteFormValues {
  if (!quote) {
    return {
      customer_id: "",
      estimated_location: "",
      delivery_zone_id: null,
      delivery_fee: null,
      discount_code: "",
      notes: "",
      valid_until: getDefaultValidUntilDate(),
      items: [
        {
          product_id: "",
          line_type_id: lineTypes[0]?.id ?? 0,
          quantity: 1,
          unit_price: 0,
          tax_id: defaultTaxId ?? null,
          description: "",
        },
      ],
    };
  }

  return {
    customer_id: quote.customer_id,
    estimated_location: quote.estimated_location ?? "",
    delivery_zone_id: quote.delivery_zone_id,
    delivery_fee: quote.delivery_fee,
    discount_code: quote.discount_codes?.code ?? "",
    notes: quote.notes ?? "",
    valid_until: quote.valid_until ?? "",
    items:
      quote.quote_items?.map((item) => ({
        product_id: item.product_id,
        line_type_id: item.line_type_id,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        tax_id: item.tax_id,
        description: item.description ?? item.products?.description ?? "",
      })) ?? [],
  };
}

export function QuoteForm({
  customers,
  products,
  lineTypes,
  taxes,
  deliveryZones,
  discountCodes,
  defaultTaxId,
  quote,
}: QuoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(quote);
  const isLocked = quote?.is_locked ?? false;

  const customerItems = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: customer.name,
      })),
    [customers],
  );

  const deliveryZoneItems = useMemo(
    () => [
      { value: "none", label: "No zone" },
      ...deliveryZones.map((zone) => ({
        value: String(zone.id),
        label: zone.name,
      })),
    ],
    [deliveryZones],
  );

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: buildInitialValues(quote, lineTypes, defaultTaxId),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const watchedValues = watch();

  const summary = useMemo(() => {
    const discountCode =
      discountCodes.find(
        (code) =>
          code.code.toUpperCase() ===
          (watchedValues.discount_code?.trim().toUpperCase() ?? ""),
      ) ?? null;

    const lines = (watchedValues.items ?? []).map((item) => {
      const tax = taxes.find((entry) => entry.id === item.tax_id);
      return {
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        tax_rate: getTaxRate(tax),
      };
    });

    const selectedZone = deliveryZones.find(
      (zone) => zone.id === watchedValues.delivery_zone_id,
    );
    const deliveryFee =
      watchedValues.delivery_fee ??
      selectedZone?.suggested_fee ??
      0;

    return calculateQuoteTotals({
      lines,
      discountCode,
      deliveryFee: Number(deliveryFee) || 0,
    });
  }, [watchedValues, discountCodes, taxes, deliveryZones]);

  function handleZoneChange(zoneId: number | null) {
    setValue("delivery_zone_id", zoneId);
    const zone = deliveryZones.find((entry) => entry.id === zoneId);
    if (zone) {
      setValue("delivery_fee", zone.suggested_fee);
    }
  }

  function onSubmit(values: QuoteFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateQuote(quote!.id, values)
        : await createQuote(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push("/quotes");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit quote" : "New quote"}</CardTitle>
          <CardDescription>
            {isEditing
              ? `Quote ${quote?.quote_number ?? ""}`
              : "Create a commercial proposal for a customer."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer</Label>
              <Controller
                control={control}
                name="customer_id"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={isLocked}
                    items={customerItems}
                  >
                    <SelectTrigger id="customer_id" className="w-full">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customer_id && (
                <p className="text-sm text-destructive">
                  {errors.customer_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid until</Label>
              <Input
                id="valid_until"
                type="date"
                disabled={isLocked}
                {...register("valid_until")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="estimated_location">Estimated location</Label>
              <Input
                id="estimated_location"
                placeholder="Optional"
                disabled={isLocked}
                {...register("estimated_location")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_zone_id">Delivery zone</Label>
              <Controller
                control={control}
                name="delivery_zone_id"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : "none"}
                    onValueChange={(value) =>
                      handleZoneChange(value === "none" ? null : Number(value))
                    }
                    disabled={isLocked}
                    items={deliveryZoneItems}
                  >
                    <SelectTrigger id="delivery_zone_id" className="w-full">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No zone</SelectItem>
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
              <Label htmlFor="delivery_fee">Delivery fee</Label>
              <Input
                id="delivery_fee"
                type="number"
                min="0"
                step="0.01"
                disabled={isLocked}
                {...register("delivery_fee", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_code">Discount code</Label>
              <Input
                id="discount_code"
                placeholder="e.g. SALON10"
                disabled={isLocked}
                {...register("discount_code")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                disabled={isLocked}
                {...register("notes")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <QuoteLineItems
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            products={products}
            lineTypes={lineTypes}
            taxes={taxes}
            defaultTaxId={defaultTaxId}
            disabled={isLocked}
          />
        </CardContent>
      </Card>

      <QuoteSummary
        subtotal={summary.subtotal}
        taxTotal={summary.tax_total}
        discountAmount={summary.discount_amount}
        deliveryFee={summary.delivery_fee}
        total={summary.total}
      />

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      {isLocked && (
        <p className="text-sm text-muted-foreground">
          This quote is locked because it was approved. Line items and pricing
          can no longer be edited.
        </p>
      )}

      <div className="flex items-center gap-3">
        {!isLocked && (
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Save changes" : "Create quote"}
          </Button>
        )}
        <Link
          href="/quotes"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
