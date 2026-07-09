import Link from "next/link";

// Month-at-a-glance activity heat map. Server component — pure markup.
// Heat encodes receipts magnitude (quartiles among recorded days); a day with no
// record renders flat. Recorded days link to their day view.
export function ActivityCalendar({
  year,
  month, // 1-12
  title,
  receiptsByDay,
}: {
  year: number;
  month: number;
  title: string;
  receiptsByDay: Record<string, number>; // dateKey -> totalReceipts
}) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Monday-first column index (getUTCDay: Sun=0)
  const lead = (first.getUTCDay() + 6) % 7;

  const values = Object.values(receiptsByDay).sort((a, b) => a - b);
  const q = (p: number) => values[Math.min(values.length - 1, Math.floor(p * values.length))] ?? 0;
  const q1 = q(0.25), q2 = q(0.5), q3 = q(0.75);

  const heatClass = (v: number | undefined) => {
    if (v === undefined) return "text-muted/60";
    if (v <= q1) return "bg-primary/15 text-foreground";
    if (v <= q2) return "bg-primary/30 text-foreground";
    if (v <= q3) return "bg-primary/50 text-primary-foreground";
    return "bg-primary text-primary-foreground";
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const keyOf = (d: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`x${i}`} />;
          const dateKey = keyOf(d);
          const v = receiptsByDay[dateKey];
          const cls = `flex h-7 items-center justify-center rounded-md text-xs font-medium tabular-nums transition ${heatClass(v)}`;
          return v !== undefined ? (
            <Link key={dateKey} href={`/day/${dateKey}`} title={`View ${dateKey}`} className={`${cls} hover:ring-2 hover:ring-primary/40`}>
              {d}
            </Link>
          ) : (
            <span key={dateKey} className={cls}>{d}</span>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <span>Low activity</span>
        <span className="flex items-center gap-1">
          <i className="h-2.5 w-4 rounded-sm bg-primary/15" />
          <i className="h-2.5 w-4 rounded-sm bg-primary/30" />
          <i className="h-2.5 w-4 rounded-sm bg-primary/50" />
          <i className="h-2.5 w-4 rounded-sm bg-primary" />
        </span>
        <span>High activity</span>
      </div>
    </div>
  );
}
