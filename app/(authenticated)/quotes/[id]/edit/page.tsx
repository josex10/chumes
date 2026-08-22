import { notFound } from "next/navigation";
import { getEventById, getLinkableEventsForCustomer } from "@/lib/events/queries";
import { getStatusPhase } from "@/lib/events/status-transitions";
import { EVENT_PHASE } from "@/lib/events/constants";
import { getCustomerTypes } from "@/lib/customers/queries";
import {
  getProductCategories,
  getQuotableProductsByIds,
} from "@/lib/products/queries";
import {
  getDefaultTax,
  getDeliveryZones,
  getDiscountCodes,
  getQuoteById,
  getQuoteLineTypes,
  getTaxes,
} from "@/lib/quotes/queries";
import { QuoteForm } from "@/components/quotes/quote-form";
import { QuotePageHeader } from "@/components/quotes/quote-page-header";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [
    quote,
    customerTypes,
    categories,
    lineTypes,
    taxes,
    deliveryZones,
    discountCodes,
    defaultTax,
  ] = await Promise.all([
    getQuoteById(id),
    getCustomerTypes(),
    getProductCategories(),
    getQuoteLineTypes(),
    getTaxes(),
    getDeliveryZones(),
    getDiscountCodes(),
    getDefaultTax(),
  ]);

  if (!quote) {
    notFound();
  }

  const products = await getQuotableProductsByIds(
    quote.quote_items?.map((item) => item.product_id) ?? [],
  );

  let canUnlink = false;
  let linkableEvents: Awaited<ReturnType<typeof getLinkableEventsForCustomer>> = [];

  if (quote.event_id) {
    const linkedEvent = await getEventById(quote.event_id);
    canUnlink =
      linkedEvent !== null &&
      getStatusPhase(linkedEvent.event_statuses.code) === EVENT_PHASE.COMMERCIAL;
  } else {
    linkableEvents = await getLinkableEventsForCustomer(quote.customer_id);
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-6 py-8">
      <QuotePageHeader
        quoteId={quote.id}
        quoteNumber={quote.quote_number}
        eventId={quote.event_id}
        canUnlink={canUnlink}
        linkableEvents={linkableEvents}
      />
      <QuoteForm
        customerTypes={customerTypes}
        products={products}
        categories={categories}
        lineTypes={lineTypes}
        taxes={taxes}
        deliveryZones={deliveryZones}
        discountCodes={discountCodes}
        defaultTaxId={defaultTax?.id}
        quote={quote}
        hideTitle
      />
    </main>
  );
}
