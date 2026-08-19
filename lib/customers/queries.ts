import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { extractPhoneDigits } from "@/lib/customers/phone";
import {
  CUSTOMER_COMBOBOX_PAGE_SIZE,
  CUSTOMER_LIST_PAGE_SIZE,
} from "@/lib/customers/constants";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";

export type SearchCustomersParams = {
  query?: string;
  page?: number;
  pageSize?: number;
};

export type SearchCustomersResult = {
  customers: CustomerWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function buildCustomerSearchFilter(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "";

  const escaped = escapeIlikePattern(trimmed);
  const pattern = `%${escaped}%`;
  const clauses = [
    `name.ilike.${pattern}`,
    `email.ilike.${pattern}`,
    `phone.ilike.${pattern}`,
    `identification.ilike.${pattern}`,
  ];

  const phoneDigits = extractPhoneDigits(trimmed);
  if (phoneDigits.length >= 4) {
    const digitPattern = `%${phoneDigits}%`;
    clauses.push(`phone.ilike.${digitPattern}`);
  }

  return clauses.join(",");
}

export async function searchCustomers({
  query = "",
  page = 1,
  pageSize = CUSTOMER_LIST_PAGE_SIZE,
}: SearchCustomersParams = {}): Promise<SearchCustomersResult> {
  const supabase = createAdminSupabaseClient();
  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.max(1, pageSize);
  const offset = (normalizedPage - 1) * normalizedPageSize;
  const searchFilter = buildCustomerSearchFilter(query);

  let builder = supabase
    .from("customers")
    .select("*, customer_types(*)", { count: "exact" })
    .order("name", { ascending: true });

  if (searchFilter) {
    builder = builder.or(searchFilter);
  }

  const { data, error, count } = await builder.range(
    offset,
    offset + normalizedPageSize - 1,
  );

  if (error) {
    console.error("[searchCustomers]", error.message);
    return {
      customers: [],
      total: 0,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      hasMore: false,
    };
  }

  const total = count ?? 0;

  return {
    customers: (data ?? []) as CustomerWithRelations[],
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    hasMore: normalizedPage * normalizedPageSize < total,
  };
}

export async function searchCustomersForCombobox(
  params: Omit<SearchCustomersParams, "pageSize"> & { pageSize?: number },
): Promise<SearchCustomersResult> {
  return searchCustomers({
    ...params,
    pageSize: params.pageSize ?? CUSTOMER_COMBOBOX_PAGE_SIZE,
  });
}

export async function getCustomersCount(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { count, error } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[getCustomersCount]", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getCustomersCreatedBetween(
  start: Date,
  end: Date,
): Promise<Pick<CustomerWithRelations, "id" | "created_at">[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, created_at")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getCustomersCreatedBetween]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCustomerTypes(): Promise<CustomerType[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customer_types")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getCustomerTypes]", error.message);
    return [];
  }

  return data ?? [];
}

/** @deprecated Use searchCustomers() for paginated lists. */
export async function getCustomers(): Promise<CustomerWithRelations[]> {
  const { customers } = await searchCustomers({
    page: 1,
    pageSize: 1000,
  });
  return customers;
}

export async function getCustomerById(
  id: string,
): Promise<CustomerWithRelations | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*, customer_types(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getCustomerById]", error.message);
    return null;
  }

  return data as CustomerWithRelations | null;
}
