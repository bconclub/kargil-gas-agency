import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { dashboardOverview, dataBounds } from "@/lib/data";
import { formatMoney, displayDate, displayDateShort, weekdayOf } from "@/lib/format";
import { RingStat } from "@/components/RingStat";
import { MonthChart } from "@/components/MonthChart";
import { CashFlowChart } from "@/components/CashFlowChart";
import { ActivityCalendar } from "@/components/ActivityCalendar";

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
  const missingDays = Math.max(0, spanDays - ov.reports.length);

  // Ledger month (from the latest recorded day)
  const monthName = bounds
    ? new Date(bounds.max + "T00:00:00Z").toLocaleDateString("en-IN", { month: "long", timeZone: "UTC" })
    : "";
  const year = bounds ? Number(bounds.max.slice(0, 4)) : new Date().getUTCFullYear();
  const month = bounds ? Number(bounds.max.slice(5, 7)) : new Date().getUTCMonth() + 1;

  // Half-vs-half deltas (honest: no previous month exists in the data)
  const half = Math.floor(ov.reports.length / 2);
  const firstHalf = ov.reports.slice(0, half);
  const secondHalf = ov.reports.slice(half);
  const sum = (rs: typeof ov.reports, k: "totalReceipts" | "totalDebits") =>
    rs.reduce((a, r) => a + r[k], 0);
  const deltaPct = (k: "totalReceipts" | "totalDebits") => {
    const a = sum(firstHalf, k);
    const b = sum(secondHalf, k);
    return a > 0 ? ((b - a) / a) * 100 : null;
  };
  const receiptsDelta = deltaPct("totalReceipts");
  const debitsDelta = deltaPct("totalDebits");

  // Charts
  const chartData = ov.reports.map((r) => ({
    label: displayDateShort(r.dateKey),
    Receipts: r.totalReceipts,
    Debits: r.totalDebits,
  }));
  const flowData = ov.reports.map((r) => ({
    label: displayDateShort(r.dateKey),
    Net: r.cashToBank,
  }));
  const receiptsByDay: Record<string, number> = {};
  for (const r of ov.reports) receiptsByDay[r.dateKey] = r.totalReceipts;

  // Insights
  const bestDay = ov.reports.reduce((a, r) => (r.totalReceipts > (a?.totalReceipts ?? -1) ? r : a), ov.reports[0]);
  const worstDebitDay = ov.reports.reduce((a, r) => (r.totalDebits > (a?.totalDebits ?? -1) ? r : a), ov.reports[0]);
  const avgNet = ov.totals.cashToBank / days;
  const avgDebits = ov.totals.debits / days;
  const spikePct = worstDebitDay && avgDebits > 0 ? Math.round((worstDebitDay.totalDebits / avgDebits - 1) * 100) : 0;

  const tableDays = [...ov.reports].reverse().slice(0, 4);
  const positive = ov.totals.cashToBank >= 0;

  return (
    <div className="flex flex-col gap-3 pb-1 xl:h-full xl:min-h-0">
      {/* Row 1 — hero + KPI stack */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        {/* Ledger health hero */}
        <section className="card relative flex flex-col justify-between gap-3 overflow-hidden bg-gradient-to-br from-primary-soft/60 via-surface to-surface p-5 xl:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface shadow-[var(--shadow-sm)]">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Ledger period</p>
                <p className="text-sm font-medium text-foreground">
                  {bounds
                    ? `${displayDate(bounds.min)} – ${displayDate(bounds.max)} (${ov.reports.length} of ${spanDays} days)`
                    : "No data yet"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/reports"
                className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-surface-2"
              >
                Full reports
              </Link>
              {canEdit && (
                <Link
                  href={`/entry/${today}`}
                  className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:bg-primary-dark"
                >
                  + New entry
                </Link>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-base font-semibold text-foreground">{monthName} Ledger Health</h1>
            <p className="text-3xl font-bold tabular-nums tracking-tight text-primary sm:text-4xl">
              {formatMoney(ov.totals.cashToBank)}
            </p>
            <p className="text-xs text-muted">Net Cash to Bank</p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
              positive ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {positive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
              )}
            </svg>
            {positive
              ? `Strong ${monthName ? monthName.toLowerCase() : "month"} so far! Your cash position is positive.`
              : "Cash position is negative — debits exceed receipts this period."}
          </div>
        </section>

        {/* KPI rings + totals */}
        <div className="flex flex-col gap-3 xl:col-span-2">
          <section className="card grid grid-cols-3 gap-2 p-4">
            <RingStat
              vertical
              label="Cash Retained"
              value={formatMoney(ov.totals.cashToBank)}
              caption="of total inflow"
              pct={cashRetainedPct}
              tone="success"
            />
            <RingStat
              vertical
              label="Expense Ratio"
              value={formatMoney(ov.totals.debits)}
              caption="of total expense"
              pct={expenseRatioPct}
              tone="accent"
            />
            <RingStat
              vertical
              label="Days Recorded"
              value={`${ov.reports.length} of ${spanDays}`}
              caption="days recorded"
              pct={coveragePct}
              tone="primary"
            />
          </section>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <TotalCard
              label="Total Receipts"
              value={formatMoney(ov.totals.receipts)}
              delta={receiptsDelta}
              deltaGoodWhenUp
            />
            <TotalCard
              label="Total Debits (Expenses)"
              value={formatMoney(ov.totals.debits)}
              delta={debitsDelta}
              deltaGoodWhenUp={false}
            />
          </div>
        </div>
      </div>

      {/* Row 2 — charts + activity */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="card p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Receipts vs Debits Trend</h2>
          <MonthChart data={chartData} height={150} />
        </section>
        <section className="card p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Daily Cash Flow (Net)</h2>
          <CashFlowChart data={flowData} height={150} />
        </section>
        <section className="card p-4">
          <ActivityCalendar
            year={year}
            month={month}
            title={`${monthName} ${year} Activity`}
            receiptsByDay={receiptsByDay}
          />
        </section>
      </div>

      {/* Row 3 — ledger table + insights */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        <section className="card flex flex-col p-4 xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Daily Ledger Overview</h2>
            <Link
              href="/reports/daily-summary"
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-2"
            >
              View full ledger
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted">
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Day</th>
                  <th className="pb-2 pr-3 text-right font-medium">Receipts (₹)</th>
                  <th className="pb-2 pr-3 text-right font-medium">Debits (₹)</th>
                  <th className="pb-2 pr-3 text-right font-medium">Net (₹)</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableDays.map((r) => (
                  <tr key={r.dateKey} className="group">
                    <td className="py-2 pr-3">
                      <Link href={`/day/${r.dateKey}`} className="font-medium text-foreground group-hover:text-primary">
                        {displayDate(r.dateKey)}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-muted">{weekdayOf(r.dateKey)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">{formatMoney(r.totalReceipts)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">{formatMoney(r.totalDebits)}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold tabular-nums ${
                        r.cashToBank >= 0 ? "text-primary" : "text-danger"
                      }`}
                    >
                      {formatMoney(r.cashToBank)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          r.cashToBank >= 0 ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                        }`}
                      >
                        {r.cashToBank >= 0 ? "Positive" : "Negative"}
                      </span>
                    </td>
                  </tr>
                ))}
                {tableDays.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted">
                      No recorded days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Link
            href="/calendar"
            className="mt-3 flex items-center justify-center gap-1 rounded-lg py-2 text-center text-xs font-medium text-primary transition hover:bg-primary-soft"
          >
            View more days
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </section>

        <section className="card flex flex-col gap-2 p-4 xl:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Insights
          </h2>
          <div className="grid flex-1 grid-cols-2 gap-2.5">
            <InsightCard
              tone="success"
              icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              title="Best Collection Day"
              subtitle={bestDay ? `${displayDate(bestDay.dateKey)} (${weekdayOf(bestDay.dateKey).slice(0, 3)})` : "—"}
              value={bestDay ? formatMoney(bestDay.totalReceipts) : ""}
              caption="Receipts"
            />
            <InsightCard
              tone="accent"
              icon="M13 10V3L4 14h7v7l9-11h-7z"
              title="Highest Debit Day"
              subtitle={worstDebitDay ? `${displayDate(worstDebitDay.dateKey)} (${weekdayOf(worstDebitDay.dateKey).slice(0, 3)})` : "—"}
              value={worstDebitDay ? formatMoney(worstDebitDay.totalDebits) : ""}
              caption="Debits"
            />
            <InsightCard
              tone={missingDays > 0 ? "accent" : "success"}
              icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              title="Missing Entries"
              subtitle={`Expected: ${spanDays} · Recorded: ${ov.reports.length}`}
              value={`${missingDays} Day${missingDays === 1 ? "" : "s"}`}
              caption=""
            />
            <InsightCard
              tone="primary"
              icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              title="Average Daily Net"
              subtitle="Net cash per day"
              value={formatMoney(avgNet)}
              caption=""
            />
          </div>
          {spikePct >= 25 && worstDebitDay && (
            <div className="flex items-start gap-3 rounded-xl bg-danger-bg px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-danger">Expense Spike Alert</p>
                <p className="text-foreground/80">
                  Debits on {displayDate(worstDebitDay.dateKey)} were {spikePct}% higher than your {days}-day average.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TotalCard({
  label,
  value,
  delta,
  deltaGoodWhenUp,
}: {
  label: string;
  value: string;
  delta: number | null;
  deltaGoodWhenUp: boolean;
}) {
  const up = delta !== null && delta >= 0;
  const good = delta !== null && (up ? deltaGoodWhenUp : !deltaGoodWhenUp);
  return (
    <div className="card flex flex-col justify-center gap-1 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        <p className="text-xs font-medium text-muted">{label}</p>
      </div>
      <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      {delta !== null && (
        <p className={`flex items-center gap-1 text-xs font-medium ${good ? "text-success" : "text-danger"}`}>
          <svg className={`h-3 w-3 ${up ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          {Math.abs(delta).toFixed(1)}% vs first half of period
        </p>
      )}
    </div>
  );
}

function InsightCard({
  tone,
  icon,
  title,
  subtitle,
  value,
  caption,
}: {
  tone: "primary" | "accent" | "success";
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  caption: string;
}) {
  const iconTone =
    tone === "accent" ? "bg-accent-soft text-accent" : tone === "success" ? "bg-success-bg text-success" : "bg-primary-soft text-primary";
  const valueTone = tone === "accent" ? "text-accent" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-1.5">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${iconTone}`}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </span>
        <p className="text-[11px] font-semibold text-foreground">{title}</p>
      </div>
      <p className="text-[10px] text-muted">{subtitle}</p>
      <p className={`text-base font-bold tabular-nums ${valueTone}`}>{value}</p>
      {caption && <p className="text-[10px] text-muted">{caption}</p>}
    </div>
  );
}
