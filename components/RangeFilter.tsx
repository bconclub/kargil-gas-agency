"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { displayDate } from "@/lib/format";

type Props = {
  from?: string;
  to?: string;
  bounds: { min: string; max: string } | null;
};

export function RangeFilter({ from, to, bounds }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [custom, setCustom] = useState(Boolean(from || to));
  const [fromV, setFromV] = useState(from ?? "");
  const [toV, setToV] = useState(to ?? "");

  function apply(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams();
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function preset(kind: "all" | "last7" | "last30") {
    setCustom(false);
    if (!bounds || kind === "all") {
      setFromV("");
      setToV("");
      apply("", "");
      return;
    }
    const max = new Date(bounds.max + "T00:00:00Z");
    const back = kind === "last7" ? 6 : 29;
    const start = new Date(max);
    start.setUTCDate(start.getUTCDate() - back);
    const startKey = start.toISOString().slice(0, 10);
    const minKey = startKey < bounds.min ? bounds.min : startKey;
    setFromV(minKey);
    setToV(bounds.max);
    apply(minKey, bounds.max);
  }

  const active = Boolean(from || to);
  const label = active
    ? `${from ? displayDate(from) : "Start"} → ${to ? displayDate(to) : "End"}`
    : "All time";

  return (
    <div className="card p-2 sm:p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {/* Current range chip */}
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>

        {/* Segmented presets */}
        <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1">
          <Seg onClick={() => preset("last7")} active={false}>
            7 days
          </Seg>
          <Seg onClick={() => preset("last30")} active={false}>
            30 days
          </Seg>
          <Seg onClick={() => preset("all")} active={!active && !custom}>
            All time
          </Seg>
          <Seg onClick={() => setCustom((c) => !c)} active={custom}>
            Custom
          </Seg>
        </div>

        {bounds && (
          <span className="ml-auto hidden text-xs text-muted sm:block">
            Data {displayDate(bounds.min)} to {displayDate(bounds.max)}
          </span>
        )}
      </div>

      {custom && (
        <div className="mt-2 flex flex-wrap items-end gap-3 rounded-xl bg-surface-2 px-3 py-3">
          <label className="flex flex-col text-xs font-medium text-muted">
            From
            <input
              type="date"
              value={fromV}
              min={bounds?.min}
              max={bounds?.max}
              onChange={(e) => setFromV(e.target.value)}
              className="mt-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-muted">
            To
            <input
              type="date"
              value={toV}
              min={bounds?.min}
              max={bounds?.max}
              onChange={(e) => setToV(e.target.value)}
              className="mt-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground"
            />
          </label>
          <button
            onClick={() => apply(fromV, toV)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark"
          >
            Apply range
          </button>
        </div>
      )}
    </div>
  );
}

function Seg({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active ? "bg-surface text-primary shadow-[var(--shadow-sm)]" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
