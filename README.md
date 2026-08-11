# Chumes Intranet

Internal platform for managing rental and sales operations. Built with Next.js, Clerk (authentication), and Supabase (PostgreSQL).

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/)
- A [Clerk](https://clerk.com/) account and application
- A [Supabase](https://supabase.com/) project
- [ngrok](https://ngrok.com/) (required for Clerk webhooks during local development)

## Local development setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route | `/sign-in` (default) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route | `/sign-up` (default) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post sign-in redirect | `/auth/callback` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post sign-up redirect | `/auth/callback` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase → Settings → API |
| `CLERK_WEBHOOK_SECRET` | Webhook signing secret | Clerk → Webhooks (after creating endpoint) |

> **Never commit `.env.local` or expose the service role key in client code.**

### 3. Supabase setup

#### 3.1 Create a project

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the URL and API keys into `.env.local`

#### 3.2 Run migrations

Open **Supabase Dashboard → SQL Editor** and run these files **in order**:

1. `supabase/migrations/20260311000000_foundation.sql`  
   Creates `requesting_user_id()` for Row Level Security with Clerk.

2. `supabase/migrations/20260311000001_roles_and_profiles.sql`  
   Creates `roles`, `profile_statuses`, and `profiles` tables with seed data.

3. `supabase/migrations/20260311000002_customers.sql`  
   Creates `customer_types` and `customers` tables with seed data and RLS policies.

4. `supabase/migrations/20260311000003_products.sql`  
   Creates product catalog tables (categories, types, products, prices, costs, bundles).

5. `supabase/migrations/20260311000004_inventory.sql`  
   Creates inventory movement types, movements ledger, and `product_stock_balances` view.

Alternatively, if you use the **Supabase CLI** locally:

```bash
supabase db push
```

After applying migrations, regenerate TypeScript types (optional if types are already committed):

```bash
npm run gen:types
```

### 4. Connect Clerk and Supabase

Clerk handles authentication; Supabase stores data. They must trust each other's tokens.

**Clerk Dashboard:**
1. Go to **Integrations → Supabase** (or enable Supabase compatibility under API Keys)
2. Enable the integration for your application

**Supabase Dashboard:**
1. Go to **Authentication → Sign In/Up → Third Party Auth**
2. Add **Clerk** as a provider using your Clerk Frontend API URL / Issuer

### 5. Clerk webhook (profile creation on signup)

When a user signs up, Clerk sends a `user.created` webhook. The app creates a `profiles` row with `PENDING` status.

#### 5.1 Install and configure ngrok

Clerk cannot reach `localhost` directly. Use ngrok to expose your local server:

```bash
# One-time: sign up at ngrok.com and add your authtoken
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

#### 5.2 Start the app and ngrok

Use **two terminals**:

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — ngrok tunnel to port 3000
ngrok http 3000
```

Copy the **HTTPS** forwarding URL from ngrok (e.g. `https://abc123.ngrok-free.app`).

> Free ngrok URLs change every time you restart ngrok. Update the Clerk webhook URL when that happens.

#### 5.3 Register the webhook in Clerk

1. Go to **Clerk Dashboard → Webhooks → Add Endpoint**
2. **Endpoint URL:** `https://YOUR-NGROK-URL.ngrok-free.app/api/webhooks/clerk`
3. **Subscribe to events:** `user.created`
4. Click **Create**
5. Copy the **Signing Secret** (`whsec_...`) into `.env.local` as `CLERK_WEBHOOK_SECRET`
6. Restart the dev server (`npm run dev`)

### 6. Start developing

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth and profile flow

```
/  (public landing — Sign in / Sign up, or Customers/Products when signed in)
        ↓
/sign-up or /sign-in
        ↓
/auth/callback  (routes user by profile status)
        ↓
   ┌────┴────┬──────────────┬─────────────┐
   ↓         ↓              ↓             ↓
/account-setup  /pending-approval  /access-denied  /dashboard
(webhook pending)  (awaiting admin)   (rejected)     (approved)
                                                      ↓
                                            /customers, /products
```

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with Sign in / Sign up (or **Customers** / **Products** when signed in) |
| `/sign-in` | Public | Clerk sign-in |
| `/sign-up` | Public | Clerk sign-up |
| `/auth/callback` | Authenticated | Post-login router |
| `/account-setup` | Authenticated | Waits for webhook to create profile (loader) |
| `/pending-approval` | Authenticated | Profile created, awaiting admin approval |
| `/access-denied` | Authenticated | Profile rejected |
| `/dashboard` | Approved users only | Main app placeholder (requires `APPROVED` status) |
| `/customers` | Approved users only | Customer list |
| `/customers/new` | Approved users only | Create customer form |
| `/customers/[id]/edit` | Approved users only | Edit customer form |
| `/products` | Approved users only | Product list |
| `/products/new` | Approved users only | Create simple product |
| `/products/new/bundle` | Approved users only | Create bundle product |
| `/products/[id]/edit` | Approved users only | Edit product, record inventory movements |
| `/debug/supabase` | Authenticated | Smoke test for Clerk → Supabase connection |

### Sign-up sequence

1. User signs up via Clerk
2. Clerk fires `user.created` webhook → profile inserted with `PENDING` status
3. User lands on `/account-setup` with a loader while the webhook completes
4. Once the profile exists → redirect to `/pending-approval`
5. Admin approves the profile in Supabase (SQL for now)
6. User signs in again → `/dashboard`

## Approve a user (manual, via SQL)

Run in **Supabase SQL Editor**:

```sql
-- Approve by email and assign ADMIN role
UPDATE profiles
SET
  status_id = (SELECT id FROM profile_statuses WHERE code = 'APPROVED'),
  role_id = (SELECT id FROM roles WHERE code = 'ADMIN'),
  approved_at = now()
WHERE email = 'user@example.com';
```

Available roles: `ADMIN`, `MANAGER`, `OPERATOR`

Check profile status:

```sql
SELECT
  p.email,
  p.full_name,
  ps.code AS status,
  r.code AS role,
  p.approved_at
FROM profiles p
JOIN profile_statuses ps ON ps.id = p.status_id
LEFT JOIN roles r ON r.id = p.role_id;
```

Reject a user:

```sql
UPDATE profiles
SET status_id = (SELECT id FROM profile_statuses WHERE code = 'REJECTED')
WHERE email = 'user@example.com';
```

## Verify the setup

| Check | How |
|---|---|
| Clerk ↔ Supabase JWT | Sign in, visit `/debug/supabase` — Clerk and Supabase user IDs should match |
| Webhook | Clerk → Webhooks → your endpoint → **Attempts** should show `200` |
| Profile created | Supabase → Table Editor → `profiles` row after signup |
| Approval gate | Pending user cannot access `/dashboard`, `/customers`, or `/products` |
| Customers module | Sign in as approved user → `/customers` → create and edit a customer |
| Products module | Sign in as approved user → `/products` → create a product and record an initial stock movement |

## Customers module

Approved users can manage customers at `/customers`.

**Required fields:** name, phone (8 digits), customer type.

**Optional fields:** identification, email, notes.

**Phone format:** digits only, masked as `XXXX-XXXX` (Costa Rica local format).

**Customer types** (seeded in `customer_types`):

| Code | Name |
|---|---|
| `INDIVIDUAL` | Persona física |
| `COMPANY` | Empresa |
| `GOVERNMENT` | Gobierno |
| `EVENT_PLANNER` | Event Planner |
| `VENUE` | Salón de eventos |

### Key files

| Area | Path |
|---|---|
| Migration | `supabase/migrations/20260311000002_customers.sql` |
| Domain logic | `lib/customers/` |
| Server Actions | `lib/customers/actions.ts` (`createCustomer`, `updateCustomer`) |
| Form | `components/customers/customer-form.tsx` |
| Pages | `app/(authenticated)/customers/` |

## Products and inventory module

Approved users can manage the product catalog at `/products`.

**Simple products** are quantity-tracked items with optional rental/sale prices and replacement cost.

**Bundles** are commercial packages made of simple products. Bundles do not hold their own stock; availability is derived from component products.

**Inventory** is movement-based (RN-012). Stock is computed from `inventory_movements`, not edited directly. On a simple product edit page you can record manual movements:

| Code | Effect |
|---|---|
| `INITIAL_LOAD` | Increase stock |
| `PURCHASE` | Increase stock |
| `ADJUSTMENT` | Increase or decrease stock |
| `DAMAGE` | Decrease stock |
| `LOSS` | Decrease stock |

Event-linked movements (`EVENT_OUT`, `EVENT_RETURN`) and reservations will be added with the Events module.

**Product categories** (seeded in `product_categories`):

| Code | Name |
|---|---|
| `TABLE_LINENS` | Mantelería |
| `CHAIR_COVERS` | Forros de silla |
| `CHAIRS` | Sillas |
| `TABLES` | Mesas |
| `DECORATION` | Decoración |
| `ACCESSORIES` | Accesorios |
| `OTHER` | Otros |

### Key files

| Area | Path |
|---|---|
| Migrations | `supabase/migrations/20260311000003_products.sql`, `20260311000004_inventory.sql` |
| Product domain | `lib/products/` |
| Inventory domain | `lib/inventory/` |
| Server Actions | `lib/products/actions.ts`, `lib/inventory/actions.ts` |
| Forms | `components/products/product-form.tsx`, `bundle-form.tsx`, `inventory-panel.tsx` |
| Pages | `app/(authenticated)/products/` |

## UI components (shadcn/ui)

The project uses [shadcn/ui](https://ui.shadcn.com/) with Tailwind CSS v4. Components live under `components/ui/`.

To add more components later:

```bash
npx shadcn@latest add <component-name>
```

Installed components include: `button`, `input`, `label`, `select`, `table`, `card`, `textarea`. Forms use `react-hook-form` + `zod` directly.

## Project scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run gen:types  # Regenerate Supabase TypeScript types (requires Supabase CLI)
```

## Supabase clients

| Client | File | When to use |
|---|---|---|
| Server (RLS) | `lib/supabase/server.ts` | Server Components, Server Actions |
| Browser (RLS) | `lib/supabase/client.ts` | Client Components |
| Admin (no RLS) | `lib/supabase/admin.ts` | Webhooks, trusted server-only code |

Prefer the server client for user-facing data. The admin client bypasses RLS and must never run in the browser.

## RLS conventions

Auth is handled by Clerk, not Supabase Auth. Use `requesting_user_id()` in policies instead of `auth.uid()`:

```sql
CREATE POLICY "Authenticated users can read"
  ON some_table FOR SELECT
  TO authenticated
  USING (requesting_user_id() IS NOT NULL);
```

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Stuck on "Rendering..." | Redirect or Supabase query issue | Restart dev server; check terminal logs |
| Account setup never finishes | Webhook not reaching localhost | Confirm ngrok is running; check Clerk webhook URL and Attempts |
| `401 Invalid signature` on webhook | Wrong or missing secret | Update `CLERK_WEBHOOK_SECRET`; restart dev server |
| Profile not in Supabase after signup | Webhook failed | Check Clerk → Webhooks → Attempts for error details |
| User stuck on pending after approval | Browser cache / old session | Sign out and sign in again |
| ngrok URL changed | Free tier generates new URLs | Update Clerk webhook endpoint URL |

## Tech stack

- **Next.js 16** (App Router)
- **Clerk** — authentication, sessions, webhooks
- **Supabase** — PostgreSQL, Row Level Security
- **shadcn/ui** — UI components (Base UI + Tailwind)
- **react-hook-form** + **zod** — form validation
- **TypeScript**, **Tailwind CSS v4**
