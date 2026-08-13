import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdfDocument } from "@/lib/quotes/pdf/quote-pdf-document";
import type { QuoteWithRelations } from "@/lib/supabase/types";

export async function generateQuotePdf(
  quote: QuoteWithRelations,
): Promise<Buffer> {
  const buffer = await renderToBuffer(<QuotePdfDocument quote={quote} />);
  return Buffer.from(buffer);
}
