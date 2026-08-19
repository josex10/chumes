import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { calculatePaymentSummary } from "@/lib/payments/calculations";
import type {
  EventFinancialMovementWithRelations,
  PaymentMethod,
  PaymentSummary,
} from "@/lib/supabase/types";

const MOVEMENT_SELECT = `
  *,
  payment_methods(*)
`;

async function getLinkedQuoteTotal(eventId: string): Promise<number | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("total")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getLinkedQuoteTotal]", error.message);
    return null;
  }

  if (!data) return null;

  const total = Number(data.total);
  return total > 0 ? total : null;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getPaymentMethods]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getEventFinancialMovements(
  eventId: string,
): Promise<EventFinancialMovementWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_financial_movements")
    .select(MOVEMENT_SELECT)
    .eq("event_id", eventId)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getEventFinancialMovements]", error.message);
    return [];
  }

  return (data ?? []) as EventFinancialMovementWithRelations[];
}

export async function getEventPaymentSummary(
  eventId: string,
): Promise<PaymentSummary | null> {
  const quoteTotal = await getLinkedQuoteTotal(eventId);
  if (quoteTotal === null) return null;

  const movements = await getEventFinancialMovements(eventId);

  return calculatePaymentSummary(
    quoteTotal,
    movements.map((m) => ({
      movement_type: m.movement_type,
      amount: Number(m.amount),
    })),
  );
}

export async function attachPaymentSummariesToEvents(
  events: Array<{ id: string; quotes?: { total: number }[] | null }>,
): Promise<Map<string, PaymentSummary>> {
  const summaries = new Map<string, PaymentSummary>();
  if (events.length === 0) return summaries;

  const eventIds = events
    .filter((event) => {
      const quote = event.quotes?.[0];
      return quote && Number(quote.total) > 0;
    })
    .map((event) => event.id);

  if (eventIds.length === 0) return summaries;

  const supabase = createAdminSupabaseClient();
  const { data: movements, error } = await supabase
    .from("event_financial_movements")
    .select("event_id, movement_type, amount")
    .in("event_id", eventIds);

  if (error) {
    console.error("[attachPaymentSummariesToEvents]", error.message);
    return summaries;
  }

  const movementsByEvent = new Map<
    string,
    { movement_type: "ADVANCE" | "REFUND"; amount: number }[]
  >();

  for (const movement of movements ?? []) {
    const list = movementsByEvent.get(movement.event_id) ?? [];
    list.push({
      movement_type: movement.movement_type as "ADVANCE" | "REFUND",
      amount: Number(movement.amount),
    });
    movementsByEvent.set(movement.event_id, list);
  }

  for (const event of events) {
    const quote = event.quotes?.[0];
    if (!quote) continue;

    const quoteTotal = Number(quote.total);
    if (quoteTotal <= 0) continue;

    const eventMovements = movementsByEvent.get(event.id) ?? [];
    summaries.set(
      event.id,
      calculatePaymentSummary(quoteTotal, eventMovements),
    );
  }

  return summaries;
}

export async function getEventPaymentData(eventId: string) {
  const [movements, summary, paymentMethods] = await Promise.all([
    getEventFinancialMovements(eventId),
    getEventPaymentSummary(eventId),
    getPaymentMethods(),
  ]);

  return { movements, summary, paymentMethods };
}
