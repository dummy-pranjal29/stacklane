export type SupportedCurrency = "USD" | "INR" | "UNKNOWN";

export type SpendCategory =
  | "AI"
  | "Communication"
  | "Infrastructure"
  | "Finance"
  | "Productivity"
  | "Unknown";

export type BillingModel = "License-Based" | "Consumption-Based" | "Unknown";

export type FinancialRecord = {
  vendor: string;

  amount: number;

  currency: SupportedCurrency;

  category: SpendCategory;

  billingModel: BillingModel;

  date?: string;

  sourceType: "csv" | "pdf" | "excel";
};

type RawRecord = Record<string, unknown>;

function detectCurrency(text: string): SupportedCurrency {
  const lower = text.toLowerCase();

  if (lower.includes("₹") || lower.includes("inr") || lower.includes("rs")) {
    return "INR";
  }

  if (lower.includes("$") || lower.includes("usd")) {
    return "USD";
  }

  return "UNKNOWN";
}

function normalizeVendor(record: RawRecord): string {
  return String(
    record.Vendor ||
      record.vendor ||
      record.Merchant ||
      record.merchant ||
      record.Supplier ||
      record.supplier ||
      "Unknown Vendor",
  );
}

function normalizeAmount(record: RawRecord): number {
  return Number(
    record.Amount ||
      record.amount ||
      record.Cost ||
      record.cost ||
      record.Payment ||
      record.payment ||
      0,
  );
}

export function normalizeRecords(
  records: RawRecord[],

  sourceType: "csv" | "pdf" | "excel",
): FinancialRecord[] {
  return records.map((record) => {
    const vendor = normalizeVendor(record);

    const amount = normalizeAmount(record);

    const combinedText = JSON.stringify(record);

    const currency = detectCurrency(combinedText);

    return {
      vendor,

      amount,

      currency,

      category: "Unknown",

      billingModel: "Unknown",

      sourceType,

      date: String(record.Date || record.date || ""),
    };
  });
}
