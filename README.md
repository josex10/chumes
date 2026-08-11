# Chumes Intranet

Internal platform for managing rental and sales operations. Built with Next.js, Clerk (auth), and Supabase (PostgreSQL).

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API (anon/public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (service role key) |

### 3. Connect Clerk and Supabase (one-time setup)

**In Clerk Dashboard:**
1. Go to **Integrations → Supabase** (or enable Supabase compatibility under API Keys).
2. Enable the integration for your application.

**In Supabase Dashboard:**
1. Go to **Authentication → Sign In/Up → Third Party Auth**.
2. Add **Clerk** as a provider using your Clerk Frontend API URL / Issuer.

### 4. Run the database migration

Open the Supabase SQL Editor and run the contents of:

```
supabase/migrations/20260311000000_foundation.sql
```

This creates the `requesting_user_id()` helper function used by Row Level Security policies.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in, then visit [http://localhost:3000/debug/supabase](http://localhost:3000/debug/supabase) to verify the Clerk → Supabase connection.

## Supabase Client Usage

| Client | File | When to use |
|---|---|---|
| Server (RLS) | `lib/supabase/server.ts` | Server Components, Server Actions — user-scoped queries |
| Browser (RLS) | `lib/supabase/client.ts` | Client Components that query Supabase directly |
| Admin (no RLS) | `lib/supabase/admin.ts` | Webhooks, cron jobs — bypasses Row Level Security |

Always prefer the server client for data access. Use the admin client only in trusted server-only code.

## RLS Conventions

Since auth is handled by Clerk (not Supabase Auth), use `requesting_user_id()` in RLS policies instead of `auth.uid()`:

```sql
CREATE POLICY "Authenticated users can read"
  ON some_table FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);
```

## Generate Types

After adding tables, regenerate TypeScript types:

```bash
npm run gen:types
```

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project.
