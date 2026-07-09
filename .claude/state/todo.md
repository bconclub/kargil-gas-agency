# Build State — kargil-gas-app
Updated: 2026-07-04

## PENDING
- (none)

## LATER (user-approved)
- Complete mobile responsiveness pass
- Vercel deploy (DB layer needs migrating off local SQLite file first — see NOTES)

## SHIPPED (last 12)
- ✅ Project relocated: C:\Users\user\Builds\Kargil is now the main folder; old
  Desktop\Gas\kargil-gas-app copy deleted
- ✅ Real logo wired in (Desktop\Kargil\Logo.png, alpha-flattened via PIL, cropped
  into logo-full.png / logo-flame.png / favicon), replacing the recreated SVG
- ✅ Name resolves live from DB on every request (lib/auth.ts) so a rename never
  needs a re-login; admin is now "Reju"
- ✅ Dashboard: oversized empty hero card removed, replaced with 3 ring-gauge
  meters (cash retained %, expense ratio %, days coverage %) + compact net-cash tile
- ✅ Seed pipeline made portable: prisma/fixtures/may-2026.json (committed) replaces
  the hard dependency on an absolute-path Excel file; original xlsx parser kept at
  scripts/seed-from-xlsx.ts for provenance
- ✅ Real per-account passwords generated (crypto-random, bcrypt-hashed), old mock
  passwords confirmed rejected; passwords are env-var driven in seed.ts (no
  plaintext secrets committed)
- ✅ Git repo initialized, pushed to https://github.com/bconclub/kargil-gas-agency
  (main, commit b25dfcb) — verified via GitHub API, .env/dev.db correctly gitignored

## NOTES
- Local dev server: C:\Users\user\Builds\Kargil, `npm run dev -- -p 4100`
  (launch.json "kargil-gas" config already points here)
- Vercel deploy is the agreed next step but NOT done yet — this app's DB is a local
  SQLite file (better-sqlite3), which does not persist on Vercel's serverless
  filesystem. Needs a hosted DB (Postgres or Turso/libSQL) swap in lib/prisma.ts
  and prisma/schema.prisma before deploying there. Flag this before attempting
  a Vercel deploy.
- Real credentials were shared with the user directly in chat (not committed to
  the repo, not stored in this file).
