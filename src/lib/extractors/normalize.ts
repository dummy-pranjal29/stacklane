import { vendorPolicies } from "../policies/vendors";
import type {
  FinancialRecord,
  SupportedCurrency,
  SupportedFileType,
} from "../ingestion/types";

export type { FinancialRecord } from "../ingestion/types";

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
function resolveVendorPolicy(vendor: string) {
  const lower = vendor.toLowerCase();

  return vendorPolicies.find((policy) =>
    policy.aliases.some((alias) => lower.includes(alias)),
  );
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

  sourceType: SupportedFileType,
): FinancialRecord[] {
  return records.map((record) => {
    const vendor = normalizeVendor(record);

    const amount = normalizeAmount(record);

    const combinedText = JSON.stringify(record);

    const currency = detectCurrency(combinedText);

    const vendorPolicy = resolveVendorPolicy(vendor);

    return {
      vendor: vendorPolicy?.canonicalName || vendor,

      amount,

      currency,

      category: vendorPolicy?.category || "Unknown",

      billingModel: "Unknown",

      sourceType,

      date: String(record.Date || record.date || ""),
    };
  });
}
