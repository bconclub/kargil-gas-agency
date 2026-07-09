import { requireUser } from "@/lib/auth";
import { listAllTieUps, groupByDate, dataBounds } from "@/lib/data";
import { formatMoney, formatQty } from "@/lib/format";
import { RangeFilter } from "@/components/RangeFilter";
import { Panel } from "@/components/Panel";
import { DayHeader } from "@/components/DayHeader";

export default async function TieUpReport({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  await requireUser();
  const { from, to } = await searchParams;
  const [rows, bounds] = await Promise.all([listAllTieUps({ from, to }), dataBounds()]);
  const groups = groupByDate(rows);

  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <OrgIcon />
          <h1 className="text-xl font-semibold text-foreground">Tie-Up / NDC Report</h1>
        </div>
        <p className="text-sm text-muted">
          Organizations: institutional &amp; commercial connections (IIM, NIT, HILITE, hotels, messes). Grouped by day.
        </p>
      </div>

      <RangeFilter from={from} to={to} bounds={bounds} />

      <Panel subtitle={`${groups.length} days · ${rows.length} rows`} maxBody="max-h-[calc(100vh-20rem)]">
        {groups.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No entries in this range.</p>}
        {groups.map((g) => {
          const dayQty = g.rows.reduce((s, r) => s + (r.qty ?? 0), 0);
          const dayTotal = g.rows.reduce((s, r) => s + (r.total ?? 0), 0);
          const dayCredit = g.rows.reduce((s, r) => s + (r.credit ?? 0), 0);
          return (
            <div key={g.dateKey}>
              <DayHeader
                dateKey={g.dateKey}
                right={
                  <span className="text-xs text-muted">
                    {formatQty(dayQty)} qty · {formatMoney(dayTotal)} billed · {formatMoney(dayCredit)} credit
                  </span>
                }
              />
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-4 py-2">SL</th>
                    <th className="px-4 py-2">Organization</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-right">Cash</th>
                    <th className="px-4 py-2 text-right">GPay</th>
                    <th className="px-4 py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-background">
                      <td className="px-4 py-2 text-muted">{r.slNo ?? ""}</td>
                      <td className="px-4 py-2 font-medium">{r.party}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.rate)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatQty(r.qty)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.total)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.cash)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.gpay)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.credit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

function OrgIcon() {
  return (
    <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m6-4h6M9 13h6M9 9h6"
      />
    </svg>
  );
}
