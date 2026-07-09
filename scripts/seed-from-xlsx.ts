import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: path.join(__dirname, "..", "dev.db") });
const prisma = new PrismaClient({ adapter });

const SOURCE = "C:\\Users\\user\\Desktop\\MAY_2026_Consolidated - option 1.xlsx";

// The ledger sheet's date cells carry a stray ~5.5h time-of-day offset baked in at
// export time (e.g. 2026-05-01T18:29:50Z meaning "2026-05-02"). Snap to the nearest
// UTC day boundary instead of flooring, or every ledger row lands one day early.
function toDateOnly(d: Date): Date {
  const dayMs = 86400000;
  return new Date(Math.round(d.getTime() / dayMs) * dayMs);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// parses "02-May-2026" without going through the Date constructor's locale/timezone-sensitive parsing
function parseDDMonYYYY(s: string): Date | null {
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const monthIdx = MONTHS.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  const year = Number(m[3]);
  if (monthIdx < 0) return null;
  return new Date(Date.UTC(year, monthIdx, day));
}

async function seedUsers() {
  const users = [
    { username: "admin", name: "Reju", role: "ADMIN" as const, password: "admin123" },
    { username: "user1", name: "Anand", role: "USER" as const, password: "user123" },
    { username: "user2", name: "Meera", role: "USER" as const, password: "user123" },
    { username: "ceo", name: "Kabir", role: "CEO" as const, password: "ceo123" },
  ];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, role: u.role },
      create: { username: u.username, name: u.name, role: u.role, passwordHash },
    });
  }
  console.log(`Seeded ${users.length} users`);
}

async function seedReports() {
  const wb = XLSX.readFile(SOURCE, { cellDates: true });

  const summarySheet = wb.Sheets["Daily Accounts Summary"];
  const summaryRows: any[][] = XLSX.utils.sheet_to_json(summarySheet, { header: 1, raw: true, defval: null });
  // header lives at row index 2; data rows follow until the day-by-day dump marker (first unparseable col0)
  const dayInfo = new Map<string, { day: string; totalReceipts: number; totalDebits: number; cashToBank: number }>();
  for (let i = 3; i < summaryRows.length; i++) {
    const row = summaryRows[i];
    const raw0 = row?.[0];
    const parsed = typeof raw0 === "string" ? parseDDMonYYYY(raw0) : raw0 instanceof Date ? raw0 : null;
    if (!parsed) break;
    const key = toDateOnly(parsed).toISOString();
    dayInfo.set(key, {
      day: String(row[1] ?? ""),
      totalReceipts: Number(row[2]) || 0,
      totalDebits: Number(row[3]) || 0,
      cashToBank: Number(row[4]) || 0,
    });
  }
  console.log(`Parsed ${dayInfo.size} daily summary rows`);

  const ledgerSheet = wb.Sheets["Supplier-Delivery Ledger"];
  const ledgerRows: any[] = XLSX.utils.sheet_to_json(ledgerSheet, { raw: true });

  const byDate = new Map<string, any[]>();
  for (const row of ledgerRows) {
    const rawDate = row["Date"];
    if (!rawDate) continue;
    const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (isNaN(d.getTime())) continue;
    const key = toDateOnly(d).toISOString();
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(row);
  }

  const num = (v: any): number | null => {
    if (v === undefined || v === null || v === "" || (typeof v === "string" && isNaN(Number(v)))) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  for (const [key, rows] of byDate) {
    const info = dayInfo.get(key) ?? { day: "", totalReceipts: 0, totalDebits: 0, cashToBank: 0 };
    const date = new Date(key);

    const report = await prisma.dailyReport.upsert({
      where: { date },
      update: {
        day: info.day,
        totalReceipts: info.totalReceipts,
        totalDebits: info.totalDebits,
        cashToBank: info.cashToBank,
      },
      create: {
        date,
        day: info.day,
        totalReceipts: info.totalReceipts,
        totalDebits: info.totalDebits,
        cashToBank: info.cashToBank,
      },
    });

    // clear any prior child rows for idempotent re-seeding
    await prisma.supplierEntry.deleteMany({ where: { dailyReportId: report.id } });
    await prisma.tieUpEntry.deleteMany({ where: { dailyReportId: report.id } });
    await prisma.expenseEntry.deleteMany({ where: { dailyReportId: report.id } });

    for (const row of rows) {
      const rowType = row["Row Type"];
      const supplierName = row["Supplier / Row Label"];
      if (supplierName && (rowType === "Supplier" || rowType === "Subtotal")) {
        await prisma.supplierEntry.create({
          data: {
            dailyReportId: report.id,
            rowType,
            supplierName: String(supplierName),
            deliveryQty: num(row["Delivery Qty (Total)"]),
            qty921: num(row["Delivery Qty @921.5"]),
            qty942: num(row["Delivery Qty @942.5"]),
            qty958: num(row["Delivery Qty @958.0"]),
            online921: num(row["Online Qty @921.5"]),
            online942: num(row["Online Qty @942.5"]),
            online958: num(row["Online Qty @958.0"]),
            officeAmount: num(row["Office Total Amount"]),
            cashReceived: num(row["Cash Received"]),
            gpayReceived: num(row["GPay Received"]),
            totalReceived: num(row["Total Received"]),
            systemTotal: num(row["System Total"]),
            balance: num(row["Balance"]),
          },
        });
      }

      const party = row["Tie-Up / Party"];
      if (party) {
        await prisma.tieUpEntry.create({
          data: {
            dailyReportId: report.id,
            slNo: row["SL No"] ? Math.trunc(Number(row["SL No"])) : null,
            party: String(party),
            rate: num(row["Tie-Up Rate"]),
            qty: num(row["Tie-Up Qty"]),
            total: num(row["Tie-Up Total"]),
            cash: num(row["Tie-Up Cash"]),
            gpay: num(row["Tie-Up GPay"]),
            credit: num(row["Tie-Up Credit"]),
          },
        });
      }

      const head = row["Expense Head"];
      if (head && typeof head === "string" && !["ONLINE", "GPAY", "CASH", "NDC GPAY", "TOTAL CASH"].includes(head)) {
        await prisma.expenseEntry.create({
          data: {
            dailyReportId: report.id,
            head: String(head),
            amount: num(row["Expense Amount"]),
          },
        });
      }
    }
  }
  console.log(`Seeded ${byDate.size} daily reports with ledger detail`);
}

async function main() {
  await seedUsers();
  await seedReports();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
