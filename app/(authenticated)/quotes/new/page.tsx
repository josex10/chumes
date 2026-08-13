import { getCustomers, getCustomerTypes } from "@/lib/customers/queries";
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

export default async function NewQuotePage() {
  const [
    customers,
    customerTypes,
    products,
    categories,
    lineTypes,
    taxes,
    deliveryZones,
    discountCodes,
    defaultTax,
  ] = await Promise.all([
    getCustomers(),
    getCustomerTypes(),
    getQuotableProducts(),
    getProductCategories(),
    getQuoteLineTypes(),
    getTaxes(),
    getDeliveryZones(),
    getDiscountCodes(),
    getDefaultTax(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-8">
      <QuoteForm
        customers={customers}
        customerTypes={customerTypes}
        products={products}
        categories={categories}
        lineTypes={lineTypes}
        taxes={taxes}
        deliveryZones={deliveryZones}
        discountCodes={discountCodes}
        defaultTaxId={defaultTax?.id}
      />
    </main>
  );
}
