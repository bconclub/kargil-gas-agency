import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveDailyReport } from "@/lib/data";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!DATE_KEY_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "USER") {
    return NextResponse.json({ error: "Read-only role cannot save entries" }, { status: 403 });
  }

  const body = await req.json();
  const { totals, suppliers, tieUps, expenses } = body ?? {};

  if (!totals || !Array.isArray(suppliers) || !Array.isArray(tieUps) || !Array.isArray(expenses)) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  try {
    await saveDailyReport(
      date,
      {
        day: String(totals.day ?? ""),
        totalReceipts: Number(totals.totalReceipts) || 0,
        totalDebits: Number(totals.totalDebits) || 0,
        cashToBank: Number(totals.cashToBank) || 0,
        notes: totals.notes ?? null,
      },
      suppliers,
      tieUps,
      expenses,
      user.sub
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}
