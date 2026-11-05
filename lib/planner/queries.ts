import { EVENT_PHASE } from "@/lib/events/constants";
import { resolveCustomerPhone } from "@/lib/customers/phone";
import {
  buildPackingList,
  type BundleComponentForPacking,
  type QuoteLineForPacking,
} from "@/lib/logistics/packing-list";
import { PRODUCT_TYPE } from "@/lib/products/constants";
import type { PlannerEvent } from "@/lib/planner/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ProductCategory, ProductType } from "@/lib/supabase/types";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

const EVENT_SELECT = `
  id,
  title,
  event_date,
  delivery_date,
  pickup_date,
  estimated_location,
  notes,
  customers(name, phone),
  customer_contacts(phone),
  event_statuses(code, name)
`;

const QUOTE_ITEMS_SELECT = `
  event_id,
  quote_items(
    quantity,
    description,
    sort_order,
    products(
      id,
      name,
      product_categories(code, name),
      product_types(code)
    )
  )
`;

type NamedRecord = {
  name?: string;
  phone?: string | null;
  code?: string;
};

type PlannerEventRow = {
  id: string;
  title: string;
  event_date: string | null;
  delivery_date: string | null;
  pickup_date: string | null;
  estimated_location: string | null;
  notes: string | null;
  customers: NamedRecord | NamedRecord[] | null;
  customer_contacts: { phone: string | null } | { phone: string | null }[] | null;
  event_statuses: { code: string; name: string } | { code: string; name: string }[] | null;
};

type QuoteItemProduct = {
  id: string;
  name: string;
  product_categories: Pick<ProductCategory, "code" | "name"> | null;
  product_types: Pick<ProductType, "code"> | null;
};

type PlannerQuoteRow = {
  event_id: string | null;
  quote_items: Array<{
    quantity: number;
    description: string | null;
    sort_order: number;
    products: QuoteItemProduct | null;
  }> | null;
};

type BundleComponentRow = {
  bundle_product_id: string;
  quantity: number;
  products: QuoteItemProduct | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toQuoteLine(item: {
  quantity: number;
  description: string | null;
  products: QuoteItemProduct | null;
}): QuoteLineForPacking | null {
  if (!item.products) return null;

  return {
    quantity: Number(item.quantity),
    description: item.description,
    product: {
      id: item.products.id,
      name: item.products.name,
      typeCode: item.products.product_types?.code ?? PRODUCT_TYPE.SIMPLE,
      categoryCode: item.products.product_categories?.code ?? "OTHER",
      categoryName: item.products.product_categories?.name ?? "Otros",
    },
  };
}

function comparePlannerEvents(a: PlannerEvent, b: PlannerEvent): number {
  if (a.eventDate !== b.eventDate) {
    return a.eventDate < b.eventDate ? -1 : 1;
  }

  if (a.deliveryDate && b.deliveryDate && a.deliveryDate !== b.deliveryDate) {
    return a.deliveryDate < b.deliveryDate ? -1 : 1;
  }

  if (a.deliveryDate && !b.deliveryDate) return -1;
  if (!a.deliveryDate && b.deliveryDate) return 1;
  return a.title.localeCompare(b.title, "es");
}

async function getOperationalStatusIds(): Promise<number[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_statuses")
    .select("id")
    .eq("phase", EVENT_PHASE.OPERATIONAL)
    .eq("is_active", true);

  if (error) {
    console.error("[getPlannerEvents] statuses", error.message);
    return [];
  }

  return (data ?? []).map((status) => status.id);
}

async function getQuotesByEvent(
  eventIds: string[],
): Promise<Map<string, PlannerQuoteRow>> {
  const quotesByEvent = new Map<string, PlannerQuoteRow>();
  if (eventIds.length === 0) return quotesByEvent;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(QUOTE_ITEMS_SELECT)
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPlannerEvents] quotes", error.message);
    return quotesByEvent;
  }

  for (const row of (data ?? []) as PlannerQuoteRow[]) {
    if (!row.event_id || quotesByEvent.has(row.event_id)) continue;
    quotesByEvent.set(row.event_id, row);
  }

  return quotesByEvent;
}

