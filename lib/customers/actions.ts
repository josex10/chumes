"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  ANONYMOUS_NAME_MAX_ATTEMPTS,
  buildAnonymousCustomerName,
} from "@/lib/customers/anonymous-name";
import { EVENT_PHASE } from "@/lib/events/constants";
import { buildEventTitle } from "@/lib/events/event-title";
import {
  customerNameExists,
  getCustomerById,
  searchCustomers,
  searchCustomersForCombobox,
  type SearchCustomersParams,
  type SearchCustomersResult,
} from "@/lib/customers/queries";
import {
  customerFormSchema,
  toCustomerPayload,
  type CustomerFormValues,
} from "@/lib/customers/schema";

type ActionResult =
  | { success: true; customerId?: string; customer?: import("@/lib/supabase/types").CustomerWithRelations }
  | { success: false; error: string };

type ParseResult =
  | { ok: true; data: ReturnType<typeof toCustomerPayload> }
  | { ok: false; error: string };

function parseFormValues(values: CustomerFormValues): ParseResult {
  const parsed = customerFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  return { ok: true, data: toCustomerPayload(parsed.data) };
}

async function syncOpenEventTitlesForCustomer(
  customerId: string,
  customerName: string,
) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, event_date, event_statuses(phase)")
    .eq("customer_id", customerId);

  if (error) {
    console.error("[syncOpenEventTitlesForCustomer]", error.message);
    return;
  }

  const openEvents = (data ?? []).filter((event) => {
    const status = Array.isArray(event.event_statuses)
      ? event.event_statuses[0]
      : event.event_statuses;
    return status?.phase !== EVENT_PHASE.TERMINAL;
  });

  await Promise.all(
    openEvents.map((event) =>
      supabase
        .from("events")
        .update({ title: buildEventTitle(customerName, event.event_date) })
        .eq("id", event.id),
    ),
  );
}

export async function createCustomer(
  values: CustomerFormValues,
): Promise<ActionResult> {
  const parsed = parseFormValues(values);

  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createCustomer]", error?.message);
    return { success: false, error: "Could not create customer." };
  }

  revalidatePath("/customers");
  return { success: true, customerId: data.id };
}

export async function updateCustomer(
  id: string,
  values: CustomerFormValues,
): Promise<ActionResult> {
  const parsed = parseFormValues(values);

  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const current = await getCustomerById(id);
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("customers")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("[updateCustomer]", error.message);
    return { success: false, error: "Could not update customer." };
  }

  if (current && current.name !== parsed.data.name) {
    await syncOpenEventTitlesForCustomer(id, parsed.data.name);
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  revalidatePath(`/customers/${id}/edit`);
  revalidatePath("/events", "layout");
  return { success: true };
}


export async function createCustomerAndFetch(
  values: CustomerFormValues,
): Promise<ActionResult> {
  const result = await createCustomer(values);
  if (!result.success || !result.customerId) {
    return result;
  }

  const customer = await getCustomerById(result.customerId);
  if (!customer) {
    return { success: false, error: "Customer created but could not be loaded." };
  }

  return { success: true, customerId: result.customerId, customer };
}

export async function searchCustomersAction(
  params: SearchCustomersParams,
): Promise<SearchCustomersResult> {
  return searchCustomersForCombobox(params);
}

export async function searchCustomersListAction(
  params: SearchCustomersParams,
): Promise<SearchCustomersResult> {
  return searchCustomers(params);
}

export async function getCustomerByIdAction(id: string) {
  return getCustomerById(id);
}

export async function generateUniqueAnonymousCustomerName(): Promise<
  { success: true; name: string } | { success: false; error: string }
> {
  try {
    for (let attempt = 0; attempt < ANONYMOUS_NAME_MAX_ATTEMPTS; attempt += 1) {
      const name = buildAnonymousCustomerName();
      const exists = await customerNameExists(name);
      if (!exists) {
        return { success: true, name };
      }
    }

    return {
      success: false,
      error: "No se pudo generar un nombre único. Inténtalo de nuevo.",
    };
  } catch (error) {
    console.error("[generateUniqueAnonymousCustomerName]", error);
    return {
      success: false,
      error: "No se pudo generar un nombre único. Inténtalo de nuevo.",
    };
  }
}
