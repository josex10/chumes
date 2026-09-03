import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { resolveCustomerPhone } from "@/lib/customers/phone";
import { todayInCostaRica } from "@/lib/follow-ups/calendar";
import {
  LOGISTICS_TAB,
  PICKUP_STATUS_CODES,
  PREP_STEPS,
  WAREHOUSE_STATUS_CODES,
  type LogisticsTab,
  type LogisticsWindow,
} from "@/lib/logistics/constants";
import { locationLabel, mapsUrl } from "@/lib/logistics/maps";
import {
  buildPackingList,
  packingListHasShortage,
  type BundleComponentForPacking,
  type QuoteLineForPacking,
} from "@/lib/logistics/packing-list";
import { isInLogisticsWindow, toLogisticsDateKey } from "@/lib/logistics/schedule";
import type { LogisticsQueue, LogisticsQueueItem } from "@/lib/logistics/types";
import { attachPaymentSummariesToEvents } from "@/lib/payments/queries";
import { PRODUCT_TYPE } from "@/lib/products/constants";
import type {
  EventLogistics,
  EventWithRelations,
  ProductCategory,
  ProductType,
} from "@/lib/supabase/types";

const EVENT_SELECT = `
  *,
  customers(*, customer_types(*)),
  customer_contacts(*),
  event_statuses(*),
  event_sources(*)
`;

const QUOTE_ITEMS_SELECT = `
  event_id,
  total,
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

type QuoteItemProduct = {
  id: string;
  name: string;
  product_categories: Pick<ProductCategory, "code" | "name"> | null;
  product_types: Pick<ProductType, "code"> | null;
};

type LogisticsQuoteRow = {
  event_id: string | null;
  total: number;
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

function prepCompletedCount(logistics: EventLogistics | null): number {
  if (!logistics) return 0;

  return PREP_STEPS.filter((step) => {
    switch (step.id) {
      case "inventory":
        return Boolean(logistics.inventory_checked_at);
      case "pulled":
        return Boolean(logistics.pulled_at);
      case "repaired":
        return Boolean(logistics.repaired_at);
      case "ironed":
        return Boolean(logistics.ironed_at);
      case "packed":
        return Boolean(logistics.packed_at);
    }
  }).length;
}

function isReadyForInstall(logistics: EventLogistics | null): boolean {
  return prepCompletedCount(logistics) === PREP_STEPS.length;
}

async function getLogisticsStatusIds(): Promise<number[]> {
  const supabase = createAdminSupabaseClient();
  const codes = [...WAREHOUSE_STATUS_CODES, ...PICKUP_STATUS_CODES];
  const { data, error } = await supabase
    .from("event_statuses")
    .select("id")
    .in("code", codes)
    .eq("is_active", true);

  if (error) {
    console.error("[getLogisticsStatusIds]", error.message);
    return [];
  }

  return (data ?? []).map((status) => status.id);
}

async function getLogisticsQuotes(
  eventIds: string[],
): Promise<Map<string, LogisticsQuoteRow>> {
  const quotesByEvent = new Map<string, LogisticsQuoteRow>();
  if (eventIds.length === 0) return quotesByEvent;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(QUOTE_ITEMS_SELECT)
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getLogisticsQuotes]", error.message);
    return quotesByEvent;
  }

  for (const row of (data ?? []) as LogisticsQuoteRow[]) {
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
    console.error("[getBundleComponents] logistics", error.message);
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
    console.error("[getStockByProductId] logistics", error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [row.product_id, Number(row.balance)]),
  );
}

async function getLogisticsByEvent(
  eventIds: string[],
): Promise<Map<string, EventLogistics>> {
  const byEvent = new Map<string, EventLogistics>();
  if (eventIds.length === 0) return byEvent;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_logistics")
    .select("*")
    .in("event_id", eventIds);

  if (error) {
    console.error("[getLogisticsByEvent]", error.message);
    return byEvent;
  }

  for (const row of data ?? []) {
    byEvent.set(row.event_id, row);
  }

  return byEvent;
}

function sortKeyForTab(event: EventWithRelations, tab: LogisticsTab): string | null {
  if (tab === LOGISTICS_TAB.PICKUP) {
    return event.pickup_date ?? event.delivery_date ?? event.event_date;
  }

  return event.delivery_date ?? event.event_date;
}

export async function getLogisticsQueue(
  window: LogisticsWindow,
): Promise<LogisticsQueue> {
  const supabase = createAdminSupabaseClient();
  const statusIds = await getLogisticsStatusIds();
  if (statusIds.length === 0) {
    return { warehouse: [], delivery: [], pickup: [] };
  }

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .in("status_id", statusIds);

  if (error) {
    console.error("[getLogisticsQueue]", error.message);
    return { warehouse: [], delivery: [], pickup: [] };
  }

  const events = (data ?? []) as EventWithRelations[];
  const eventIds = events.map((event) => event.id);
  const quotesByEvent = await getLogisticsQuotes(eventIds);

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
  const logisticsByEvent = await getLogisticsByEvent(eventIds);

  const paymentSummaries = await attachPaymentSummariesToEvents(
    events.map((event) => {
      const quote = quotesByEvent.get(event.id);
      return {
        id: event.id,
        quotes: quote ? [{ total: Number(quote.total) }] : [],
      };
    }),
  );

  const todayKey = todayInCostaRica();
  const warehouse: LogisticsQueueItem[] = [];
  const delivery: LogisticsQueueItem[] = [];
  const pickup: LogisticsQueueItem[] = [];

  for (const event of events) {
    const statusCode = event.event_statuses.code;
    const packingList = buildPackingList(
      quoteLinesByEvent.get(event.id) ?? [],
      bundles,
      stockByProductId,
    );
    const logistics = logisticsByEvent.get(event.id) ?? null;
    const phone = resolveCustomerPhone(
      event.customer_contacts?.phone,
      event.customers.phone,
    );

    const base = {
      event,
      phone,
      mapsUrl: mapsUrl(event.estimated_location),
      locationLabel: locationLabel(event.estimated_location),
      packingList,
      hasShortage: packingListHasShortage(packingList),
      paymentSummary: paymentSummaries.get(event.id) ?? null,
      logistics,
      prepCompleted: prepCompletedCount(logistics),
      prepTotal: PREP_STEPS.length,
      readyForInstall: isReadyForInstall(logistics),
    };

    if (WAREHOUSE_STATUS_CODES.includes(statusCode as (typeof WAREHOUSE_STATUS_CODES)[number])) {
      const sortAt = sortKeyForTab(event, LOGISTICS_TAB.WAREHOUSE);
      const dateKey = toLogisticsDateKey(sortAt);
      if (isInLogisticsWindow(dateKey, window, todayKey)) {
        const item: LogisticsQueueItem = {
          ...base,
          tab: LOGISTICS_TAB.WAREHOUSE,
          dateKey,
          sortAt,
        };
        warehouse.push(item);
        if (item.readyForInstall) {
          delivery.push({ ...item, tab: LOGISTICS_TAB.DELIVERY });
        }
      }
    }

    if (PICKUP_STATUS_CODES.includes(statusCode as (typeof PICKUP_STATUS_CODES)[number])) {
      const sortAt = sortKeyForTab(event, LOGISTICS_TAB.PICKUP);
      const dateKey = toLogisticsDateKey(sortAt);
      if (isInLogisticsWindow(dateKey, window, todayKey)) {
        pickup.push({
          ...base,
          tab: LOGISTICS_TAB.PICKUP,
          dateKey,
          sortAt,
        });
      }
    }
  }

  return { warehouse, delivery, pickup };
}
