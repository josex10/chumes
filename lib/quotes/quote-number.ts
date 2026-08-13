import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const QUOTE_NUMBER_PREFIX = "QTE-";
const QUOTE_NUMBER_PAD = 6;

export function formatQuoteNumber(sequence: number): string {
  return `${QUOTE_NUMBER_PREFIX}${String(sequence).padStart(QUOTE_NUMBER_PAD, "0")}`;
}

export async function generateNextQuoteNumber(): Promise<string> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("quote_number")
    .like("quote_number", `${QUOTE_NUMBER_PREFIX}%`)
    .order("quote_number", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[generateNextQuoteNumber]", error.message);
    return formatQuoteNumber(1);
  }

  const latest = data?.[0]?.quote_number;
  if (!latest) {
    return formatQuoteNumber(1);
  }

  const numericPart = latest.replace(QUOTE_NUMBER_PREFIX, "");
  const parsed = Number.parseInt(numericPart, 10);
  const next = Number.isFinite(parsed) ? parsed + 1 : 1;

  return formatQuoteNumber(next);
}
