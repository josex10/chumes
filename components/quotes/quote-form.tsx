"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { QuoteDocumentFooter } from "@/components/quotes/quote-document-footer";
import { QuoteDocumentHeader } from "@/components/quotes/quote-document-header";
import { QuoteLineItems } from "@/components/quotes/quote-line-items";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuoteFormProps = {
  customers: CustomerWithRelations[];
  customerTypes: CustomerType[];
  products: QuotableProduct[];
  categories: ProductCategory[];
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
  customers: initialCustomers,
  customerTypes,
  products: initialProducts,
  categories,
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
  const [customers, setCustomers] = useState(initialCustomers);
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

  function handleCustomerCreated(customer: CustomerWithRelations) {
    setCustomers((current) => {
      if (current.some((entry) => entry.id === customer.id)) return current;
      return [...current, customer].sort((a, b) => a.name.localeCompare(b.name));
    });
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl bg-card ring-1 ring-border/60"
    >
      <div className="space-y-8 p-6 md:p-8">
        <QuoteDocumentHeader
          control={control}
          register={register}
          errors={errors}
          customers={customers}
          customerTypes={customerTypes}
          onCustomerCreated={handleCustomerCreated}
          isEditing={isEditing}
          quoteNumber={quote?.quote_number}
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
        />

        <QuoteDocumentFooter
          control={control}
          register={register}
          deliveryZones={deliveryZones}
          deliveryZoneItems={deliveryZoneItems}
          onZoneChange={handleZoneChange}
          subtotal={summary.subtotal}
          taxTotal={summary.tax_total}
          discountAmount={summary.discount_amount}
          deliveryFee={summary.delivery_fee}
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
