"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createQuote, updateQuote } from "@/lib/quotes/actions";
import { calculateQuoteTotals, getTaxRate } from "@/lib/quotes/calculations";
import { DISCOUNT_TYPE } from "@/lib/quotes/constants";
import { getDefaultValidUntilDate } from "@/lib/quotes/format";
import {
  quoteFormSchema,
  type QuoteFormValues,
} from "@/lib/quotes/schema";
import type {
  CustomerType,
  CustomerWithRelations,
  DeliveryZone,
  DiscountCode,
  ProductCategory,
  QuotableProduct,
  QuoteLineType,
  QuoteWithRelations,
  Tax,
} from "@/lib/supabase/types";
import { QuoteDeliveryBar } from "@/components/quotes/quote-delivery-bar";
import { QuoteDocumentFooter } from "@/components/quotes/quote-document-footer";
import { QuoteDocumentHeader } from "@/components/quotes/quote-document-header";
import { QuoteLineItems } from "@/components/quotes/quote-line-items";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuoteFormProps = {
  customerTypes: CustomerType[];
  products?: QuotableProduct[];
  categories: ProductCategory[];
  lineTypes: QuoteLineType[];
  taxes: Tax[];
  deliveryZones: DeliveryZone[];
  discountCodes: DiscountCode[];
  defaultTaxId?: number;
  quote?: QuoteWithRelations;
  eventId?: string;
  defaultCustomer?: CustomerWithRelations;
  hideTitle?: boolean;
};

