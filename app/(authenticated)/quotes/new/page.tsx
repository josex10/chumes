import { getCustomerById, getCustomerTypes } from "@/lib/customers/queries";
import { getProductCategories, getQuotableProducts } from "@/lib/products/queries";
import {
  getDefaultTax,
  getDeliveryZones,
  getDiscountCodes,
  getQuoteLineTypes,
  getTaxes,
} from "@/lib/quotes/queries";
import { QuoteForm } from "@/components/quotes/quote-form";

export const dynamic = "force-dynamic";

type NewQuotePageProps = {
  searchParams: Promise<{ eventId?: string; customerId?: string }>;
};

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
  const { eventId, customerId } = await searchParams;

  const [
    customerTypes,
    products,
    categories,
    lineTypes,
    taxes,
    deliveryZones,
    discountCodes,
    defaultTax,
    defaultCustomer,
  ] = await Promise.all([
    getCustomerTypes(),
    getQuotableProducts(),
    getProductCategories(),
    getQuoteLineTypes(),
    getTaxes(),
    getDeliveryZones(),
    getDiscountCodes(),
    getDefaultTax(),
    customerId ? getCustomerById(customerId) : Promise.resolve(null),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-8">
      <QuoteForm
        customerTypes={customerTypes}
        products={products}
        categories={categories}
        lineTypes={lineTypes}
        taxes={taxes}
        deliveryZones={deliveryZones}
        discountCodes={discountCodes}
        defaultTaxId={defaultTax?.id}
        eventId={eventId}
        defaultCustomer={defaultCustomer ?? undefined}
      />
    </main>
  );
}
