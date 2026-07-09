import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const adapter = new PrismaBetterSqlite3({ url: path.join(__dirname, "..", "dev.db") });
const prisma = new PrismaClient({ adapter });

// Real accounts: set ADMIN_PASSWORD / USER1_PASSWORD / USER2_PASSWORD / CEO_PASSWORD
// in the environment before seeding a real deploy. These fallbacks are dev-only.
const users = [
  { username: "admin", name: "Reju", role: "ADMIN" as const, password: process.env.ADMIN_PASSWORD || "admin123" },
  { username: "user1", name: "Anand", role: "USER" as const, password: process.env.USER1_PASSWORD || "user123" },
  { username: "user2", name: "Meera", role: "USER" as const, password: process.env.USER2_PASSWORD || "user123" },
  { username: "ceo", name: "Kabir", role: "CEO" as const, password: process.env.CEO_PASSWORD || "ceo123" },
];

async function seedUsers() {
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, role: u.role, passwordHash },
      create: { username: u.username, name: u.name, role: u.role, passwordHash },
    });
  }
  console.log(`Seeded ${users.length} users`);
}

type Fixture = {
  dateKey: string;
  day: string;
  totalReceipts: number;
  totalDebits: number;
  cashToBank: number;
  suppliers: Record<string, unknown>[];
  tieUps: Record<string, unknown>[];
  expenses: Record<string, unknown>[];
};

async function seedReports() {
  const fixturePath = path.join(__dirname, "fixtures", "may-2026.json");
  const fixture: Fixture[] = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

  for (const day of fixture) {
    const date = new Date(day.dateKey + "T00:00:00.000Z");
    const report = await prisma.dailyReport.upsert({
      where: { date },
      update: { day: day.day, totalReceipts: day.totalReceipts, totalDebits: day.totalDebits, cashToBank: day.cashToBank },
      create: {
        date,
        day: day.day,
        totalReceipts: day.totalReceipts,
        totalDebits: day.totalDebits,
        cashToBank: day.cashToBank,
      },
    });

    await prisma.supplierEntry.deleteMany({ where: { dailyReportId: report.id } });
    await prisma.tieUpEntry.deleteMany({ where: { dailyReportId: report.id } });
    await prisma.expenseEntry.deleteMany({ where: { dailyReportId: report.id } });

    if (day.suppliers.length) {
      await prisma.supplierEntry.createMany({
        data: day.suppliers.map((s) => ({ ...s, dailyReportId: report.id }) as any),
      });
    }
    if (day.tieUps.length) {
      await prisma.tieUpEntry.createMany({
        data: day.tieUps.map((t) => ({ ...t, dailyReportId: report.id }) as any),
      });
    }
    if (day.expenses.length) {
      await prisma.expenseEntry.createMany({
        data: day.expenses.map((e) => ({ ...e, dailyReportId: report.id }) as any),
      });
    }
  }
  console.log(`Seeded ${fixture.length} daily reports with ledger detail`);
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
