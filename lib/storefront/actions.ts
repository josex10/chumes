"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  extractPhoneDigits,
  formatPhoneNumber,
} from "@/lib/customers/phone";
import { EVENT_PRIORITY } from "@/lib/events/constants";
import { getInquiryStatusId } from "@/lib/events/queries";
import { linkQuoteToEvent } from "@/lib/events/actions";
import { PRODUCT_PRICE_TYPE } from "@/lib/products/constants";
import { calculateQuoteTotals } from "@/lib/quotes/calculations";
import { QUOTE_LINE_TYPE, QUOTE_STATUS } from "@/lib/quotes/constants";
import { generateNextQuoteNumber } from "@/lib/quotes/quote-number";
import { getDefaultTax, getQuoteLineTypes } from "@/lib/quotes/queries";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getPublicProductsByIds } from "@/lib/storefront/queries";
import { checkRateLimit } from "@/lib/storefront/rate-limit";
import {
  getQuoteRequestRateLimitKey,
  quoteRequestSchema,
  type QuoteRequestInput,
} from "@/lib/storefront/schema";

type ActionResult =
  | { success: true; eventId: string; quoteId: string }
  | { success: false; error: string };

async function getWebsiteSourceId(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_sources")
    .select("id")
    .eq("code", "WEBSITE")
    .single();

  if (error || !data) {
    throw new Error("Could not load website event source.");
  }

  return data.id;
}

async function getIndividualCustomerTypeId(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customer_types")
    .select("id")
    .eq("code", "INDIVIDUAL")
    .single();

  if (error || !data) {
    throw new Error("Could not load individual customer type.");
  }

  return data.id;
}

async function getDraftStatusId(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_statuses")
    .select("id")
    .eq("code", QUOTE_STATUS.DRAFT)
    .single();

  if (error || !data) {
    throw new Error("Could not load draft quote status.");
  }

  return data.id;
}

async function findOrCreateCustomer(values: QuoteRequestInput) {
  const supabase = createAdminSupabaseClient();
  const formattedPhone = formatPhoneNumber(values.phone);
  const digits = extractPhoneDigits(values.phone);

  const { data: existingCustomers } = await supabase
    .from("customers")
    .select("id, notes")
    .or(`phone.eq.${formattedPhone},phone.ilike.%${digits}%`)
    .limit(1);

  if (existingCustomers && existingCustomers.length > 0) {
    const customer = existingCustomers[0];
    const noteLine = `[Web ${new Date().toLocaleDateString("es-CR")}] Nueva solicitud de cotización.`;
    const notes = customer.notes ? `${customer.notes}\n${noteLine}` : noteLine;

    await supabase
      .from("customers")
      .update({
        email: values.email?.trim() || null,
        notes,
      })
      .eq("id", customer.id);

    return customer.id;
  }

  const customerTypeId = await getIndividualCustomerTypeId();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: values.name.trim(),
      phone: formattedPhone,
      email: values.email?.trim() || null,
      customer_type_id: customerTypeId,
      notes: "Cliente creado desde el sitio web.",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Could not create customer.");
  }

  return data.id;
}

