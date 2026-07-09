import { requireUser } from "@/lib/auth";
import { listAllExpenses, groupByDate, dataBounds } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { RangeFilter } from "@/components/RangeFilter";
import { Panel } from "@/components/Panel";
import { DayHeader } from "@/components/DayHeader";

export default async function ExpensesReport({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  await requireUser();
  const { from, to } = await searchParams;
  const [rows, bounds] = await Promise.all([listAllExpenses({ from, to }), dataBounds()]);
  const groups = groupByDate(rows);
  const grandTotal = rows.reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Expenses Report</h1>
        <p className="text-sm text-muted">Expense heads grouped and totalled by day. Click a date to open the full day.</p>
      </div>

      <RangeFilter from={from} to={to} bounds={bounds} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-medium text-muted">Total Expenses ({groups.length} days)</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-accent">{formatMoney(grandTotal)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
          <p className="text-xs font-medium text-muted">Avg / day</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {formatMoney(groups.length ? grandTotal / groups.length : 0)}
          </p>
        </div>
      </div>

      <Panel subtitle={`${rows.length} expense rows`} maxBody="max-h-[calc(100vh-26rem)]">
        {groups.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No expenses in this range.</p>}
        {groups.map((g) => {
          const dayTotal = g.rows.reduce((s, r) => s + (r.amount ?? 0), 0);
          return (
            <div key={g.dateKey}>
              <DayHeader dateKey={g.dateKey} right={<span className="font-semibold">{formatMoney(dayTotal)}</span>} />
              <table className="w-full text-sm">
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-background">
                      <td className="px-4 py-2 font-medium">{r.head}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.amount)}</td>
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
