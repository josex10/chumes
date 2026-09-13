import { EVENT_PHASE, type EventPhase } from "@/lib/events/constants";
import { PRODUCT_RESERVATIONS_PAGE_SIZE } from "@/lib/products/constants";
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
  page: number;
  pageSize: number;
};

const RESERVATION_PHASES = [
  EVENT_PHASE.COMMERCIAL,
  EVENT_PHASE.OPERATIONAL,
] as const;

export function parseReservationPage(value: string | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

function isReservationPhase(phase: string): phase is EventPhase {
  return RESERVATION_PHASES.includes(phase as (typeof RESERVATION_PHASES)[number]);
}

export async function getProductEventReservations(
  productId: string,
  phase: EventPhase,
  page = 1,
  pageSize = PRODUCT_RESERVATIONS_PAGE_SIZE,
): Promise<ProductEventReservationsResult> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(pageSize, 100));

  if (!isReservationPhase(phase)) {
    return { rows: [], total: 0, page: safePage, pageSize: safePageSize };
  }

  const supabase = createAdminSupabaseClient();
  const offset = (safePage - 1) * safePageSize;

  const { data, error } = await supabase.rpc("list_product_event_reservations", {
    p_product_id: productId,
    p_phase: phase,
    p_limit: safePageSize,
    p_offset: offset,
  });

  if (error) {
    console.error("[getProductEventReservations]", error.message);
    return { rows: [], total: 0, page: safePage, pageSize: safePageSize };
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
    page: safePage,
    pageSize: safePageSize,
  };
}
