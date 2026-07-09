// One-off: dump the current dev.db ledger data into a portable JSON fixture
// committed to the repo, so `npm run seed` never depends on the original
// Excel file's absolute path outside this project.
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "dev.db"), { readonly: true });

const reports = db.prepare("select * from DailyReport order by date").all();
const suppliers = db.prepare("select * from SupplierEntry").all();
const tieUps = db.prepare("select * from TieUpEntry").all();
const expenses = db.prepare("select * from ExpenseEntry").all();

const byReport = (rows) => {
  const map = {};
  for (const r of rows) {
    (map[r.dailyReportId] ??= []).push(r);
  }
  return map;
};
const suppliersByReport = byReport(suppliers);
const tieUpsByReport = byReport(tieUps);
const expensesByReport = byReport(expenses);

const fixture = reports.map((r) => ({
  dateKey: r.date.slice(0, 10),
  day: r.day,
  totalReceipts: r.totalReceipts,
  totalDebits: r.totalDebits,
  cashToBank: r.cashToBank,
  suppliers: (suppliersByReport[r.id] || []).map(({ id, dailyReportId, ...rest }) => rest),
  tieUps: (tieUpsByReport[r.id] || []).map(({ id, dailyReportId, ...rest }) => rest),
  expenses: (expensesByReport[r.id] || []).map(({ id, dailyReportId, ...rest }) => rest),
}));

fs.writeFileSync(
  path.join(__dirname, "..", "prisma", "fixtures", "may-2026.json"),
  JSON.stringify(fixture, null, 2)
);
console.log(`Exported ${fixture.length} days to prisma/fixtures/may-2026.json`);
