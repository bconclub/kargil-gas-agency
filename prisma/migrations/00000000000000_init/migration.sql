-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'CEO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "day" TEXT NOT NULL,
    "totalReceipts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDebits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashToBank" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierEntry" (
    "id" TEXT NOT NULL,
    "dailyReportId" TEXT NOT NULL,
    "rowType" TEXT NOT NULL DEFAULT 'Supplier',
    "supplierName" TEXT NOT NULL,
    "deliveryQty" DOUBLE PRECISION,
    "qty921" DOUBLE PRECISION,
    "qty942" DOUBLE PRECISION,
    "qty958" DOUBLE PRECISION,
    "online921" DOUBLE PRECISION,
    "online942" DOUBLE PRECISION,
    "online958" DOUBLE PRECISION,
    "officeAmount" DOUBLE PRECISION,
    "cashReceived" DOUBLE PRECISION,
    "gpayReceived" DOUBLE PRECISION,
    "totalReceived" DOUBLE PRECISION,
    "systemTotal" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,

    CONSTRAINT "SupplierEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TieUpEntry" (
    "id" TEXT NOT NULL,
    "dailyReportId" TEXT NOT NULL,
    "slNo" INTEGER,
    "party" TEXT NOT NULL,
    "rate" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "cash" DOUBLE PRECISION,
    "gpay" DOUBLE PRECISION,
    "credit" DOUBLE PRECISION,

    CONSTRAINT "TieUpEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseEntry" (
    "id" TEXT NOT NULL,
    "dailyReportId" TEXT NOT NULL,
    "head" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,

    CONSTRAINT "ExpenseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_date_key" ON "DailyReport"("date");

-- AddForeignKey
ALTER TABLE "SupplierEntry" ADD CONSTRAINT "SupplierEntry_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TieUpEntry" ADD CONSTRAINT "TieUpEntry_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseEntry" ADD CONSTRAINT "ExpenseEntry_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "DailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

