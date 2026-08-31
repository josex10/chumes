import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { resolveCustomerPhone } from "@/lib/customers/phone";
import { EVENT_PHASE } from "@/lib/events/constants";
import {
  formatDueLabel,
  todayInCostaRica,
} from "@/lib/follow-ups/calendar";
import { FOLLOW_UP_BUCKET } from "@/lib/follow-ups/constants";
import { getFollowUpProgress } from "@/lib/follow-ups/schedule";
import type { FollowUpQueue, FollowUpQueueItem } from "@/lib/follow-ups/types";
import type {
  EventFollowUpWithRelations,
  EventWithRelations,
  FollowUpTemplate,
} from "@/lib/supabase/types";

export type { FollowUpQueue, FollowUpQueueItem };

const FOLLOW_UP_EVENT_SELECT = `
  *,
  customers(*, customer_types(*)),
  customer_contacts(*),
  event_statuses(*),
  event_sources(*)
`;

function sortByDue(items: FollowUpQueueItem[]): FollowUpQueueItem[] {
  return [...items].sort((a, b) => a.dueDateKey.localeCompare(b.dueDateKey));
}

async function getCommercialFollowUpEvents(): Promise<EventWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data: statuses } = await supabase
    .from("event_statuses")
    .select("id")
    .eq("phase", EVENT_PHASE.COMMERCIAL)
    .eq("is_active", true);

  if (!statuses?.length) return [];

  const { data, error } = await supabase
    .from("events")
    .select(FOLLOW_UP_EVENT_SELECT)
    .in(
      "status_id",
      statuses.map((status) => status.id),
    );

  if (error) {
    console.error("[getCommercialFollowUpEvents]", error.message);
    return [];
  }

  return (data ?? []) as EventWithRelations[];
}

async function attachQuoteTotals(
  events: EventWithRelations[],
): Promise<EventWithRelations[]> {
  if (events.length === 0) return events;

  const supabase = createAdminSupabaseClient();
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("event_id, total")
    .in(
      "event_id",
      events.map((event) => event.id),
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[attachQuoteTotals]", error.message);
    return events;
  }

  const totalByEvent = new Map<string, number>();
  for (const quote of quotes ?? []) {
    if (!quote.event_id || totalByEvent.has(quote.event_id)) continue;
    totalByEvent.set(quote.event_id, Number(quote.total));
  }

  return events.map((event) => ({
    ...event,
    quotes: totalByEvent.has(event.id)
      ? [{ total: totalByEvent.get(event.id)! } as NonNullable<
          EventWithRelations["quotes"]
        >[number]]
      : [],
  }));
}

async function getCompletedByEvent(eventIds: string[]) {
  const supabase = createAdminSupabaseClient();
  const completedByEvent = new Map<
    string,
    Array<{ step: number; completed_at: string }>
  >();

  if (eventIds.length === 0) {
    return { completedByEvent, ok: true };
  }

  const { data: followUps, error } = await supabase
    .from("event_follow_ups")
    .select("event_id, step, completed_at")
    .in("event_id", eventIds);

  if (error) {
    console.error("[getCompletedByEvent]", error.message);
    return { completedByEvent, ok: false };
  }

  for (const row of followUps ?? []) {
    const list = completedByEvent.get(row.event_id) ?? [];
    list.push({ step: row.step, completed_at: row.completed_at });
    completedByEvent.set(row.event_id, list);
  }

  return { completedByEvent, ok: true };
}

export async function getFollowUpTemplates(
  activeOnly = false,
): Promise<FollowUpTemplate[]> {
  const supabase = createAdminSupabaseClient();
  let builder = supabase
    .from("follow_up_templates")
    .select("*")
    .order("sort_order")
    .order("name");

  if (activeOnly) {
    builder = builder.eq("is_active", true);
  }

  const { data, error } = await builder;

  if (error) {
    console.error("[getFollowUpTemplates]", error.message);
    return [];
  }

  return (data ?? []) as FollowUpTemplate[];
}

export async function getEventFollowUps(
  eventId: string,
): Promise<EventFollowUpWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_follow_ups")
    .select("*, follow_up_templates(id, name)")
    .eq("event_id", eventId)
    .order("step");

  if (error) {
    console.error("[getEventFollowUps]", error.message);
    return [];
  }

  return (data ?? []) as EventFollowUpWithRelations[];
}

export async function getFollowUpQueue(): Promise<FollowUpQueue> {
  const todayKey = todayInCostaRica();
  const events = await attachQuoteTotals(await getCommercialFollowUpEvents());
  const queue: FollowUpQueue = {
    step1: [],
    step2: [],
    step3: [],
    noResponse: [],
    total: 0,
  };

  if (events.length === 0) return queue;

  const { completedByEvent, ok } = await getCompletedByEvent(
    events.map((event) => event.id),
  );

  if (!ok) return queue;

  for (const event of events) {
    const progress = getFollowUpProgress(
      event.created_at,
      completedByEvent.get(event.id) ?? [],
      event.follow_up_paused_at,
    );

    if (progress.kind === "paused") continue;
    if (progress.dueDateKey > todayKey) continue;

    const item: FollowUpQueueItem = {
      event,
      bucket: progress.bucket,
      step: progress.kind === "pending" ? progress.step : null,
      dueDateKey: progress.dueDateKey,
      dueLabel: formatDueLabel(progress.dueDateKey, todayKey),
      phone: resolveCustomerPhone(
        event.customer_contacts?.phone,
        event.customers.phone,
      ),
      quoteTotal: event.quotes?.[0]?.total ?? null,
    };

    if (progress.bucket === FOLLOW_UP_BUCKET.STEP_1) queue.step1.push(item);
    if (progress.bucket === FOLLOW_UP_BUCKET.STEP_2) queue.step2.push(item);
    if (progress.bucket === FOLLOW_UP_BUCKET.STEP_3) queue.step3.push(item);
    if (progress.bucket === FOLLOW_UP_BUCKET.NO_RESPONSE) {
      queue.noResponse.push(item);
    }
  }

  queue.step1 = sortByDue(queue.step1);
  queue.step2 = sortByDue(queue.step2);
  queue.step3 = sortByDue(queue.step3);
  queue.noResponse = sortByDue(queue.noResponse);
  queue.total =
    queue.step1.length +
    queue.step2.length +
    queue.step3.length +
    queue.noResponse.length;

  return queue;
}

export async function getFollowUpPendingCount(): Promise<number> {
  try {
    const todayKey = todayInCostaRica();
    const events = await getCommercialFollowUpEvents();
    if (events.length === 0) return 0;

    const { completedByEvent, ok } = await getCompletedByEvent(
      events.map((event) => event.id),
    );
    if (!ok) return 0;

    let total = 0;
    for (const event of events) {
      const progress = getFollowUpProgress(
        event.created_at,
        completedByEvent.get(event.id) ?? [],
        event.follow_up_paused_at,
      );
      if (progress.kind === "paused") continue;
      if (progress.dueDateKey <= todayKey) total += 1;
    }
    return total;
  } catch (error) {
    console.error("[getFollowUpPendingCount]", error);
    return 0;
  }
}
