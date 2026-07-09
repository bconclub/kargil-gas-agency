import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { listDailyReports } from "@/lib/data";
import { formatMoney, displayDate } from "@/lib/format";

export default async function EntryHubPage() {
  await requireRole("ADMIN", "USER");
  const reports = await listDailyReports();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Daily Entry</h1>
          <p className="text-sm text-muted">Open an existing day to edit, or jump to today to add a new one.</p>
        </div>
        <Link
          href={`/entry/${today}`}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark"
        >
          + Enter today
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3 text-right">Receipts</th>
              <th className="px-4 py-3 text-right">Debits</th>
              <th className="px-4 py-3 text-right">Cash to Bank</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.dateKey} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">{displayDate(r.dateKey)}</td>
                <td className="px-4 py-2.5 text-muted">{r.day}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(r.totalReceipts)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(r.totalDebits)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(r.cashToBank)}</td>
                <td className="px-4 py-2.5 text-right">
                  <Link href={`/entry/${r.dateKey}`} className="font-medium text-primary hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
