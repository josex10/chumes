import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SupabaseDebugPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">Supabase Debug</h1>
        <p className="mt-4 text-zinc-600">Sign in to verify the Clerk → Supabase connection.</p>
      </main>
    );
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.rpc("requesting_user_id");

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Supabase Debug</h1>
      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-sm font-medium text-zinc-500">Clerk user ID</dt>
          <dd className="mt-1 font-mono text-sm">{userId}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500">Supabase requesting_user_id()</dt>
          <dd className="mt-1 font-mono text-sm">
            {error ? `Error: ${error.message}` : (data ?? "null")}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500">Status</dt>
          <dd className="mt-1 text-sm">
            {error
              ? "Connection failed — check env vars and dashboard integration."
              : data === userId
                ? "Success — Clerk token is reaching Supabase."
                : "Token received but user IDs do not match — check Clerk ↔ Supabase integration."}
          </dd>
        </div>
      </dl>
    </main>
  );
}
