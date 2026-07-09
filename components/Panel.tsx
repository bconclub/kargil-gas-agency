import React from "react";

// A titled card whose body scrolls independently (so the page itself doesn't
// grow unbounded — each container owns its own scroll).
export function Panel({
  title,
  subtitle,
  right,
  children,
  bodyClassName = "",
  maxBody = "max-h-[62vh]",
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
  maxBody?: string;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
      {(title || right) && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={`scroll-slim min-h-0 flex-1 overflow-auto ${maxBody} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
