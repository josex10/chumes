"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  calculateQuoteTotals,
} from "@/lib/quotes/calculations";
import { QUOTE_STATUS } from "@/lib/quotes/constants";
import { generateNextQuoteNumber } from "@/lib/quotes/quote-number";
import {
  getDiscountCodeByCode,
  getDefaultTax,
} from "@/lib/quotes/queries";
import {
  quoteFormSchema,
  type QuoteFormValues,
} from "@/lib/quotes/schema";
import {
  canTransitionStatus,
} from "@/lib/quotes/status-transitions";

type ActionResult =
  | { success: true; quoteId?: string }
  | { success: false; error: string };

async function getDraftStatusId(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_statuses")
    .select("id")
    .eq("code", QUOTE_STATUS.DRAFT)
    .single();

  if (error || !data) {
    throw new Error("Could not load draft status.");
  }

  return data.id;
}

async function getStatusIdByCode(code: string): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_statuses")
    .select("id")
    .eq("code", code)
    .single();

  if (error || !data) {
    throw new Error(`Could not load status ${code}.`);
  }

  return data.id;
}

async function resolveQuoteContext(values: QuoteFormValues) {
  const supabase = createAdminSupabaseClient();
  const defaultTax = await getDefaultTax();

  let deliverySuggestedFee: number | null = null;
  if (values.delivery_zone_id) {
    const { data: zone } = await supabase
      .from("delivery_zones")
      .select("suggested_fee")
      .eq("id", values.delivery_zone_id)
      .maybeSingle();
    deliverySuggestedFee = zone?.suggested_fee ?? null;
  }

  const deliveryFee =
    values.delivery_fee ?? deliverySuggestedFee ?? 0;

  const deliveryTaxId =
    values.delivery_tax_id === null
      ? null
      : values.delivery_tax_id != null
        ? values.delivery_tax_id
        : defaultTax?.id ?? null;

  let discountCode = null;
  let manualDiscount: Pick<import("@/lib/supabase/types").DiscountCode, "discount_type" | "value"> | null = null;

  if (values.discount_mode === "code" && values.discount_code?.trim()) {
    discountCode = await getDiscountCodeByCode(values.discount_code);
    if (!discountCode) {
      throw new Error("Invalid or inactive discount code.");
    }
  } else if (
    values.discount_mode === "manual" &&
    values.manual_discount_value != null &&
    values.manual_discount_value > 0
  ) {
    manualDiscount = {
      discount_type: values.manual_discount_type,
      value: values.manual_discount_value,
    };
  }

  const taxRates = new Map<number, number>();
  const taxesResult = await supabase.from("taxes").select("id, rate");
  for (const tax of taxesResult.data ?? []) {
    taxRates.set(tax.id, Number(tax.rate));
  }

  const lineInputs = values.items.map((item) => {
    const taxId =
      item.tax_id === null
        ? null
        : item.tax_id != null
          ? item.tax_id
          : defaultTax?.id ?? null;
    const taxRate = taxId ? taxRates.get(taxId) ?? 0 : 0;
    return {
      product_id: item.product_id,
      line_type_id: item.line_type_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_id: taxId,
      tax_rate: taxRate,
      description: item.description?.trim() || null,
    };
  });

  const deliveryTaxRate = deliveryTaxId ? taxRates.get(deliveryTaxId) ?? 0 : 0;

  const totals = calculateQuoteTotals({
    lines: lineInputs.map((line) => ({
      quantity: line.quantity,
      unit_price: line.unit_price,
      tax_rate: line.tax_rate,
    })),
    discountCode,
    manualDiscount,
    deliveryFee: Number(deliveryFee),
    deliveryTaxRate,
  });

  return {
    deliverySuggestedFee,
    deliveryFee: totals.delivery_fee,
    deliveryTaxId,
    deliveryTaxAmount: totals.delivery_tax_amount,
    discountCode,
    manualDiscount,
    lineInputs,
    totals,
  };
}

