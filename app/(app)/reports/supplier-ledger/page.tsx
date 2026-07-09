import { requireUser } from "@/lib/auth";
import { listAllSuppliers, groupByDate, dataBounds } from "@/lib/data";
import { formatMoney, formatQty } from "@/lib/format";
import { RangeFilter } from "@/components/RangeFilter";
import { Panel } from "@/components/Panel";
import { DayHeader } from "@/components/DayHeader";

export default async function SupplierLedgerReport({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireUser();
  const { from, to } = await searchParams;
  const [rows, bounds] = await Promise.all([listAllSuppliers({ from, to }), dataBounds()]);
  const groups = groupByDate(rows);

  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <PeopleIcon />
          <h1 className="text-xl font-semibold text-foreground">Delivery Staff Ledger</h1>
        </div>
        <p className="text-sm text-muted">
          People: individual delivery staff. Per-person delivery quantity and collections, grouped by day.
        </p>
      </div>

      <RangeFilter from={from} to={to} bounds={bounds} />

      <Panel subtitle={`${groups.length} days · ${rows.length} rows`} maxBody="max-h-[calc(100vh-20rem)]">
        {groups.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No entries in this range.</p>}
        {groups.map((g) => {
          const dayQty = g.rows.reduce((s, r) => s + (r.deliveryQty ?? 0), 0);
          const dayRecv = g.rows.reduce((s, r) => s + (r.totalReceived ?? 0), 0);
          return (
            <div key={g.dateKey}>
              <DayHeader
                dateKey={g.dateKey}
                right={
                  <span className="text-xs text-muted">
                    {formatQty(dayQty)} qty · {formatMoney(dayRecv)} received
                  </span>
                }
              />
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-4 py-2">Person</th>
                    <th className="px-4 py-2 text-right">Delivery Qty</th>
                    <th className="px-4 py-2 text-right">Office Amt</th>
                    <th className="px-4 py-2 text-right">Cash</th>
                    <th className="px-4 py-2 text-right">GPay</th>
                    <th className="px-4 py-2 text-right">Total Received</th>
                    <th className="px-4 py-2 text-right">System Total</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-background">
                      <td className="px-4 py-2 font-medium">{r.supplierName}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatQty(r.deliveryQty)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.officeAmount)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.cashReceived)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.gpayReceived)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.totalReceived)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.systemTotal)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.balance)}</td>
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

function PeopleIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-1a4 4 0 00-4-4h-1M9 20H4v-1a4 4 0 014-4h4a4 4 0 014 4v1H9zm3-9a3 3 0 100-6 3 3 0 000 6zm7-1a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
      />
    </svg>
  );
}
