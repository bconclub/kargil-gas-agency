import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { dashboardOverview, dataBounds } from "@/lib/data";
import { formatMoney, formatQty, displayDateShort } from "@/lib/format";
import { MonthChart } from "@/components/MonthChart";
import { RangeFilter } from "@/components/RangeFilter";
import { MonthSwitcher } from "@/components/MonthSwitcher";
import { ShareButton } from "@/components/ShareButton";

const DETAIL_LINKS = [
  { href: "/reports/supplier-ledger", title: "Delivery Staff Ledger", desc: "Per-person detail, grouped by day", group: "People" },
  { href: "/reports/tie-ups", title: "Tie-Up / NDC Report", desc: "Organization billing, grouped by day", group: "Organizations" },
  { href: "/reports/daily-summary", title: "Daily Accounts Summary", desc: "Receipts, debits & cash per day", group: "Money" },
  { href: "/reports/expenses", title: "Expenses Report", desc: "Expense heads grouped by day", group: "Money" },
];

export default async function ReportsHome({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const user = await requireUser();
  const { from, to } = await searchParams;
  const [ov, bounds] = await Promise.all([dashboardOverview({ from, to }), dataBounds()]);

  const chartData = ov.reports.map((r) => ({
    label: displayDateShort(r.dateKey),
    Receipts: Math.round(r.totalReceipts),
    Debits: Math.round(r.totalDebits),
  }));
  const days = ov.reports.length || 1;
  const maxExpense = Math.max(1, ...ov.expenseByHead.map((e) => e.amount));

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const suffix = qs.toString() ? `?${qs}` : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted">
            {user.role === "CEO" ? "Read-only analytics." : "Switch month or set any timeline; drill into detail below."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton />
        </div>
      </div>

      {/* Month + timeline controls */}
      <div className="flex flex-wrap items-center gap-3">
        <MonthSwitcher from={from} to={to} bounds={bounds} />
        <RangeFilter from={from} to={to} bounds={bounds} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total Receipts" value={formatMoney(ov.totals.receipts)} sub={`${formatMoney(ov.totals.receipts / days)} avg/day`} tone="primary" />
        <Kpi label="Total Debits" value={formatMoney(ov.totals.debits)} sub={`${formatMoney(ov.totals.debits / days)} avg/day`} tone="accent" />
        <Kpi label="Net Cash to Bank" value={formatMoney(ov.totals.cashToBank)} sub="receipts less debits" tone="success" />
        <Kpi label="Recorded Days" value={String(ov.reports.length)} sub="in current range" tone="muted" />
      </div>

      {/* Chart */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Receipts vs Debits, day by day</h2>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Receipts</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Debits</span>
          </div>
        </div>
        {chartData.length ? <MonthChart data={chartData} /> : <p className="py-10 text-center text-sm text-muted">No data in this range.</p>}
      </section>

      {/* Top people + organizations */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListCard
          title="Top Delivery Staff"
          subtitle="By total received"
          href={`/reports/supplier-ledger${suffix}`}
          rows={ov.topSuppliers.map((s) => ({ name: s.name, meta: `${formatQty(s.qty)} qty`, value: formatMoney(s.received) }))}
          empty="No delivery staff in this range."
        />
        <ListCard
          title="Top Organizations"
          subtitle="Tie-ups / NDC by amount billed"
          href={`/reports/tie-ups${suffix}`}
          rows={ov.topOrgs.map((o) => ({ name: o.name, meta: `${formatQty(o.qty)} qty`, value: formatMoney(o.total) }))}
          empty="No organizations in this range."
        />
      </div>

      {/* Expense mix */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Expense Mix</h2>
            <p className="text-xs text-muted">Top expense heads in range</p>
          </div>
          <Link href={`/reports/expenses${suffix}`} className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {ov.expenseByHead.length ? (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {ov.expenseByHead.map((e) => (
              <li key={e.head}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{e.head}</span>
                  <span className="tabular-nums text-muted">{formatMoney(e.amount)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(e.amount / maxExpense) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted">No expenses in this range.</p>
        )}
      </section>

      {/* Detail report links */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted/80">Detailed reports</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DETAIL_LINKS.map((r) => (
            <Link key={r.href} href={`${r.href}${suffix}`} className="card card-hover flex items-center gap-3 p-4">
              <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {r.group}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
                <p className="text-xs text-muted">{r.desc}</p>
              </div>
              <svg className="ml-auto h-5 w-5 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "primary" | "accent" | "success" | "muted" }) {
  const toneCls = { primary: "text-primary", accent: "text-accent", success: "text-success", muted: "text-foreground" }[tone];
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl ${toneCls}`}>{value}</p>
      <p className="mt-1 truncate text-xs text-muted">{sub}</p>
    </div>
  );
}

function ListCard({
  title,
  subtitle,
  href,
  rows,
  empty,
}: {
  title: string;
  subtitle: string;
  href: string;
  rows: { name: string; meta: string; value: string }[];
  empty: string;
}) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <Link href={href} className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      {rows.length ? (
        <ul className="divide-y divide-border">
          {rows.map((r, i) => (
            <li key={r.name} className="flex items-center gap-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted">{r.meta}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{r.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-muted">{empty}</p>
      )}
    </section>
  );
}