function buildQuoteItems(
  quoteId: string,
  lineInputs: Awaited<ReturnType<typeof resolveQuoteContext>>["lineInputs"],
  calculatedLines: Awaited<ReturnType<typeof resolveQuoteContext>>["totals"]["lines"],
) {
  return lineInputs.map((line, index) => ({
    quote_id: quoteId,
    product_id: line.product_id,
    line_type_id: line.line_type_id,
    quantity: line.quantity,
    unit_price: line.unit_price,
    tax_id: line.tax_id,
    tax_rate: line.tax_rate,
    tax_amount: calculatedLines[index].tax_amount,
    line_subtotal: calculatedLines[index].line_subtotal,
    line_total: calculatedLines[index].line_total,
    description: line.description,
    sort_order: index,
  }));
}

export async function createQuote(values: QuoteFormValues): Promise<ActionResult> {
  const parsed = quoteFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const draftStatusId = await getDraftStatusId();
    const quoteNumber = await generateNextQuoteNumber();
    const context = await resolveQuoteContext(parsed.data);

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        quote_number: quoteNumber,
        customer_id: parsed.data.customer_id,
        status_id: draftStatusId,
        estimated_location: parsed.data.estimated_location?.trim() || null,
        delivery_zone_id: parsed.data.delivery_zone_id ?? null,
        delivery_suggested_fee: context.deliverySuggestedFee,
        delivery_fee: context.deliveryFee,
        delivery_tax_id: context.deliveryTaxId,
        delivery_tax_amount: context.deliveryTaxAmount,
        discount_code_id: context.discountCode?.id ?? null,
        discount_amount: context.totals.discount_amount,
        manual_discount_type: context.manualDiscount?.discount_type ?? null,
        manual_discount_value: context.manualDiscount?.value ?? null,
        subtotal: context.totals.subtotal,
        tax_total: context.totals.tax_total,
        total: context.totals.total,
        notes: parsed.data.notes?.trim() || null,
        valid_until: parsed.data.valid_until?.trim() || null,
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (quoteError || !quote) {
      console.error("[createQuote]", quoteError?.message);
      return { success: false, error: "Could not create quote." };
    }

    const items = buildQuoteItems(quote.id, context.lineInputs, context.totals.lines);
    const { error: itemsError } = await supabase.from("quote_items").insert(items);

    if (itemsError) {
      console.error("[createQuote items]", itemsError.message);
      await supabase.from("quotes").delete().eq("id", quote.id);
      return { success: false, error: "Could not create quote line items." };
    }

    revalidatePath("/quotes");
    return { success: true, quoteId: quote.id };
  } catch (error) {
    console.error("[createQuote]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create quote.",
    };
  }
}

