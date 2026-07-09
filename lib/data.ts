import { prisma } from "./prisma";
import type { SupplierInput, TieUpInput, ExpenseInput, DayTotalsInput } from "./types";

export type Range = { from?: string; to?: string };

export function keyToDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function dateToKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dateWhere(range?: Range) {
  if (!range || (!range.from && !range.to)) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (range.from) filter.gte = keyToDate(range.from);
  if (range.to) filter.lte = keyToDate(range.to);
  return filter;
}

export async function dataBounds(): Promise<{ min: string; max: string } | null> {
  const [first, last] = await Promise.all([
    prisma.dailyReport.findFirst({ orderBy: { date: "asc" } }),
    prisma.dailyReport.findFirst({ orderBy: { date: "desc" } }),
  ]);
  if (!first || !last) return null;
  return { min: dateToKey(first.date), max: dateToKey(last.date) };
}

export async function listDailyReports(range?: Range) {
  const where = dateWhere(range);
  const reports = await prisma.dailyReport.findMany({
    where: where ? { date: where } : undefined,
    orderBy: { date: "asc" },
  });
  return reports.map((r) => ({ ...r, dateKey: dateToKey(r.date) }));
}

export async function getReportByDateKey(dateKey: string) {
  const date = keyToDate(dateKey);
  const report = await prisma.dailyReport.findUnique({
    where: { date },
    include: {
      suppliers: { orderBy: { id: "asc" } },
      tieUps: { orderBy: { slNo: "asc" } },
      expenses: { orderBy: { id: "asc" } },
    },
  });
  return report;
}

export async function saveDailyReport(
  dateKey: string,
  totals: DayTotalsInput,
  suppliers: SupplierInput[],
  tieUps: TieUpInput[],
  expenses: ExpenseInput[],
  userId: string
) {
  const date = keyToDate(dateKey);
  const report = await prisma.dailyReport.upsert({
    where: { date },
    update: { ...totals, createdById: userId },
    create: { date, ...totals, createdById: userId },
  });

  await prisma.$transaction([
    prisma.supplierEntry.deleteMany({ where: { dailyReportId: report.id } }),
    prisma.tieUpEntry.deleteMany({ where: { dailyReportId: report.id } }),
    prisma.expenseEntry.deleteMany({ where: { dailyReportId: report.id } }),
  ]);

  const cleanSuppliers = suppliers.filter((s) => s.supplierName.trim().length > 0);
  const cleanTieUps = tieUps.filter((t) => t.party.trim().length > 0);
  const cleanExpenses = expenses.filter((e) => e.head.trim().length > 0);

  if (cleanSuppliers.length) {
    await prisma.supplierEntry.createMany({
      data: cleanSuppliers.map((s) => ({ ...s, dailyReportId: report.id })),
    });
  }
  if (cleanTieUps.length) {
    await prisma.tieUpEntry.createMany({
      data: cleanTieUps.map((t) => ({ ...t, dailyReportId: report.id })),
    });
  }
  if (cleanExpenses.length) {
    await prisma.expenseEntry.createMany({
      data: cleanExpenses.map((e) => ({ ...e, dailyReportId: report.id })),
    });
  }

  return report;
}

export async function listAllSuppliers(range?: Range) {
  const where = dateWhere(range);
  const rows = await prisma.supplierEntry.findMany({
    where: where ? { dailyReport: { date: where } } : undefined,
    include: { dailyReport: true },
    orderBy: [{ dailyReport: { date: "asc" } }, { id: "asc" }],
  });
  return rows.map((r) => ({ ...r, dateKey: dateToKey(r.dailyReport.date), day: r.dailyReport.day }));
}

export async function listAllTieUps(range?: Range) {
  const where = dateWhere(range);
  const rows = await prisma.tieUpEntry.findMany({
    where: where ? { dailyReport: { date: where } } : undefined,
    include: { dailyReport: true },
    orderBy: [{ dailyReport: { date: "asc" } }, { slNo: "asc" }],
  });
  return rows.map((r) => ({ ...r, dateKey: dateToKey(r.dailyReport.date), day: r.dailyReport.day }));
}

