import type { QuoteWithRelations } from "@/lib/supabase/types";

export function getQuotePdfFilename(quote: QuoteWithRelations): string {
  const customerSlug = quote.customers.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);

  return customerSlug
    ? `${quote.quote_number}-${customerSlug}.pdf`
    : `${quote.quote_number}.pdf`;
}