export async function updateQuote(
  id: string,
  values: QuoteFormValues,
): Promise<ActionResult> {
  const parsed = quoteFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();

    const { data: existing, error: existingError } = await supabase
      .from("quotes")
      .select("is_locked")
      .eq("id", id)
      .single();

    if (existingError || !existing) {
      return { success: false, error: "Quote not found." };
    }

    if (existing.is_locked) {
      return { success: false, error: "Approved quotes cannot be edited." };
    }

    const context = await resolveQuoteContext(parsed.data);

    const { error: quoteError } = await supabase
      .from("quotes")
      .update({
        customer_id: parsed.data.customer_id,
        estimated_location: parsed.data.estimated_location?.trim() || null,
        delivery_zone_id: parsed.data.delivery_zone_id ?? null,
        delivery_suggested_fee: context.deliverySuggestedFee,
        delivery_fee: context.deliveryFee,
        delivery_tax_id: context.deliveryTaxId,
        delivery_tax_amount: context.deliveryTaxAmount,
        discount_code_id: context.discountCode?.id ?? null,
        discount_amount: context.totals.discount_amount,
        manual_discount_type: context.manualDiscount?.discount_type ?? null,
        manual_discount_value: context.manualDiscount?.value ?? null,
        subtotal: context.totals.subtotal,
        tax_total: context.totals.tax_total,
        total: context.totals.total,
        notes: parsed.data.notes?.trim() || null,
        valid_until: parsed.data.valid_until?.trim() || null,
        updated_by: userId,
      })
      .eq("id", id);

    if (quoteError) {
      console.error("[updateQuote]", quoteError.message);
      return { success: false, error: "Could not update quote." };
    }

    const { error: deleteError } = await supabase
      .from("quote_items")
      .delete()
      .eq("quote_id", id);

    if (deleteError) {
      console.error("[updateQuote delete items]", deleteError.message);
      return { success: false, error: "Could not update quote line items." };
    }

    const items = buildQuoteItems(id, context.lineInputs, context.totals.lines);
    const { error: itemsError } = await supabase.from("quote_items").insert(items);

    if (itemsError) {
      console.error("[updateQuote items]", itemsError.message);
      return { success: false, error: "Could not update quote line items." };
    }

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${id}/edit`);
    return { success: true, quoteId: id };
  } catch (error) {
    console.error("[updateQuote]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update quote.",
    };
  }
}

export async function updateQuoteStatus(
  id: string,
  nextStatusCode: string,
): Promise<ActionResult> {
  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, status_id")
      .eq("id", id)
      .single();

    if (quoteError || !quote) {
      return { success: false, error: "Quote not found." };
    }

    const { data: currentStatus, error: statusError } = await supabase
      .from("quote_statuses")
      .select("code")
      .eq("id", quote.status_id)
      .single();

    if (statusError || !currentStatus) {
      return { success: false, error: "Could not load quote status." };
    }

    const currentStatusCode = currentStatus.code;
    if (!canTransitionStatus(currentStatusCode, nextStatusCode)) {
      return { success: false, error: "Invalid status transition." };
    }

    const nextStatusId = await getStatusIdByCode(nextStatusCode);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("quotes")
      .update({
        status_id: nextStatusId,
        updated_by: userId,
        sent_at: nextStatusCode === QUOTE_STATUS.SENT ? now : undefined,
        approved_at:
          nextStatusCode === QUOTE_STATUS.CUSTOMER_APPROVED ? now : undefined,
        is_locked:
          nextStatusCode === QUOTE_STATUS.CUSTOMER_APPROVED ? true : undefined,
        rejected_at:
          nextStatusCode === QUOTE_STATUS.REJECTED ? now : undefined,
        expired_at: nextStatusCode === QUOTE_STATUS.EXPIRED ? now : undefined,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateQuoteStatus]", error.message);
      return { success: false, error: "Could not update quote status." };
    }

    revalidatePath("/quotes");
    revalidatePath(`/quotes/${id}/edit`);
    return { success: true, quoteId: id };
  } catch (error) {
    console.error("[updateQuoteStatus]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update quote status.",
    };
  }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, status_id")
      .eq("id", id)
      .single();

    if (quoteError || !quote) {
      return { success: false, error: "Quote not found." };
    }

    const { data: currentStatus, error: statusError } = await supabase
      .from("quote_statuses")
      .select("code")
      .eq("id", quote.status_id)
      .single();

    if (statusError || !currentStatus) {
      return { success: false, error: "Could not load quote status." };
    }

    if (currentStatus.code !== QUOTE_STATUS.DRAFT) {
      return { success: false, error: "Only draft quotes can be deleted." };
    }

    const { error } = await supabase.from("quotes").delete().eq("id", id);

    if (error) {
      console.error("[deleteQuote]", error.message);
      return { success: false, error: "Could not delete quote." };
    }

    revalidatePath("/quotes");
    return { success: true };
  } catch (error) {
    console.error("[deleteQuote]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete quote.",
    };
  }
}
