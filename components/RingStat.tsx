// Single-value ring meter. One hue per ring (sequential intent — magnitude, not
// category), value always direct-labeled in the center so color never carries
// meaning alone.
export function RingStat({
  label,
  pct,
  value,
  tone = "primary",
  size = 76,
  caption,
  vertical = false,
}: {
  label: string;
  pct: number; // 0-100
  value: string;
  tone?: "primary" | "accent" | "success";
  size?: number;
  caption?: string; // secondary line under the value (vertical layout)
  vertical?: boolean; // label above, ring, value + caption below (dashboard KPI row)
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);
  const strokeColor = tone === "accent" ? "var(--accent)" : tone === "success" ? "var(--success)" : "var(--primary)";

  const ring = (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        className="fill-foreground text-[15px] font-bold"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );

  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-medium text-muted">{label}</p>
        {ring}
        <div>
          <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
          {caption && <p className="text-[11px] text-muted">{caption}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {ring}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
        <p className="truncate text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}
