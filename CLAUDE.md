# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PARABOX — a Next.js (App Router) dropshipping storefront with an admin panel, Supabase as the backend, Skrill as the payment processor, and Resend for transactional email. Deployed on Vercel.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config, eslint-config-next)
```

There is no test suite configured in this repo.

Database schema lives in `supabase/schema.sql` — it's hand-written, idempotent SQL (not a migration tool) meant to be pasted into the Supabase SQL Editor. When changing the `orders` or `products` tables, or the `decrement_product_stock` function, update this file directly with `create table if not exists` / `alter table add column if not exists` style statements so it can be re-run safely against an existing database.

## Architecture

### Two Supabase clients — never mix them up

- `lib/supabase.ts` — anon/public client. Used for public reads only (product catalog listing).
- `lib/supabase-admin.ts` — service_role client, server-side only. Bypasses RLS entirely. Required for all writes to `products` and for *any* access (read or write) to `orders`.

`orders` has **no public RLS policies at all** — it holds customer PII (name, address, phone, email) and is only ever touched through server-side routes using `supabaseAdmin`. `products` has a public SELECT policy (storefront catalog) but no public write policies. This split is deliberate; see the comments in `supabase/schema.sql` and `lib/orders-repository.ts` / `lib/products-repository.ts` before changing access patterns.

Repositories (`lib/products-repository.ts`, `lib/orders-repository.ts`) are the only modules that talk to Supabase directly — routes and components go through them, not the raw client. Row↔domain mapping (snake_case ↔ camelCase) happens in `fromRow`/`toRow` in each repository.

### Auth: admin panel

- `proxy.ts` is this project's Next.js middleware (renamed from `middleware.ts` in Next 16) — it runs in the Node.js runtime (not Edge), which is why `lib/admin-auth.ts` can use `node:crypto`.
- Gates `/admin/:path*`, `/api/orders/:path*`, `/api/products/:path*` behind a session cookie (`parabox_admin_session`).
- Auth is a single shared password (`ADMIN_PASSWORD` env var), no user accounts. The session token is `sha256(ADMIN_PASSWORD)` — never the raw password — compared with `timingSafeEqual`.
- Fails closed: if `ADMIN_PASSWORD` isn't set, the admin panel and protected API routes reject everything rather than falling back to a default credential.

### Checkout flow (Skrill)

1. `POST /api/checkout/skrill` — recalculates prices/totals server-side from the live product catalog (never trusts client-submitted prices/totals), validates stock and product status, inserts an `orders` row with status `Pendiente de Pago`, then returns a Skrill Quick Checkout redirect URL built from `URLSearchParams`.
2. Skrill redirects the buyer to pay, then POSTs a status notification to `POST /api/webhooks/skrill`.
3. The webhook verifies Skrill's MD5 signature (`SKRILL_SECRET_WORD` + fixed fields per Skrill's Quick Checkout spec) before trusting anything in the payload — there is intentionally no fallback secret, so an unconfigured `SKRILL_SECRET_WORD` makes the webhook reject everything rather than accept forged signatures.
4. On a successful payment status, it marks the order `Pagado`, decrements stock via the atomic `decrement_product_stock` Postgres function (avoids read-modify-write races between concurrent webhook deliveries), and sends customer + admin emails via Resend in parallel — email failures are logged but never fail the webhook response to Skrill.

### Cross-cutting conventions

- **Rate limiting** (`lib/rate-limit.ts`): in-memory, per-IP, per-Vercel-instance. Good enough to blunt casual spam/abuse on `checkout` and `contact` routes, but resets on cold start and isn't shared across instances — don't treat it as a real defense against a persistent attacker.
- **Coupons** (`lib/coupons.ts`): hardcoded list, shared by both the server (checkout, authoritative) and the client cart UI (instant feedback only). The server always recomputes the discount itself.
- **Structured error logging**: server routes log with bracketed tags like `[ORDER_ERROR]`, `[WEBHOOK_ERROR]`, `[RATE_LIMIT_ERROR]`, `[EMAIL_ERROR]`, `[STOCK_ERROR]`, `[AUTH_ERROR]` plus a context object. Keep using this pattern for new server-side failure paths — it's the de facto logging convention here (no external logging service wired up).
- **Env-driven feature availability**: most integrations (`isSupabaseConfigured`, `isSupabaseAdminConfigured`, `isResendConfigured`, `isAdminAuthConfigured`) expose a boolean guard computed once from `process.env` and are designed to degrade gracefully (e.g. return empty results) rather than throw, except where fail-closed security requires an explicit rejection (admin auth, Skrill webhook signature).
- Path alias `@/*` maps to the repo root (see `tsconfig.json`).

### Cart state

`context/CartContext.tsx` is client-only React state (not persisted) for the active cart. Order history/last-order display uses `sessionStorage`/`localStorage` helpers in `lib/order.ts` instead — these are two different persistence mechanisms for two different concerns, don't conflate them.
