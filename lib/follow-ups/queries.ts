import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { resolveCustomerPhone } from "@/lib/customers/phone";
import { EVENT_PHASE } from "@/lib/events/constants";
import {
  formatDueLabel,
  formatWeekEventDateLabel,
  isDateKeyInCostaRicaWeek,
  toCostaRicaDateKey,
  toEventDateKey,
  todayInCostaRica,
} from "@/lib/follow-ups/calendar";
import { FOLLOW_UP_BUCKET } from "@/lib/follow-ups/constants";
import {
  getFollowUpCadenceLabel,
  getFollowUpProgress,
} from "@/lib/follow-ups/schedule";
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

function sortCloseThisWeek(items: FollowUpQueueItem[]): FollowUpQueueItem[] {
  return [...items].sort((a, b) => {
    if (a.contactedThisWeek !== b.contactedThisWeek) {
      return a.contactedThisWeek ? 1 : -1;
    }
    return a.dueDateKey.localeCompare(b.dueDateKey);
  });
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

async function getCompletedByEvent(eventIds: string[], todayKey: string) {
  const supabase = createAdminSupabaseClient();
  const completedByEvent = new Map<
    string,
    Array<{ step: number; completed_at: string }>
  >();
  const contactedThisWeek = new Set<string>();

  if (eventIds.length === 0) {
    return { completedByEvent, contactedThisWeek, ok: true };
  }

  const { data: followUps, error } = await supabase
    .from("event_follow_ups")
    .select("event_id, step, completed_at")
    .in("event_id", eventIds);

  if (error) {
    console.error("[getCompletedByEvent]", error.message);
    return { completedByEvent, contactedThisWeek, ok: false };
  }

  for (const row of followUps ?? []) {
    if (
      isDateKeyInCostaRicaWeek(
        toCostaRicaDateKey(row.completed_at),
        todayKey,
      )
    ) {
      contactedThisWeek.add(row.event_id);
    }
    if (row.step !== 1 && row.step !== 2 && row.step !== 3) continue;
    const list = completedByEvent.get(row.event_id) ?? [];
    list.push({ step: row.step, completed_at: row.completed_at });
    completedByEvent.set(row.event_id, list);
  }

  return { completedByEvent, contactedThisWeek, ok: true };
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
    .order("completed_at");

  if (error) {
    console.error("[getEventFollowUps]", error.message);
    return [];
  }

  return (data ?? []) as EventFollowUpWithRelations[];
}

function emptyQueue(): FollowUpQueue {
  return {
    closeThisWeek: [],
    step1: [],
    step2: [],
    step3: [],
    noResponse: [],
    total: 0,
  };
}

function toQueueItem(
  event: EventWithRelations,
  input: {
    bucket: FollowUpQueueItem["bucket"];
    step: FollowUpQueueItem["step"];
    dueDateKey: string;
    dueLabel: string;
    isThisWeek: boolean;
    cadenceLabel: string | null;
    contactedThisWeek: boolean;
  },
): FollowUpQueueItem {
  return {
    event,
    bucket: input.bucket,
    step: input.step,
    dueDateKey: input.dueDateKey,
    dueLabel: input.dueLabel,
    phone: resolveCustomerPhone(
      event.customer_contacts?.phone,
      event.customers.phone,
    ),
    quoteTotal: event.quotes?.[0]?.total ?? null,
    isThisWeek: input.isThisWeek,
    cadenceLabel: input.cadenceLabel,
    contactedThisWeek: input.contactedThisWeek,
  };
}

export async function getFollowUpQueue(): Promise<FollowUpQueue> {
  const todayKey = todayInCostaRica();
  const events = await attachQuoteTotals(await getCommercialFollowUpEvents());
  const queue = emptyQueue();

  if (events.length === 0) return queue;

  const { completedByEvent, contactedThisWeek, ok } = await getCompletedByEvent(
    events.map((event) => event.id),
    todayKey,
  );

  if (!ok) return queue;

  for (const event of events) {
    const progress = getFollowUpProgress(
      event.created_at,
      completedByEvent.get(event.id) ?? [],
      event.follow_up_paused_at,
    );
    const eventDateKey = event.event_date
      ? toEventDateKey(event.event_date)
      : null;
    const isThisWeek = Boolean(
      eventDateKey && isDateKeyInCostaRicaWeek(eventDateKey, todayKey),
    );
    const contacted = contactedThisWeek.has(event.id);
    const cadenceDue =
      progress.kind !== "paused" && progress.dueDateKey <= todayKey;

    if (cadenceDue) {
      const item = toQueueItem(event, {
        bucket: progress.bucket,
        step: progress.kind === "pending" ? progress.step : null,
        dueDateKey: progress.dueDateKey,
        dueLabel: formatDueLabel(progress.dueDateKey, todayKey),
        isThisWeek,
        cadenceLabel: null,
        contactedThisWeek: contacted,
      });

      if (progress.bucket === FOLLOW_UP_BUCKET.STEP_1) queue.step1.push(item);
      if (progress.bucket === FOLLOW_UP_BUCKET.STEP_2) queue.step2.push(item);
      if (progress.bucket === FOLLOW_UP_BUCKET.STEP_3) queue.step3.push(item);
      if (progress.bucket === FOLLOW_UP_BUCKET.NO_RESPONSE) {
        queue.noResponse.push(item);
      }
    }

    if (isThisWeek && eventDateKey) {
      const pendingDue =
        progress.kind === "pending" && progress.dueDateKey <= todayKey;
      queue.closeThisWeek.push(
        toQueueItem(event, {
          bucket: FOLLOW_UP_BUCKET.CLOSE_THIS_WEEK,
          step: pendingDue ? progress.step : null,
          dueDateKey: eventDateKey,
          dueLabel: formatWeekEventDateLabel(eventDateKey, todayKey),
          isThisWeek: true,
          cadenceLabel: getFollowUpCadenceLabel(progress, todayKey),
          contactedThisWeek: contacted,
        }),
      );
    }
  }

  queue.step1 = sortByDue(queue.step1);
  queue.step2 = sortByDue(queue.step2);
  queue.step3 = sortByDue(queue.step3);
  queue.noResponse = sortByDue(queue.noResponse);
  queue.closeThisWeek = sortCloseThisWeek(queue.closeThisWeek);
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
      todayKey,
    );
    if (!ok) return 0;

    let cadenceDue = 0;
    let thisWeekExtra = 0;

    for (const event of events) {
      const progress = getFollowUpProgress(
        event.created_at,
        completedByEvent.get(event.id) ?? [],
        event.follow_up_paused_at,
      );
      const inCadence =
        progress.kind !== "paused" && progress.dueDateKey <= todayKey;
      const inThisWeek = Boolean(
        event.event_date &&
          isDateKeyInCostaRicaWeek(toEventDateKey(event.event_date), todayKey),
      );

      if (inCadence) {
        cadenceDue += 1;
        continue;
      }
      if (inThisWeek) thisWeekExtra += 1;
    }

    return cadenceDue + thisWeekExtra;
  } catch (error) {
    console.error("[getFollowUpPendingCount]", error);
    return 0;
  }
}
