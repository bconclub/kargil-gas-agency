import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { rangeSummary, dataBounds } from "@/lib/data";
import { formatMoney, displayDate } from "@/lib/format";
import { RangeFilter } from "@/components/RangeFilter";
import { Panel } from "@/components/Panel";

export default async function DailySummaryReport({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireUser();
  const { from, to } = await searchParams;
  const [{ reports, totals }, bounds] = await Promise.all([rangeSummary({ from, to }), dataBounds()]);

  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Daily Accounts Summary</h1>
        <p className="text-sm text-muted">One row per day: receipts, debits, and net cash to bank.</p>
      </div>

      <RangeFilter from={from} to={to} bounds={bounds} />

      <Panel title={`${reports.length} days`} subtitle="Click a date to open that day's full report" maxBody="max-h-[calc(100vh-20rem)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3 text-right">Total Receipts (A)</th>
              <th className="px-4 py-3 text-right">Total Debits (B)</th>
              <th className="px-4 py-3 text-right">Cash to Bank (A less B)</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.dateKey} className="border-b border-border last:border-0 hover:bg-background">
                <td className="px-4 py-2.5">
                  <Link href={`/day/${r.dateKey}`} className="font-medium text-primary hover:underline">
                    {displayDate(r.dateKey)}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted">{r.day}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(r.totalReceipts)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(r.totalDebits)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(r.cashToBank)}</td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No days in this range.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="sticky bottom-0 bg-surface">
            <tr className="border-t-2 border-border font-semibold">
              <td className="px-4 py-3" colSpan={2}>
                Range total
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(totals.receipts)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(totals.debits)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(totals.cashToBank)}</td>
            </tr>
          </tfoot>
        </table>
      </Panel>
    </div>
  );
}
