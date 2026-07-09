"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Daily net cash (receipts − debits). Sequential single-hue area; dips below zero
// are visually anchored by the reference line rather than a second color.
export function CashFlowChart({ data }: { data: { label: string; Net: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={12}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(v: number) => {
            const sign = v < 0 ? "-" : "";
            const abs = Math.abs(v);
            return abs >= 1000 ? `${sign}₹${Math.round(abs / 1000)}k` : `${sign}₹${abs}`;
          }}
        />
        <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          formatter={(v) => "₹" + Number(v).toLocaleString("en-IN")}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="Net"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#netFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
