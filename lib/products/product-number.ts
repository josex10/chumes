import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const PRODUCT_NUMBER_PREFIX = "PRD-";
const PRODUCT_NUMBER_PAD = 6;

export function formatProductNumber(sequence: number): string {
  return `${PRODUCT_NUMBER_PREFIX}${String(sequence).padStart(PRODUCT_NUMBER_PAD, "0")}`;
}

export async function generateNextProductNumber(): Promise<string> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("product_number")
    .like("product_number", `${PRODUCT_NUMBER_PREFIX}%`)
    .order("product_number", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[generateNextProductNumber]", error.message);
    return formatProductNumber(1);
  }

  const latest = data?.[0]?.product_number;
  if (!latest) {
    return formatProductNumber(1);
  }

  const numericPart = latest.replace(PRODUCT_NUMBER_PREFIX, "");
  const parsed = Number.parseInt(numericPart, 10);
  const next = Number.isFinite(parsed) ? parsed + 1 : 1;

  return formatProductNumber(next);
}