export async function listAllExpenses(range?: Range) {
  const where = dateWhere(range);
  const rows = await prisma.expenseEntry.findMany({
    where: where ? { dailyReport: { date: where } } : undefined,
    include: { dailyReport: true },
    orderBy: [{ dailyReport: { date: "asc" } }, { id: "asc" }],
  });
  return rows.map((r) => ({ ...r, dateKey: dateToKey(r.dailyReport.date), day: r.dailyReport.day }));
}

export async function rangeSummary(range?: Range) {
  const reports = await listDailyReports(range);
  const totals = reports.reduce(
    (acc, r) => {
      acc.receipts += r.totalReceipts;
      acc.debits += r.totalDebits;
      acc.cashToBank += r.cashToBank;
      return acc;
    },
    { receipts: 0, debits: 0, cashToBank: 0 }
  );
  return { reports, totals };
}

// Generic: group flat rows (each carrying dateKey + day) into per-day buckets, ascending.
export function groupByDate<T extends { dateKey: string; day: string }>(rows: T[]) {
  const map = new Map<string, { dateKey: string; day: string; rows: T[] }>();
  for (const r of rows) {
    if (!map.has(r.dateKey)) map.set(r.dateKey, { dateKey: r.dateKey, day: r.day, rows: [] });
    map.get(r.dateKey)!.rows.push(r);
  }
  return Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

// ---- Autocomplete / predictive suggestions (distinct values already in the data) ----

function uniqSorted(values: (string | null)[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = (v ?? "").trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export async function suggestionSets() {
  const [suppliers, parties, expenses, tieUpRates] = await Promise.all([
    prisma.supplierEntry.findMany({ select: { supplierName: true }, distinct: ["supplierName"] }),
    prisma.tieUpEntry.findMany({ select: { party: true }, distinct: ["party"] }),
    prisma.expenseEntry.findMany({ select: { head: true }, distinct: ["head"] }),
    prisma.tieUpEntry.findMany({ select: { party: true, rate: true }, where: { rate: { not: null } } }),
  ]);

  // most-recent-seen rate per organization, so picking a party can prefill its rate
  const rateByParty: Record<string, number> = {};
  for (const r of tieUpRates) {
    const key = (r.party ?? "").trim();
    if (key && r.rate != null && rateByParty[key] === undefined) rateByParty[key] = r.rate;
  }

  return {
    suppliers: uniqSorted(suppliers.map((s) => s.supplierName)),
    parties: uniqSorted(parties.map((t) => t.party)),
    expenseHeads: uniqSorted(expenses.map((e) => e.head)),
    rateByParty,
  };
}

// ---- Dashboard aggregations ----

export async function dashboardOverview(range?: Range) {
  const [{ reports, totals }, suppliers, tieUps, expenses] = await Promise.all([
    rangeSummary(range),
    listAllSuppliers(range),
    listAllTieUps(range),
    listAllExpenses(range),
  ]);

  const supplierAgg = new Map<string, { qty: number; received: number }>();
  for (const s of suppliers) {
    const k = s.supplierName.trim();
    if (!k) continue;
    const cur = supplierAgg.get(k) ?? { qty: 0, received: 0 };
    cur.qty += s.deliveryQty ?? 0;
    cur.received += s.totalReceived ?? 0;
    supplierAgg.set(k, cur);
  }
  const topSuppliers = Array.from(supplierAgg.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.received - a.received)
    .slice(0, 6);

  const partyAgg = new Map<string, { qty: number; total: number; credit: number }>();
  for (const t of tieUps) {
    const k = t.party.trim();
    if (!k) continue;
    const cur = partyAgg.get(k) ?? { qty: 0, total: 0, credit: 0 };
    cur.qty += t.qty ?? 0;
    cur.total += t.total ?? 0;
    cur.credit += t.credit ?? 0;
    partyAgg.set(k, cur);
  }
  const topOrgs = Array.from(partyAgg.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const expenseAgg = new Map<string, number>();
  for (const e of expenses) {
    const k = e.head.trim();
    if (!k) continue;
    expenseAgg.set(k, (expenseAgg.get(k) ?? 0) + (e.amount ?? 0));
  }
  const expenseByHead = Array.from(expenseAgg.entries())
    .map(([head, amount]) => ({ head, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const recentDays = [...reports].reverse().slice(0, 6);

  return { reports, totals, topSuppliers, topOrgs, expenseByHead, recentDays };
}
