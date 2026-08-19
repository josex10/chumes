import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { EventSource } from "@/lib/supabase/types";

export async function getEventSources(): Promise<EventSource[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_sources")
    .select("*")
    .order("is_favorite", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getEventSources]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getEventSourcesForSelect(): Promise<EventSource[]> {
  return getEventSources();
}

export async function getActiveEventSources(): Promise<EventSource[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_sources")
    .select("*")
    .eq("is_active", true)
    .order("is_favorite", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getActiveEventSources]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getEventSourceById(id: number): Promise<EventSource | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_sources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getEventSourceById]", error.message);
    return null;
  }

  return data;
}
