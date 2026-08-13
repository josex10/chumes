import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { DEFAULT_TAX_CODE } from "@/lib/quotes/constants";
import type {
  DeliveryZone,
  DiscountCode,
  QuoteLineType,
  QuoteStatus,
  QuoteWithRelations,
  Tax,
} from "@/lib/supabase/types";

export async function getQuoteStatuses(): Promise<QuoteStatus[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_statuses")
    .select("*")
    .eq("is_active", true)
    .order("id");

  if (error) {
    console.error("[getQuoteStatuses]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getQuoteLineTypes(): Promise<QuoteLineType[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_line_types")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getQuoteLineTypes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getTaxes(): Promise<Tax[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("taxes")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getTaxes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getDefaultTax(): Promise<Tax | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("taxes")
    .select("*")
    .eq("code", DEFAULT_TAX_CODE)
    .maybeSingle();

  if (error) {
    console.error("[getDefaultTax]", error.message);
    return null;
  }

  return data;
}

export async function getDiscountCodes(): Promise<DiscountCode[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("is_active", true)
    .order("code");

  if (error) {
    console.error("[getDiscountCodes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getDeliveryZones]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getQuotes(): Promise<QuoteWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*, customers(*, customer_types(*)), quote_statuses(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getQuotes]", error.message);
    return [];
  }

  return (data ?? []) as QuoteWithRelations[];
}

export async function getQuoteById(id: string): Promise<QuoteWithRelations | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "*, customers(*, customer_types(*)), quote_statuses(*), delivery_zones(*), discount_codes(*), quote_items(*, products(*), quote_line_types(*), taxes(*))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getQuoteById]", error.message);
    return null;
  }

  if (!data) return null;

  const quote = data as QuoteWithRelations;
  if (quote.quote_items) {
    quote.quote_items.sort((a, b) => a.sort_order - b.sort_order);
  }

  return quote;
}

export async function getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getDiscountCodeByCode]", error.message);
    return null;
  }

  return data;
}
