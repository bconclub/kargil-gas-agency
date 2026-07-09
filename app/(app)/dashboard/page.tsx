import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { dashboardOverview, dataBounds } from "@/lib/data";
import { formatMoney, displayDate } from "@/lib/format";
import { RingStat } from "@/components/RingStat";

export default async function DashboardPage() {
  const user = await requireUser();
  const [ov, bounds] = await Promise.all([dashboardOverview(), dataBounds()]);
  const canEdit = user.role === "ADMIN" || user.role === "USER";
  const today = new Date().toISOString().slice(0, 10);
  const days = ov.reports.length || 1;

  const cashRetainedPct = ov.totals.receipts > 0 ? (ov.totals.cashToBank / ov.totals.receipts) * 100 : 0;
  const expenseRatioPct = ov.totals.receipts > 0 ? (ov.totals.debits / ov.totals.receipts) * 100 : 0;
  const spanDays = bounds
    ? Math.round((new Date(bounds.max).getTime() - new Date(bounds.min).getTime()) / 86400000) + 1
    : ov.reports.length || 1;
  const coveragePct = spanDays > 0 ? (ov.reports.length / spanDays) * 100 : 0;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:overflow-hidden sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome Back, <span className="text-primary">{user.name}</span>
          </h1>
          <p className="text-sm text-muted">
            {bounds ? `Ledger ${displayDate(bounds.min)} to ${displayDate(bounds.max)} · ${ov.reports.length} recorded days` : "No data yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/reports"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-2"
          >
            Full reports
          </Link>
          {canEdit && (
            <Link
              href={`/entry/${today}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:bg-primary-dark"
            >
              + New entry
            </Link>
          )}
        </div>
      </div>

      {/* Bento — fills remaining height, no page scroll on desktop */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
        {/* Ring meters, one row of 3 */}
        <section className="card flex flex-col justify-center gap-4 p-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <RingStat label="Cash retained" value={formatMoney(ov.totals.cashToBank)} pct={cashRetainedPct} tone="success" />
          <RingStat label="Expense ratio" value={formatMoney(ov.totals.debits)} pct={expenseRatioPct} tone="accent" />
          <RingStat label="Days recorded" value={`${ov.reports.length} of ${spanDays}`} pct={coveragePct} tone="primary" />
        </section>

        {/* Net cash tile */}
        <section className="card flex flex-col justify-center p-5">
          <p className="text-xs font-medium text-muted">Net Cash to Bank</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary sm:text-3xl">{formatMoney(ov.totals.cashToBank)}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span>Receipts <b className="tabular-nums text-foreground">{formatMoney(ov.totals.receipts)}</b></span>
            <span>Debits <b className="tabular-nums text-foreground">{formatMoney(ov.totals.debits)}</b></span>
          </div>
        </section>

        {/* Recent days (tall, left, spans 2 cols) */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface-2 p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Days</h2>
            <Link href="/calendar" className="text-xs font-medium text-primary hover:underline">
              Calendar
            </Link>
          </div>
          <ul className="scroll-slim -mx-1 min-h-0 flex-1 divide-y divide-border overflow-y-auto px-1">
            {ov.recentDays.map((r) => (
              <li key={r.dateKey}>
                <Link href={`/day/${r.dateKey}`} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition hover:bg-surface">
                  <div>
                    <p className="text-sm font-medium text-foreground">{displayDate(r.dateKey)}</p>
                    <p className="text-xs text-muted">{r.day}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-primary">{formatMoney(r.totalReceipts)}</p>
                    <p className="text-xs tabular-nums text-muted">exp {formatMoney(r.totalDebits)}</p>
                  </div>
                </Link>
              </li>
            ))}
            {ov.recentDays.length === 0 && <li className="py-8 text-center text-sm text-muted">No recorded days.</li>}
          </ul>
        </section>

        {/* Avg tiles, right column */}
        <div className="grid min-h-0 grid-cols-2 gap-4 lg:grid-cols-1">
          <Kpi label="Avg Receipts / day" value={formatMoney(ov.totals.receipts / days)} tone="primary" />
          <Kpi label="Avg Debits / day" value={formatMoney(ov.totals.debits / days)} tone="accent" />
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: "primary" | "accent" }) {
  const toneCls = tone === "primary" ? "text-primary" : "text-accent";
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-border bg-surface-2 p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneCls}`}>{value}</p>
    </div>
  );
}
