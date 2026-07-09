import { requireUser } from "@/lib/auth";
import { listDailyReports, dataBounds } from "@/lib/data";
import { Calendar } from "@/components/Calendar";

export default async function CalendarPage() {
  await requireUser();
  const [reports, bounds] = await Promise.all([listDailyReports(), dataBounds()]);
  const dataByDate: Record<string, { totalReceipts: number; totalDebits: number }> = {};
  for (const r of reports) {
    dataByDate[r.dateKey] = { totalReceipts: r.totalReceipts, totalDebits: r.totalDebits };
  }
  const initialMonth = (bounds?.max ?? "2026-05-01").slice(0, 7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
        <p className="text-sm text-muted">
          Each day shows its receipts and expenses at a glance. Navigate any month; click a day to open its report.
        </p>
      </div>
      <Calendar initialMonth={initialMonth} dataByDate={dataByDate} linkPrefix="/day" />
    </div>
  );
}
