import { notFound } from "next/navigation";
import { getCustomers, getCustomerTypes } from "@/lib/customers/queries";
import { getProductCategories, getQuotableProducts } from "@/lib/products/queries";
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
    customerTypes,
    products,
    categories,
    lineTypes,
    taxes,
    deliveryZones,
    discountCodes,
    defaultTax,
  ] = await Promise.all([
    getQuoteById(id),
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

  if (!quote) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex justify-end">
        <QuoteDownloadButton quoteId={quote.id} />
      </div>
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
        quote={quote}
      />
    </main>
  );
}