function buildInitialValues(
  quote: QuoteWithRelations | undefined,
  lineTypes: QuoteLineType[],
  defaultTaxId?: number,
  defaultCustomer?: CustomerWithRelations,
): QuoteFormValues {
  if (!quote) {
    return {
      customer_id: defaultCustomer?.id ?? "",
      estimated_location: "",
      delivery_zone_id: null,
      delivery_fee: null,
      delivery_tax_id: defaultTaxId ?? null,
      discount_mode: "none",
      discount_code: "",
      manual_discount_type: DISCOUNT_TYPE.FIXED,
      manual_discount_value: null,
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
    delivery_tax_id: quote.delivery_tax_id,
    discount_mode: quote.discount_codes?.code
      ? "code"
      : quote.manual_discount_value
        ? "manual"
        : "none",
    discount_code: quote.discount_codes?.code ?? "",
    manual_discount_type: quote.manual_discount_type ?? DISCOUNT_TYPE.FIXED,
    manual_discount_value: quote.manual_discount_value,
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
  customerTypes,
  products: initialProducts = [],
  categories,
  lineTypes,
  taxes,
  deliveryZones,
  discountCodes,
  defaultTaxId,
  quote,
  eventId,
  defaultCustomer,
  hideTitle = false,
}: QuoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const isEditing = Boolean(quote);
  const isLocked = quote?.is_locked ?? false;

  const deliveryZoneItems = useMemo(
    () => [
      { value: "none", label: "Sin zona" },
      ...deliveryZones.map((zone) => ({
        value: String(zone.id),
        label: zone.name,
      })),
    ],
    [deliveryZones],
  );

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: buildInitialValues(
      quote,
      lineTypes,
      defaultTaxId,
      defaultCustomer,
    ),
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
      watchedValues.discount_mode === "code"
        ? discountCodes.find(
            (code) =>
              code.code.toUpperCase() ===
              (watchedValues.discount_code?.trim().toUpperCase() ?? ""),
          ) ?? null
        : null;

    const manualDiscount =
      watchedValues.discount_mode === "manual" &&
      watchedValues.manual_discount_value != null &&
      watchedValues.manual_discount_value > 0
        ? {
            discount_type: watchedValues.manual_discount_type,
            value: watchedValues.manual_discount_value,
          }
        : null;

    const lines = (watchedValues.items ?? []).map((item) => {
      const tax =
        item.tax_id != null
          ? taxes.find((entry) => entry.id === item.tax_id)
          : null;
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

    const deliveryTax =
      watchedValues.delivery_tax_id != null
        ? taxes.find((entry) => entry.id === watchedValues.delivery_tax_id)
        : null;

    return calculateQuoteTotals({
      lines,
      discountCode,
      manualDiscount,
      deliveryFee: Number(deliveryFee) || 0,
      deliveryTaxRate: getTaxRate(deliveryTax),
    });
  }, [watchedValues, discountCodes, taxes, deliveryZones]);

  const selectedDeliveryZone = deliveryZones.find(
    (zone) => zone.id === watchedValues.delivery_zone_id,
  );
  const deliveryFeeDisplay =
    watchedValues.delivery_fee ?? selectedDeliveryZone?.suggested_fee ?? 0;

  function handleZoneChange(zoneId: number | null) {
    setValue("delivery_zone_id", zoneId);
    const zone = deliveryZones.find((entry) => entry.id === zoneId);
    if (zone) {
      setValue("delivery_fee", zone.suggested_fee);
    }
  }

  function handleCustomerCreated(customer: CustomerWithRelations) {
    setValue("customer_id", customer.id);
  }

  function handleProductCreated(product: QuotableProduct) {
    setProducts((current) => {
      if (current.some((entry) => entry.id === product.id)) return current;
      return [...current, product].sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  function onSubmit(values: QuoteFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateQuote(quote!.id, values);
      } else if (eventId) {
        const { createQuoteForEvent } = await import("@/lib/events/actions");
        result = await createQuoteForEvent(eventId, values);
      } else {
        result = await createQuote(values);
      }

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      if (eventId && result.quoteId) {
        router.push(`/events/${eventId}`);
      } else {
        router.push("/quotes");
      }
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl bg-card ring-1 ring-border/60"
    >
      <div className="space-y-8 p-6 md:p-8">
        <QuoteDocumentHeader
          control={control}
          register={register}
          errors={errors}
          customerTypes={customerTypes}
          defaultCustomer={quote?.customers ?? defaultCustomer}
          onCustomerCreated={handleCustomerCreated}
          isEditing={isEditing}
          quoteNumber={quote?.quote_number}
          disabled={isLocked}
          hideTitle={hideTitle}
        />

        <QuoteDeliveryBar
          control={control}
          register={register}
          deliveryZones={deliveryZones}
          deliveryZoneItems={deliveryZoneItems}
          onZoneChange={handleZoneChange}
          suggestedFee={selectedDeliveryZone?.suggested_fee}
          disabled={isLocked}
        />

        <QuoteLineItems
          control={control}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          products={products}
          categories={categories}
          lineTypes={lineTypes}
          taxes={taxes}
          defaultTaxId={defaultTaxId}
          disabled={isLocked}
          onProductCreated={handleProductCreated}
          deliveryFee={Number(deliveryFeeDisplay) || 0}
          deliveryZoneName={selectedDeliveryZone?.name}
          deliveryTaxId={watchedValues.delivery_tax_id}
          onDeliveryTaxChange={(taxId) =>
            setValue("delivery_tax_id", taxId, { shouldValidate: true })
          }
          calculatedLineTotals={summary.lines}
          deliveryLineTotal={summary.delivery_line_total}
        />

        <QuoteDocumentFooter
          control={control}
          register={register}
          subtotal={summary.subtotal}
          taxableSubtotal={summary.taxable_subtotal}
          taxTotal={summary.tax_total}
          discountAmount={summary.discount_amount}
          total={summary.total}
          disabled={isLocked}
        />

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        {isLocked && (
          <p className="text-sm text-muted-foreground">
            Esta cotización está bloqueada porque fue aprobada. Ya no se pueden
            editar líneas ni precios.
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-border/60 pt-6">
          {!isLocked && (
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Guardar cotización"
                  : "Crear cotización"}
            </Button>
          )}
          <Link href="/quotes" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
