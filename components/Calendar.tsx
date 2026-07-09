"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

type DayInfo = { totalReceipts: number; totalDebits: number };

function compactINR(v: number): string {
  if (!v) return "";
  if (v >= 100000) return "₹" + (v / 100000).toFixed(v % 100000 === 0 ? 0 : 1) + "L";
  if (v >= 1000) return "₹" + Math.round(v / 1000) + "k";
  return "₹" + v;
}

export function Calendar({
  initialMonth,
  dataByDate,
  linkPrefix,
}: {
  initialMonth: string; // "2026-05"
  dataByDate: Record<string, DayInfo>;
  linkPrefix: string;
}) {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = initialMonth.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const monthTotal = useMemo(() => {
    return days.reduce(
      (acc, d) => {
        if (!isSameMonth(d, cursor)) return acc;
        const info = dataByDate[format(d, "yyyy-MM-dd")];
        if (info) {
          acc.receipts += info.totalReceipts;
          acc.debits += info.totalDebits;
          acc.count += 1;
        }
        return acc;
      },
      { receipts: 0, debits: 0, count: 0 }
    );
  }, [days, cursor, dataByDate]);

  return (
    <div className="card p-3 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:bg-surface-2"
            onClick={() => setCursor((c) => subMonths(c, 1))}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="min-w-[8.5rem] text-center text-base font-bold text-foreground">{format(cursor, "MMMM yyyy")}</h2>
          <button
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:bg-surface-2"
            onClick={() => setCursor((c) => addMonths(c, 1))}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-muted">{monthTotal.count} recorded days</span>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary">
            Receipts <b className="tabular-nums">{compactINR(monthTotal.receipts) || "₹0"}</b>
          </span>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">
            Debits <b className="tabular-nums">{compactINR(monthTotal.debits) || "₹0"}</b>
          </span>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1 text-center text-[11px] font-semibold text-muted sm:text-xs">
            <span className="sm:hidden">{d}</span>
            <span className="hidden sm:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}</span>
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const info = dataByDate[key];
          const inMonth = isSameMonth(d, cursor);
          return (
            <button
              key={key}
              disabled={!inMonth}
              onClick={() => router.push(`${linkPrefix}/${key}`)}
              className={`flex min-h-[3.25rem] flex-col items-start overflow-hidden rounded-lg border p-1 text-left transition sm:min-h-[5rem] sm:rounded-xl sm:p-2 ${
                inMonth
                  ? info
                    ? "border-primary/25 bg-primary-soft/40 hover:border-primary hover:shadow-[var(--shadow-sm)]"
                    : "border-border bg-surface-2 hover:bg-surface"
                  : "border-transparent bg-transparent"
              } ${isToday(d) ? "ring-2 ring-accent" : ""}`}
            >
              <span className={`text-[11px] font-semibold leading-none sm:text-xs ${inMonth ? "text-foreground" : "text-muted/30"}`}>
                {format(d, "d")}
              </span>
              {info ? (
                <span className="mt-auto w-full min-w-0">
                  <span className="block truncate text-[9px] font-bold leading-tight text-primary sm:text-[11px]">
                    {compactINR(info.totalReceipts) || "₹0"}
                  </span>
                  <span className="hidden truncate text-[10px] leading-tight text-accent sm:block">
                    exp {compactINR(info.totalDebits) || "₹0"}
                  </span>
                </span>
              ) : inMonth ? (
                <span className="mt-auto hidden text-[10px] text-muted/50 sm:block">no entry</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted">
        Each day shows its receipts (expenses on wider screens). Tap any day to open its full report.
      </p>
    </div>
  );
}
