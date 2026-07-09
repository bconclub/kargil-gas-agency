"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupplierInput, TieUpInput, ExpenseInput } from "@/lib/types";
import { EMPTY_SUPPLIER, EMPTY_TIEUP, EMPTY_EXPENSE } from "@/lib/types";
import { formatMoney, displayDate } from "@/lib/format";

type Suggestions = {
  suppliers: string[];
  parties: string[];
  expenseHeads: string[];
  rateByParty: Record<string, number>;
};

type Props = {
  dateKey: string;
  dayName: string;
  suggestions: Suggestions;
  initialTotals: { totalReceipts: number; totalDebits: number; cashToBank: number; notes: string };
  initialSuppliers: SupplierInput[];
  initialTieUps: TieUpInput[];
  initialExpenses: ExpenseInput[];
};

function numOrNull(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function DayEntryForm({
  dateKey,
  dayName,
  suggestions,
  initialTotals,
  initialSuppliers,
  initialTieUps,
  initialExpenses,
}: Props) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierInput[]>(
    initialSuppliers.length ? initialSuppliers : [{ ...EMPTY_SUPPLIER }]
  );
  const [tieUps, setTieUps] = useState<TieUpInput[]>(initialTieUps.length ? initialTieUps : [{ ...EMPTY_TIEUP }]);
  const [expenses, setExpenses] = useState<ExpenseInput[]>(
    initialExpenses.length ? initialExpenses : [{ ...EMPTY_EXPENSE }]
  );
  const [totalReceipts, setTotalReceipts] = useState(String(initialTotals.totalReceipts || ""));
  const [totalDebits, setTotalDebits] = useState(String(initialTotals.totalDebits || ""));
  const [cashToBank, setCashToBank] = useState(String(initialTotals.cashToBank || ""));
  const [notes, setNotes] = useState(initialTotals.notes || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const suggestedReceipts = useMemo(
    () =>
      suppliers.reduce((s, r) => s + (r.totalReceived ?? 0), 0) +
      tieUps.reduce((s, r) => s + (r.cash ?? 0) + (r.gpay ?? 0), 0),
    [suppliers, tieUps]
  );
  const suggestedDebits = useMemo(() => expenses.reduce((s, r) => s + (r.amount ?? 0), 0), [expenses]);

  function updateSupplier(i: number, patch: Partial<SupplierInput>) {
    setSuppliers((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function updateTieUp(i: number, patch: Partial<TieUpInput>) {
    setTieUps((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function updateExpense(i: number, patch: Partial<ExpenseInput>) {
    setExpenses((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function onSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/entries/${dateKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totals: {
            day: dayName,
            totalReceipts: numOrNull(totalReceipts) ?? 0,
            totalDebits: numOrNull(totalDebits) ?? 0,
            cashToBank: numOrNull(cashToBank) ?? 0,
            notes,
          },
          suppliers,
          tieUps,
          expenses,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Save failed" });
        return;
      }
      setMessage({ type: "ok", text: "Saved." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20";
  const numInputCls = inputCls + " text-right tabular-nums";

  return (
    <div className="space-y-6">
      {/* Predictive suggestions sourced from everything already in the data */}
      <datalist id="dl-suppliers">
        {suggestions.suppliers.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <datalist id="dl-parties">
        {suggestions.parties.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <datalist id="dl-expenses">
        {suggestions.expenseHeads.map((h) => (
          <option key={h} value={h} />
        ))}
      </datalist>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{displayDate(dateKey)}</h1>
          <p className="text-sm text-muted">{dayName}</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save day"}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === "ok" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Day totals */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Daily Accounts Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={`Total Receipts (A) · suggested ${formatMoney(suggestedReceipts)}`}>
            <input className={numInputCls} value={totalReceipts} onChange={(e) => setTotalReceipts(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label={`Total Debits / Expenses (B) · suggested ${formatMoney(suggestedDebits)}`}>
            <input className={numInputCls} value={totalDebits} onChange={(e) => setTotalDebits(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label="Cash to Bank (A less B)">
            <input className={numInputCls} value={cashToBank} onChange={(e) => setCashToBank(e.target.value)} inputMode="decimal" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Notes">
            <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </Field>
        </div>
      </section>

      {/* Suppliers */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">People · Delivery Staff</h2>
            <p className="text-xs text-muted">Individual delivery staff. Leave a cell blank if unknown; enter 0 only for a real zero.</p>
          </div>
          <button
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setSuppliers((r) => [...r, { ...EMPTY_SUPPLIER }])}
          >
            + Add person
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-2 py-1">Person</th>
                <th className="px-2 py-1">Delivery Qty</th>
                <th className="px-2 py-1">@921.5</th>
                <th className="px-2 py-1">@942.5</th>
                <th className="px-2 py-1">@958.0</th>
                <th className="px-2 py-1">Office Amt</th>
                <th className="px-2 py-1">Cash</th>
                <th className="px-2 py-1">GPay</th>
                <th className="px-2 py-1">Total Recv.</th>
                <th className="px-2 py-1">System Total</th>
                <th className="px-2 py-1">Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-1 py-1">
                    <input
                      className={inputCls}
                      list="dl-suppliers"
                      placeholder="Type to search…"
                      value={row.supplierName}
                      onChange={(e) => updateSupplier(i, { supplierName: e.target.value })}
                    />
                  </td>
                  {(
                    [
                      ["deliveryQty", row.deliveryQty],
                      ["qty921", row.qty921],
                      ["qty942", row.qty942],
                      ["qty958", row.qty958],
                      ["officeAmount", row.officeAmount],
                      ["cashReceived", row.cashReceived],
                      ["gpayReceived", row.gpayReceived],
                      ["totalReceived", row.totalReceived],
                      ["systemTotal", row.systemTotal],
                      ["balance", row.balance],
                    ] as [keyof SupplierInput, number | null][]
                  ).map(([key, val]) => (
                    <td key={key} className="px-1 py-1">
                      <input
                        className={numInputCls}
                        value={val ?? ""}
                        inputMode="decimal"
                        onChange={(e) => updateSupplier(i, { [key]: numOrNull(e.target.value) } as Partial<SupplierInput>)}
                      />
                    </td>
                  ))}
                  <td className="px-1 py-1 text-center">
                    <button
                      className="text-xs text-danger hover:underline"
                      onClick={() => setSuppliers((r) => r.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* NDC / Tie-ups */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Organizations · Tie-Ups / NDC</h2>
            <p className="text-xs text-muted">Institutional &amp; commercial connections</p>
          </div>
          <button
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setTieUps((r) => [...r, { ...EMPTY_TIEUP, slNo: r.length + 1 }])}
          >
            + Add organization
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-2 py-1">SL</th>
                <th className="px-2 py-1">Organization</th>
                <th className="px-2 py-1">Rate</th>
                <th className="px-2 py-1">Qty</th>
                <th className="px-2 py-1">Total</th>
                <th className="px-2 py-1">Cash</th>
                <th className="px-2 py-1">GPay</th>
                <th className="px-2 py-1">Credit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tieUps.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-1 py-1 w-16">
                    <input className={numInputCls} value={row.slNo ?? ""} inputMode="numeric" onChange={(e) => updateTieUp(i, { slNo: numOrNull(e.target.value) })} />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      className={inputCls}
                      list="dl-parties"
                      placeholder="Type to search…"
                      value={row.party}
                      onChange={(e) => {
                        const party = e.target.value;
                        const knownRate = suggestions.rateByParty[party.trim()];
                        // Auto-fill the standard rate for a recognised organisation when rate is still blank.
                        updateTieUp(i, knownRate != null && row.rate == null ? { party, rate: knownRate } : { party });
                      }}
                    />
                  </td>
                  {(
                    [
                      ["rate", row.rate],
                      ["qty", row.qty],
                      ["total", row.total],
                      ["cash", row.cash],
                      ["gpay", row.gpay],
                      ["credit", row.credit],
                    ] as [keyof TieUpInput, number | null][]
                  ).map(([key, val]) => (
                    <td key={key} className="px-1 py-1">
                      <input
                        className={numInputCls}
                        value={val ?? ""}
                        inputMode="decimal"
                        onChange={(e) => updateTieUp(i, { [key]: numOrNull(e.target.value) } as Partial<TieUpInput>)}
                      />
                    </td>
                  ))}
                  <td className="px-1 py-1 text-center">
                    <button
                      className="text-xs text-danger hover:underline"
                      onClick={() => setTieUps((r) => r.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Expenses */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Expenses</h2>
          <button
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setExpenses((r) => [...r, { ...EMPTY_EXPENSE }])}
          >
            + Add expense row
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-2 py-1">Head</th>
                <th className="px-2 py-1">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-1 py-1">
                    <input
                      className={inputCls}
                      list="dl-expenses"
                      placeholder="Type to search…"
                      value={row.head}
                      onChange={(e) => updateExpense(i, { head: e.target.value })}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      className={numInputCls}
                      value={row.amount ?? ""}
                      inputMode="decimal"
                      onChange={(e) => updateExpense(i, { amount: numOrNull(e.target.value) })}
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <button
                      className="text-xs text-danger hover:underline"
                      onClick={() => setExpenses((r) => r.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save day"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
