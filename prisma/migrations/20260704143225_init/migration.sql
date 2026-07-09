-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "day" TEXT NOT NULL,
    "totalReceipts" REAL NOT NULL DEFAULT 0,
    "totalDebits" REAL NOT NULL DEFAULT 0,
    "cashToBank" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SupplierEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyReportId" TEXT NOT NULL,
    "rowType" TEXT NOT NULL DEFAULT 'Supplier',
    "supplierName" TEXT NOT NULL,
    "deliveryQty" REAL,
    "qty921" REAL,
    "qty942" REAL,
    "qty958" REAL,
    "online921" REAL,
    "online942" REAL,
    "online958" REAL,
    "officeAmount" REAL,
    "cashReceived" REAL,
    "gpayReceived" REAL,
    "totalReceived" REAL,
    "systemTotal" REAL,
    "balance" REAL,
    CONSTRAINT "SupplierEntry_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TieUpEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyReportId" TEXT NOT NULL,
    "slNo" INTEGER,
    "party" TEXT NOT NULL,
    "rate" REAL,
    "qty" REAL,
    "total" REAL,
    "cash" REAL,
    "gpay" REAL,
    "credit" REAL,
    CONSTRAINT "TieUpEntry_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpenseEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyReportId" TEXT NOT NULL,
    "head" TEXT NOT NULL,
    "amount" REAL,
    CONSTRAINT "ExpenseEntry_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_date_key" ON "DailyReport"("date");
