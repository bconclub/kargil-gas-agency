// Value semantics:
//  - null / undefined / NaN  => no data was entered  => blank cell
//  - 0                       => a real recorded zero  => "₹0" / "0"
// We never collapse a real 0 into a blank, and never render a dash placeholder.

const BLANK = "";

export function formatMoney(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return BLANK;
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatQty(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return BLANK;
  return v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// Explicit placeholder for a genuinely empty cell where the column still needs a glyph.
export function blankCell(): string {
  return BLANK;
}

export function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function displayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function displayDateShort(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

export function weekdayOf(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long",
    timeZone: "UTC",
  });
}
