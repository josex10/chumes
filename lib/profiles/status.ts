import type { ProfileWithRelations } from "@/lib/supabase/types";

export function getProfileStatusCode(
  profile: ProfileWithRelations,
): string | undefined {
  const status = profile.profile_statuses;

  if (Array.isArray(status)) {
    return status[0]?.code;
  }

  return status?.code;
}
