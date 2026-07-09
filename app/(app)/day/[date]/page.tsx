import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getReportByDateKey } from "@/lib/data";
import { formatMoney, formatQty, displayDate } from "@/lib/format";
import { ShareButton } from "@/components/ShareButton";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DayReportPage({ params }: { params: Promise<{ date: string }> }) {
  const user = await requireUser();
  const { date } = await params;
  if (!DATE_KEY_RE.test(date)) notFound();

  const report = await getReportByDateKey(date);
  const canEdit = user.role === "ADMIN" || user.role === "USER";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{displayDate(date)}</h1>
          <p className="text-sm text-muted">{report?.day || "No entry recorded for this day"}</p>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton />
          {canEdit && (
            <Link
              href={`/entry/${date}`}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
            >
              {report ? "Edit day" : "Add entry"}
            </Link>
          )}
        </div>
      </div>

      {!report && <p className="text-sm text-muted">Nothing recorded yet for this date.</p>}

      {report && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Receipts (A)" value={formatMoney(report.totalReceipts)} />
            <StatCard label="Total Debits (B)" value={formatMoney(report.totalDebits)} />
            <StatCard label="Cash to Bank (A less B)" value={formatMoney(report.cashToBank)} />
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <h2 className="mb-1 text-sm font-semibold text-foreground">People · Delivery Staff</h2>
            <p className="mb-4 text-xs text-muted">Individual delivery staff collections</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-2 py-1">Person</th>
                    <th className="px-2 py-1 text-right">Delivery Qty</th>
                    <th className="px-2 py-1 text-right">Cash</th>
                    <th className="px-2 py-1 text-right">GPay</th>
                    <th className="px-2 py-1 text-right">Total Received</th>
                    <th className="px-2 py-1 text-right">System Total</th>
                    <th className="px-2 py-1 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {report.suppliers.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-2 py-1.5 font-medium">{s.supplierName}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatQty(s.deliveryQty)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(s.cashReceived)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(s.gpayReceived)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(s.totalReceived)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(s.systemTotal)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(s.balance)}</td>
                    </tr>
                  ))}
                  {report.suppliers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-muted">
                        No supplier rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <h2 className="mb-1 text-sm font-semibold text-foreground">Organizations · Tie-Ups / NDC</h2>
            <p className="mb-4 text-xs text-muted">Institutional &amp; commercial connections</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-2 py-1">SL</th>
                    <th className="px-2 py-1">Organization</th>
                    <th className="px-2 py-1 text-right">Rate</th>
                    <th className="px-2 py-1 text-right">Qty</th>
                    <th className="px-2 py-1 text-right">Total</th>
                    <th className="px-2 py-1 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {report.tieUps.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="px-2 py-1.5 text-muted">{t.slNo ?? ""}</td>
                      <td className="px-2 py-1.5 font-medium">{t.party}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(t.rate)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatQty(t.qty)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(t.total)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(t.credit)}</td>
                    </tr>
                  ))}
                  {report.tieUps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-muted">
                        No tie-up rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Expenses</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-2 py-1">Head</th>
                    <th className="px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expenses.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="px-2 py-1.5 font-medium">{e.head}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">{formatMoney(e.amount)}</td>
                    </tr>
                  ))}
                  {report.expenses.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-2 py-6 text-center text-muted">
                        No expense rows.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
