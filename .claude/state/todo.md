# Build State — kargil-gas-app
Updated: 2026-07-10T01:30:00+05:30

## PENDING
1. Dashboard redesign to match LedgerPro-style mockup (hero w/o 3D image, KPI rings row,
   totals cards w/ deltas, receipts-vs-debits trend, daily cash flow chart, activity
   calendar, daily ledger table w/ status pills, insights cards). Kargil branding stays.
2. Sidebar pinned open on wide screens (mockup shows persistent expanded sidebar)

## IN PROGRESS
- Dashboard redesign (item 1)

## BLOCKED
- (none)

## LATER (user-approved)
- Complete mobile responsiveness pass
- Investigate broken logo on live Vercel site (cosmetic; PNG committed + serves 200 locally —
  need live URL to diagnose; may be stale deploy before c9f6eda)

## SHIPPED (last 12)
- ✅ Lazy-init Prisma client so build doesn't need DATABASE_URL — Vercel build fix (6e6ea8c)
- ✅ Removed mock-credential hint from public login page (7e521dc)
- ✅ Empty commit to trigger redeploy with env vars (19ae783)
- ✅ Fixed Vercel build type errors + baseline migration committed (c9f6eda)
- ✅ Supabase Postgres live: schema created (user ran SQL), seeded 4 users + full May
  ledger (24 reports / 457 supplier / 577 tie-up / 202 expense) — counts verified
- ✅ Real passwords generated + persisted in .env.local; login verified end-to-end
  locally against Supabase (admin + ceo → dashboard)
- ✅ Project relocated to C:\Users\user\Builds\Kargil
- ✅ Real logo wired in; dashboard ring-gauge KPIs; portable seed fixtures

## NOTES
- Local dev: preview server "dev" on port 3000 (session 1924c8bf)
- Vercel project lives under Scan2Kare account — MCP only sees bconclub team; can't
  query deploys/logs. User pastes screenshots instead.
- Vercel envs needed at runtime: DATABASE_URL (+?pgbouncer=true), SESSION_SECRET
- Credentials shared in chat 2026-07-10; stored in .env.local (gitignored), bcrypt in DB
