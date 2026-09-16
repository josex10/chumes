import {
  formatWeekRange,
  getWeekBounds,
  getWeekKey,
  parseWeekKey,
} from "@/lib/dashboard/stats";
import { EVENT_PHASE } from "@/lib/events/constants";
import { getCostaRicaWeekBounds } from "@/lib/follow-ups/calendar";
import {
  PRODUCT_EDIT_TAB,
  PRODUCT_RESERVATIONS_PAGE_SIZE,
} from "@/lib/products/constants";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type ProductEventReservation = {
  eventId: string;
  eventTitle: string;
  eventDate: string | null;
  customerName: string;
  statusName: string;
  statusCode: string;
  quantity: number;
};

export type ProductEventReservationsResult = {
  rows: ProductEventReservation[];
  total: number;
  totalQuantity: number;
  page: number;
  pageSize: number;
  weekKey: string;
  weekRange: string;
  dateOrder: ReservationDateOrder;
};

export type ReservationDateOrder = "asc" | "desc";

const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseReservationPage(value: string | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function parseReservationDateOrder(
  value: string | undefined,
): ReservationDateOrder {
  return value === "desc" ? "desc" : "asc";
}

export function parseReservationWeekKey(value: string | undefined): string {
  if (!value || !WEEK_KEY_PATTERN.test(value)) {
    return getWeekKey();
  }

  const parsed = parseWeekKey(value);
  if (Number.isNaN(parsed.getTime())) {
    return getWeekKey();
  }

  return getWeekKey(parsed);
}

export function buildProductReservationsHref(
  productId: string,
  options: {
    page?: number;
    weekKey?: string;
    dateOrder?: ReservationDateOrder;
  } = {},
) {
  const params = new URLSearchParams();
  params.set("tab", PRODUCT_EDIT_TAB.RESERVATIONS);

  const currentWeekKey = getWeekKey();
  if (options.weekKey && options.weekKey !== currentWeekKey) {
    params.set("week", options.weekKey);
  }

  if (options.dateOrder === "desc") {
    params.set("order", "desc");
  }

  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }

  return `/products/${productId}/edit?${params.toString()}`;
}

export async function getProductEventReservations(
  productId: string,
  page = 1,
  weekKey = getWeekKey(),
  dateOrder: ReservationDateOrder = "asc",
  pageSize = PRODUCT_RESERVATIONS_PAGE_SIZE,
): Promise<ProductEventReservationsResult> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(pageSize, 100));
  const { startKey, endKey } = getCostaRicaWeekBounds(weekKey);
  const { start, end } = getWeekBounds(parseWeekKey(weekKey));
  const supabase = createAdminSupabaseClient();
  const offset = (safePage - 1) * safePageSize;

  const empty: ProductEventReservationsResult = {
    rows: [],
    total: 0,
    totalQuantity: 0,
    page: safePage,
    pageSize: safePageSize,
    weekKey,
    weekRange: formatWeekRange(start, end),
    dateOrder,
  };

  const { data, error } = await supabase.rpc("list_product_event_reservations", {
    p_product_id: productId,
    p_phase: EVENT_PHASE.OPERATIONAL,
    p_limit: safePageSize,
    p_offset: offset,
    p_start_date: startKey,
    p_end_date: endKey,
    p_ascending: dateOrder !== "desc",
  });

  if (error) {
    console.error("[getProductEventReservations]", error.message);
    return empty;
  }

  const rows = (data ?? []).map((row) => ({
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventDate: row.event_date,
    customerName: row.customer_name,
    statusName: row.status_name,
    statusCode: row.status_code,
    quantity: Number(row.quantity),
  }));

  return {
    rows,
    total: Number(data?.[0]?.total_count ?? 0),
    totalQuantity: Number(data?.[0]?.total_quantity ?? 0),
    page: safePage,
    pageSize: safePageSize,
    weekKey,
    weekRange: formatWeekRange(start, end),
    dateOrder,
  };
}
