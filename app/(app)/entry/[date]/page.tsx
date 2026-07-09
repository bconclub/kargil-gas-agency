import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getReportByDateKey, suggestionSets } from "@/lib/data";
import { DayEntryForm } from "@/components/DayEntryForm";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function EntryDayPage({ params }: { params: Promise<{ date: string }> }) {
  await requireRole("ADMIN", "USER");
  const { date } = await params;
  if (!DATE_KEY_RE.test(date)) notFound();

  const [report, suggestions] = await Promise.all([getReportByDateKey(date), suggestionSets()]);
  const [y, m, d] = date.split("-").map(Number);
  const dayName = report?.day || WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];

  return (
    <DayEntryForm
      dateKey={date}
      dayName={dayName}
      suggestions={suggestions}
      initialTotals={{
        totalReceipts: report?.totalReceipts ?? 0,
        totalDebits: report?.totalDebits ?? 0,
        cashToBank: report?.cashToBank ?? 0,
        notes: report?.notes ?? "",
      }}
      initialSuppliers={
        report?.suppliers.map((s) => ({
          rowType: s.rowType,
          supplierName: s.supplierName,
          deliveryQty: s.deliveryQty,
          qty921: s.qty921,
          qty942: s.qty942,
          qty958: s.qty958,
          online921: s.online921,
          online942: s.online942,
          online958: s.online958,
          officeAmount: s.officeAmount,
          cashReceived: s.cashReceived,
          gpayReceived: s.gpayReceived,
          totalReceived: s.totalReceived,
          systemTotal: s.systemTotal,
          balance: s.balance,
        })) ?? []
      }
      initialTieUps={
        report?.tieUps.map((t) => ({
          slNo: t.slNo,
          party: t.party,
          rate: t.rate,
          qty: t.qty,
          total: t.total,
          cash: t.cash,
          gpay: t.gpay,
          credit: t.credit,
        })) ?? []
      }
      initialExpenses={report?.expenses.map((e) => ({ head: e.head, amount: e.amount })) ?? []}
    />
  );
}
