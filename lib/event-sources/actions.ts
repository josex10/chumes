"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  eventSourceFormSchema,
  toEventSourcePayload,
  type EventSourceFormValues,
} from "@/lib/event-sources/schema";

type ActionResult =
  | { success: true; sourceId?: number }
  | { success: false; error: string };

function revalidateSourcePaths(sourceId?: number) {
  revalidatePath("/events");
  revalidatePath("/events/new");
  revalidatePath("/events/settings/sources");
  if (sourceId) {
    revalidatePath(`/events/settings/sources/${sourceId}/edit`);
  }
}

export async function createEventSource(
  values: EventSourceFormValues,
): Promise<ActionResult> {
  const parsed = eventSourceFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("event_sources")
    .insert(toEventSourcePayload(parsed.data))
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createEventSource]", error?.message);
    if (error?.code === "23505") {
      return { success: false, error: "Ya existe una fuente con ese código." };
    }
    return { success: false, error: "No se pudo crear la fuente." };
  }

  revalidateSourcePaths(data.id);
  return { success: true, sourceId: data.id };
}

export async function updateEventSource(
  id: number,
  values: EventSourceFormValues,
): Promise<ActionResult> {
  const parsed = eventSourceFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("event_sources")
    .update(toEventSourcePayload(parsed.data))
    .eq("id", id);

  if (error) {
    console.error("[updateEventSource]", error.message);
    if (error.code === "23505") {
      return { success: false, error: "Ya existe una fuente con ese código." };
    }
    return { success: false, error: "No se pudo actualizar la fuente." };
  }

  revalidateSourcePaths(id);
  return { success: true, sourceId: id };
}

export async function toggleEventSourceActive(
  id: number,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("event_sources")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[toggleEventSourceActive]", error.message);
    return { success: false, error: "No se pudo actualizar el estado." };
  }

  revalidateSourcePaths(id);
  return { success: true, sourceId: id };
}

export async function toggleEventSourceFavorite(
  id: number,
  isFavorite: boolean,
): Promise<ActionResult> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("event_sources")
    .update({ is_favorite: isFavorite })
    .eq("id", id);

  if (error) {
    console.error("[toggleEventSourceFavorite]", error.message);
    return { success: false, error: "No se pudo actualizar el favorito." };
  }

  revalidateSourcePaths(id);
  return { success: true, sourceId: id };
}
