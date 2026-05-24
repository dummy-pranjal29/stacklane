import { FinancialRecord } from "./types";

interface NormalizeCSVRowParams {
  row: Record<string, string>;
}

export function normalizeCSVRow({
  row,
}: NormalizeCSVRowParams): FinancialRecord {
  return {
    vendor: row.vendor || "Unknown Vendor",

    amount: Number(row.amount || 0),

    currency: row.currency || "USD",

    category: row.category || "Uncategorized",

    date: row.date,

    sourceType: "csv",
  };
}
