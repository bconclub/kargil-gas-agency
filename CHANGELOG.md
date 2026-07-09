# Changelog

## 2026-07-10 02:20 IST · Crop stray letter-stroke out of flame marks

- The flame-only logo assets (public/logo-flame.png, public/favicon-flame.png,
  app/icon.png) each still contained the left stroke of the "K" from the full
  lockup, rendering as a stray green bar beside the flame on the login page and
  favicon. Cropped each to a tight flame-only bounding box.
- User-facing: login logo and browser-tab icon now show only the flame.


## 2026-07-10 02:05 IST · Fix broken logo for signed-out visitors

- Middleware matcher now skips static assets by extension (png/jpg/svg/etc).
  Previously the auth redirect intercepted /logo-flame.png and /logo-full.png
  for signed-out visitors, so the login page logo rendered broken on the live
  site. Auth gating on real pages unchanged (verified /dashboard still
  redirects without a session).
- User-facing: login page logo now displays on kargil-gas-agency.vercel.app.


## 2026-07-10 01:45 IST · Dashboard redesign to analytics-suite layout

- Dashboard rebuilt to match the approved mockup: ledger-health hero (period,
  net-cash headline, positive/negative banner — no decorative graph image),
  vertical KPI ring row (cash retained / expense ratio / days recorded),
  total receipts & debits cards with half-vs-half period deltas.
- New charts row: Receipts vs Debits trend (existing bar chart), new Daily
  Cash Flow net area chart, new month activity heat-map calendar (links into
  day views).
- New bottom row: Daily Ledger Overview table with Positive/Negative status
  pills + "view full ledger", and Insights panel (best collection day, highest
  debit day, missing entries, average daily net, expense-spike alert).
- Sidebar now stays pinned open on wide (xl+) screens; hover-rail behavior
  unchanged below that.
- User-facing: entire dashboard page looks and reads differently; sidebar
  persistent on desktop.
