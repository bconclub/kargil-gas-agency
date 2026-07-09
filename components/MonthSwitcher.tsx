"use client";

import { useRouter, usePathname } from "next/navigation";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthBounds(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  const from = `${ym}-01`;
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const to = `${ym}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

function shift(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function MonthSwitcher({
  from,
  to,
  bounds,
}: {
  from?: string;
  to?: string;
  bounds: { min: string; max: string } | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const anchor = (from ?? bounds?.max ?? "2026-05-01").slice(0, 7);
  const [ay, am] = anchor.split("-").map(Number);
  const label = `${MONTH_NAMES[am - 1]} ${ay}`;
  const isMonthView = Boolean(from && to);

  function go(ym: string) {
    const { from: f, to: t } = monthBounds(ym);
    router.push(`${pathname}?from=${f}&to=${t}`);
  }
  function clear() {
    router.push(pathname);
  }

  const minMonth = bounds?.min.slice(0, 7);
  const maxMonth = bounds?.max.slice(0, 7);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
        <button
          aria-label="Previous month"
          disabled={minMonth ? anchor <= minMonth : false}
          onClick={() => go(shift(anchor, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="min-w-[7.5rem] text-center text-sm font-semibold text-foreground">{label}</span>
        <button
          aria-label="Next month"
          disabled={maxMonth ? anchor >= maxMonth : false}
          onClick={() => go(shift(anchor, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {isMonthView ? (
        <button onClick={clear} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2">
          All time
        </button>
      ) : (
        <button onClick={() => go(anchor)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-primary transition hover:bg-surface-2">
          This month
        </button>
      )}
    </div>
  );
}