export async function submitQuoteRequest(
  values: QuoteRequestInput,
): Promise<ActionResult> {
  const parsed = quoteRequestSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  if (parsed.data.website?.trim()) {
    return {
      success: true,
      eventId: "honeypot",
      quoteId: "honeypot",
    };
  }

  const rateLimitKey = getQuoteRequestRateLimitKey(parsed.data.phone);
  if (!checkRateLimit(rateLimitKey)) {
    return {
      success: false,
      error: "Demasiadas solicitudes. Intente de nuevo más tarde.",
    };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(`ip:${ip}`)) {
    return {
      success: false,
      error: "Demasiadas solicitudes. Intente de nuevo más tarde.",
    };
  }

  try {
    const supabase = createAdminSupabaseClient();
    const productIds = parsed.data.items.map((item) => item.product_id);
    const products = await getPublicProductsByIds(productIds);
    const productsById = new Map(products.map((product) => [product.id, product]));
    const lineTypes = await getQuoteLineTypes();
    const defaultTax = await getDefaultTax();

    const rentalLineTypeId = lineTypes.find(
      (type) => type.code === QUOTE_LINE_TYPE.RENTAL,
    )?.id;
    const saleLineTypeId = lineTypes.find(
      (type) => type.code === QUOTE_LINE_TYPE.SALE,
    )?.id;

    if (!rentalLineTypeId || !saleLineTypeId) {
      return { success: false, error: "No se pudo procesar la solicitud." };
    }

    const lineInputs = [];
    for (const item of parsed.data.items) {
      const product = productsById.get(item.product_id);
      if (!product) {
        return { success: false, error: "Uno de los productos ya no está disponible." };
      }

      if (item.line_type === QUOTE_LINE_TYPE.RENTAL) {
        if (!product.rental_available || product.rental_price == null) {
          return {
            success: false,
            error: `${product.name} no está disponible para alquiler.`,
          };
        }

        lineInputs.push({
          product_id: product.id,
          line_type_id: rentalLineTypeId,
          quantity: item.quantity,
          unit_price: product.rental_price,
          tax_id: defaultTax?.id ?? null,
          tax_rate: defaultTax ? Number(defaultTax.rate) : 0,
          description: null,
        });
        continue;
      }

      if (!product.sale_available || product.sale_price == null) {
        return {
          success: false,
          error: `${product.name} no está disponible para venta.`,
        };
      }

      lineInputs.push({
        product_id: product.id,
        line_type_id: saleLineTypeId,
        quantity: item.quantity,
        unit_price: product.sale_price,
        tax_id: defaultTax?.id ?? null,
        tax_rate: defaultTax ? Number(defaultTax.rate) : 0,
        description: null,
      });
    }

    const totals = calculateQuoteTotals({
      lines: lineInputs.map((line) => ({
        quantity: line.quantity,
        unit_price: line.unit_price,
        tax_rate: line.tax_rate,
      })),
      discountCode: null,
      manualDiscount: null,
      deliveryFee: 0,
      deliveryTaxRate: 0,
    });

    const customerId = await findOrCreateCustomer(parsed.data);
    const [inquiryStatusId, websiteSourceId, draftStatusId] = await Promise.all([
      getInquiryStatusId(),
      getWebsiteSourceId(),
      getDraftStatusId(),
    ]);

    const now = new Date().toISOString();
    const eventTitle = `Solicitud web — ${parsed.data.name.trim()}`;
    const eventNotes = [
      parsed.data.notes?.trim(),
      "Solicitud recibida desde el catálogo público.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title: eventTitle,
        customer_id: customerId,
        source_id: websiteSourceId,
        status_id: inquiryStatusId,
        event_date: parsed.data.event_date?.trim() || null,
        estimated_location: parsed.data.estimated_location?.trim() || null,
        notes: eventNotes || null,
        priority: EVENT_PRIORITY.NORMAL,
        first_contact_at: now,
        last_contact_at: now,
        created_by: null,
        updated_by: null,
      })
      .select("id")
      .single();

    if (eventError || !event) {
      console.error("[submitQuoteRequest event]", eventError?.message);
      return { success: false, error: "No se pudo registrar la solicitud." };
    }

    const quoteNumber = await generateNextQuoteNumber();
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        quote_number: quoteNumber,
        customer_id: customerId,
        status_id: draftStatusId,
        estimated_location: parsed.data.estimated_location?.trim() || null,
        delivery_fee: 0,
        delivery_tax_amount: 0,
        discount_amount: 0,
        subtotal: totals.subtotal,
        tax_total: totals.tax_total,
        total: totals.total,
        notes: parsed.data.notes?.trim() || null,
        created_by: null,
        updated_by: null,
      })
      .select("id")
      .single();

    if (quoteError || !quote) {
      console.error("[submitQuoteRequest quote]", quoteError?.message);
      await supabase.from("events").delete().eq("id", event.id);
      return { success: false, error: "No se pudo crear la cotización." };
    }

    const quoteItems = lineInputs.map((line, index) => ({
      quote_id: quote.id,
      product_id: line.product_id,
      line_type_id: line.line_type_id,
      quantity: line.quantity,
      unit_price: line.unit_price,
      tax_id: line.tax_id,
      tax_rate: line.tax_rate,
      tax_amount: totals.lines[index].tax_amount,
      line_subtotal: totals.lines[index].line_subtotal,
      line_total: totals.lines[index].line_total,
      description: line.description,
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItems);

    if (itemsError) {
      console.error("[submitQuoteRequest items]", itemsError.message);
      await supabase.from("quotes").delete().eq("id", quote.id);
      await supabase.from("events").delete().eq("id", event.id);
      return { success: false, error: "No se pudo crear la cotización." };
    }

    const linkResult = await linkQuoteToEvent(quote.id, event.id);
    if (!linkResult.success) {
      await supabase.from("quotes").delete().eq("id", quote.id);
      await supabase.from("events").delete().eq("id", event.id);
      return { success: false, error: linkResult.error };
    }

    revalidatePath("/events");
    revalidatePath("/quotes");
    revalidatePath("/dashboard");

    return { success: true, eventId: event.id, quoteId: quote.id };
  } catch (error) {
    console.error("[submitQuoteRequest]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo enviar la solicitud.",
    };
  }
}
