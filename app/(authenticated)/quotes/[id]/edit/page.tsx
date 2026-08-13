import { notFound } from "next/navigation";
import { getCustomers } from "@/lib/customers/queries";
import { getQuotableProducts } from "@/lib/products/queries";
import {
  getDefaultTax,
  getDeliveryZones,
  getDiscountCodes,
  getQuoteById,
  getQuoteLineTypes,
  getTaxes,
} from "@/lib/quotes/queries";
import { QuoteDownloadButton } from "@/components/quotes/quote-download-button";
import { QuoteForm } from "@/components/quotes/quote-form";
import { QuoteStatusPanel } from "@/components/quotes/quote-status-panel";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [
    quote,
    customers,
    products,
    lineTypes,
    taxes,
    deliveryZones,
    discountCodes,
    defaultTax,
  ] = await Promise.all([
    getQuoteById(id),
    getCustomers(),
    getQuotableProducts(),
    getQuoteLineTypes(),
    getTaxes(),
    getDeliveryZones(),
    getDiscountCodes(),
    getDefaultTax(),
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {quote.quote_number}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {quote.customers.name} · {quote.quote_statuses.name}
          </p>
        </div>
        <QuoteDownloadButton quoteId={quote.id} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <QuoteForm
          customers={customers}
          products={products}
          lineTypes={lineTypes}
          taxes={taxes}
          deliveryZones={deliveryZones}
          discountCodes={discountCodes}
          defaultTaxId={defaultTax?.id}
          quote={quote}
        />
        <QuoteStatusPanel
          quoteId={quote.id}
          currentStatus={quote.quote_statuses}
        />
      </div>
    </main>
  );
}
