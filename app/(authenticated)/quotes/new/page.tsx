import { getCustomers } from "@/lib/customers/queries";
import { getQuotableProducts } from "@/lib/products/queries";
import {
  getDefaultTax,
  getDeliveryZones,
  getDiscountCodes,
  getQuoteLineTypes,
  getTaxes,
} from "@/lib/quotes/queries";
import { QuoteForm } from "@/components/quotes/quote-form";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const [
    customers,
    products,
    lineTypes,
    taxes,
    deliveryZones,
    discountCodes,
    defaultTax,
  ] = await Promise.all([
    getCustomers(),
    getQuotableProducts(),
    getQuoteLineTypes(),
    getTaxes(),
    getDeliveryZones(),
    getDiscountCodes(),
    getDefaultTax(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <QuoteForm
        customers={customers}
        products={products}
        lineTypes={lineTypes}
        taxes={taxes}
        deliveryZones={deliveryZones}
        discountCodes={discountCodes}
        defaultTaxId={defaultTax?.id}
      />
    </main>
  );
}
