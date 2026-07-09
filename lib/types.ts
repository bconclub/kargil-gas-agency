export type SupplierInput = {
  rowType: string;
  supplierName: string;
  deliveryQty: number | null;
  qty921: number | null;
  qty942: number | null;
  qty958: number | null;
  online921: number | null;
  online942: number | null;
  online958: number | null;
  officeAmount: number | null;
  cashReceived: number | null;
  gpayReceived: number | null;
  totalReceived: number | null;
  systemTotal: number | null;
  balance: number | null;
};

export type TieUpInput = {
  slNo: number | null;
  party: string;
  rate: number | null;
  qty: number | null;
  total: number | null;
  cash: number | null;
  gpay: number | null;
  credit: number | null;
};

export type ExpenseInput = { head: string; amount: number | null };

export type DayTotalsInput = {
  day: string;
  totalReceipts: number;
  totalDebits: number;
  cashToBank: number;
  notes?: string | null;
};

export const EMPTY_SUPPLIER: SupplierInput = {
  rowType: "Supplier",
  supplierName: "",
  deliveryQty: null,
  qty921: null,
  qty942: null,
  qty958: null,
  online921: null,
  online942: null,
  online958: null,
  officeAmount: null,
  cashReceived: null,
  gpayReceived: null,
  totalReceived: null,
  systemTotal: null,
  balance: null,
};

export const EMPTY_TIEUP: TieUpInput = {
  slNo: null,
  party: "",
  rate: null,
  qty: null,
  total: null,
  cash: null,
  gpay: null,
  credit: null,
};

export const EMPTY_EXPENSE: ExpenseInput = { head: "", amount: null };
