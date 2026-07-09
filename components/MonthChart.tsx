"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthChart({
  data,
}: {
  data: { label: string; Receipts: number; Debits: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="22%">
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
          tickFormatter={(v: number) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
        />
        <Tooltip
          cursor={{ fill: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
          formatter={(v: number) => "₹" + v.toLocaleString("en-IN")}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
        <Bar dataKey="Receipts" fill="var(--primary)" radius={[6, 6, 0, 0]} isAnimationActive={false} maxBarSize={22} />
        <Bar dataKey="Debits" fill="var(--accent)" radius={[6, 6, 0, 0]} isAnimationActive={false} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
