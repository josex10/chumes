import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function getProfileNameMap(
  userIds: Array<string | null | undefined>,
): Promise<Map<string, string>> {
  const ids = [...new Set(userIds.filter((id): id is string => Boolean(id)))];
  const names = new Map<string, string>();
  if (ids.length === 0) return names;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("clerk_user_id, full_name, email")
    .in("clerk_user_id", ids);

  if (error) {
    console.error("[getProfileNameMap]", error.message);
    return names;
  }

  for (const profile of data ?? []) {
    names.set(
      profile.clerk_user_id,
      profile.full_name?.trim() || profile.email,
    );
  }

  return names;
}