async function getBundleComponents(
  bundleProductIds: string[],
): Promise<BundleComponentForPacking[]> {
  if (bundleProductIds.length === 0) return [];

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_bundle_items")
    .select(
      "bundle_product_id, quantity, products!product_bundle_items_component_product_id_fkey(id, name, product_categories(code, name), product_types(code))",
    )
    .in("bundle_product_id", bundleProductIds);

  if (error) {
    console.error("[getPlannerEvents] bundles", error.message);
    return [];
  }

  return ((data ?? []) as BundleComponentRow[]).flatMap((row) => {
    if (!row.products) return [];
    return [
      {
        bundleProductId: row.bundle_product_id,
        componentProductId: row.products.id,
        componentName: row.products.name,
        componentCategoryCode: row.products.product_categories?.code ?? "OTHER",
        componentCategoryName: row.products.product_categories?.name ?? "Otros",
        quantity: Number(row.quantity),
      },
    ];
  });
}

async function getStockByProductId(
  productIds: string[],
): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_stock_balances")
    .select("product_id, balance")
    .in("product_id", productIds);

  if (error) {
    console.error("[getPlannerEvents] stock", error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [row.product_id, Number(row.balance)]),
  );
}

export async function getPlannerEvents(
  startKey: string,
  endKey: string,
): Promise<PlannerEvent[]> {
  if (!DATE_KEY.test(startKey) || !DATE_KEY.test(endKey) || startKey > endKey) {
    return [];
  }

  const statusIds = await getOperationalStatusIds();
  if (statusIds.length === 0) return [];

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .in("status_id", statusIds)
    .gte("event_date", startKey)
    .lte("event_date", endKey)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("[getPlannerEvents]", error.message);
    return [];
  }

  const rows = ((data ?? []) as PlannerEventRow[]).filter(
    (row): row is PlannerEventRow & { event_date: string } =>
      Boolean(row.event_date),
  );
  const quotesByEvent = await getQuotesByEvent(rows.map((row) => row.id));

  const quoteLinesByEvent = new Map<string, QuoteLineForPacking[]>();
  const bundleProductIds = new Set<string>();

  for (const [eventId, quote] of quotesByEvent) {
    const lines = (quote.quote_items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((item) => {
        const line = toQuoteLine(item);
        return line ? [line] : [];
      });
    quoteLinesByEvent.set(eventId, lines);

    for (const line of lines) {
      if (line.product.typeCode === PRODUCT_TYPE.BUNDLE) {
        bundleProductIds.add(line.product.id);
      }
    }
  }

  const bundles = await getBundleComponents([...bundleProductIds]);
  const stockIds = [
    ...[...quoteLinesByEvent.values()].flatMap((lines) =>
      lines.map((line) => line.product.id),
    ),
    ...bundles.map((component) => component.componentProductId),
  ];
  const stockByProductId = await getStockByProductId([...new Set(stockIds)]);

  const events = rows.map((row) => {
    const customer = first(row.customers);
    const contact = first(row.customer_contacts);
    const status = first(row.event_statuses);
    const packingList = buildPackingList(
      quoteLinesByEvent.get(row.id) ?? [],
      bundles,
      stockByProductId,
    );

    return {
      id: row.id,
      title: row.title,
      eventDate: row.event_date,
      deliveryDate: row.delivery_date,
      pickupDate: row.pickup_date,
      location: blankToNull(row.estimated_location),
      notes: blankToNull(row.notes),
      customerName: customer?.name?.trim() || row.title,
      phone: resolveCustomerPhone(contact?.phone, customer?.phone),
      statusCode: status?.code ?? "",
      statusName: status?.name ?? "Reservado",
      packingList,
    } satisfies PlannerEvent;
  });

  events.sort(comparePlannerEvents);
  return events;
}
