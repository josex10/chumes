import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  OPEN_RESEARCH_STATUSES,
  isOpenResearchStatus,
} from "@/lib/research/constants";
import type {
  EventOpenResearchItem,
  EventResearchRequest,
  EventResearchRequestWithUpdates,
  EventWithRelations,
} from "@/lib/supabase/types";

export async function getEventResearchRequests(
  eventId: string,
): Promise<EventResearchRequestWithUpdates[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_research_requests")
    .select("*, event_research_updates(*)")
    .eq("event_id", eventId)
    .order("created_at");

  if (error) {
    console.error("[getEventResearchRequests]", error.message);
    return [];
  }

  return ((data ?? []) as EventResearchRequestWithUpdates[]).map((request) => ({
    ...request,
    event_research_updates: [...(request.event_research_updates ?? [])].sort(
      (a, b) => a.created_at.localeCompare(b.created_at),
    ),
  }));
}

export async function getResearchRequestById(
  requestId: string,
): Promise<EventResearchRequest | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_research_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    console.error("[getResearchRequestById]", error.message);
    return null;
  }

  return data;
}

export async function countOpenResearchRequests(
  eventId: string,
): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { count, error } = await supabase
    .from("event_research_requests")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .in("status", OPEN_RESEARCH_STATUSES);

  if (error) {
    console.error("[countOpenResearchRequests]", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getOpenResearchByEventIds(
  eventIds: string[],
): Promise<Map<string, EventOpenResearchItem[]>> {
  const byEvent = new Map<string, EventOpenResearchItem[]>();
  if (eventIds.length === 0) return byEvent;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_research_requests")
    .select("id, event_id, title, status, created_at")
    .in("event_id", eventIds)
    .in("status", OPEN_RESEARCH_STATUSES)
    .order("created_at");

  if (error) {
    console.error("[getOpenResearchByEventIds]", error.message);
    return byEvent;
  }

  for (const row of data ?? []) {
    if (!isOpenResearchStatus(row.status)) continue;
    const list = byEvent.get(row.event_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      status: row.status,
      created_at: row.created_at,
    });
    byEvent.set(row.event_id, list);
  }

  return byEvent;
}

export async function getAllOpenResearchItems(): Promise<
  Map<string, EventOpenResearchItem[]>
> {
  const byEvent = new Map<string, EventOpenResearchItem[]>();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_research_requests")
    .select("id, event_id, title, status, created_at")
    .in("status", OPEN_RESEARCH_STATUSES)
    .order("created_at");

  if (error) {
    console.error("[getAllOpenResearchItems]", error.message);
    return byEvent;
  }

  for (const row of data ?? []) {
    if (!isOpenResearchStatus(row.status)) continue;
    const list = byEvent.get(row.event_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      status: row.status,
      created_at: row.created_at,
    });
    byEvent.set(row.event_id, list);
  }

  return byEvent;
}

export async function attachOpenResearch(
  events: EventWithRelations[],
): Promise<EventWithRelations[]> {
  if (events.length === 0) return events;

  const byEvent = await getOpenResearchByEventIds(events.map((event) => event.id));

  return events.map((event) => ({
    ...event,
    open_research: byEvent.get(event.id) ?? [],
  }));
}
