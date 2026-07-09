import Link from "next/link";
import { displayDate, weekdayOf } from "@/lib/format";

// Sticky per-day header used inside grouped-by-date reports. Clicking drills
// into that day's full report at /day/[date].
export function DayHeader({ dateKey, right }: { dateKey: string; right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-y border-border bg-surface-2 px-4 py-2 first:border-t-0">
      <Link href={`/day/${dateKey}`} className="group flex items-baseline gap-2">
        <span className="text-sm font-semibold text-foreground group-hover:text-primary">{displayDate(dateKey)}</span>
        <span className="text-xs text-muted">{weekdayOf(dateKey)}</span>
        <span className="text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
          open day →
        </span>
      </Link>
      {right && <div className="text-sm tabular-nums text-foreground">{right}</div>}
    </div>
  );
}
