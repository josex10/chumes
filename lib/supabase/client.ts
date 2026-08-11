import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createBrowserSupabaseClient(
  getToken: () => Promise<string | null>,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return createClient<Database>(url, publishableKey, {
    accessToken: getToken,
  });
}
