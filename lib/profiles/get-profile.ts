import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ProfileWithRelations } from "@/lib/supabase/types";

export async function getCurrentProfile(): Promise<ProfileWithRelations | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    // Admin client scoped to the authenticated Clerk user id (server-only).
    // Avoids RLS/JWT issues during auth routing; RLS still protects other tables.
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*, profile_statuses(*), roles(*)")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[getCurrentProfile]", error.message);
      return null;
    }

    return data as ProfileWithRelations | null;
  } catch (error) {
    console.error("[getCurrentProfile]", error);
    return null;
  }
}
