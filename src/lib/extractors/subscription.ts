import { FinancialRecord } from "./normalize";

export type SubscriptionSignal = {
  vendor: string;

  billingModel: "License-Based" | "Consumption-Based" | "Unknown";

  recurringLikelihood: "High" | "Medium" | "Low";

  amount: number;

  currency: string;

  date?: string;
};

function detectRecurringSignals(
  text: string,
): SubscriptionSignal["recurringLikelihood"] {
  const lower = text.toLowerCase();

  const highConfidenceTerms = [
    "subscription",
    "monthly",
    "annual",
    "yearly",
    "renewal",
    "license",
    "plan",
  ];

  const mediumConfidenceTerms = ["billing", "usage", "workspace", "seat"];

  if (highConfidenceTerms.some((term) => lower.includes(term))) {
    return "High";
  }

  if (mediumConfidenceTerms.some((term) => lower.includes(term))) {
    return "Medium";
  }

  return "Low";
}

function detectBillingModel(text: string): SubscriptionSignal["billingModel"] {
  const lower = text.toLowerCase();

  if (
    lower.includes("usage") ||
    lower.includes("api") ||
    lower.includes("tokens")
  ) {
    return "Consumption-Based";
  }

  if (
    lower.includes("seat") ||
    lower.includes("license") ||
    lower.includes("subscription") ||
    lower.includes("plan")
  ) {
    return "License-Based";
  }

  return "Unknown";
}

export function extractSubscriptionSignals(
  records: FinancialRecord[],
): SubscriptionSignal[] {
  return records.map((record) => {
    const searchableText = JSON.stringify(record);

    const recurringLikelihood = detectRecurringSignals(searchableText);

    const billingModel = detectBillingModel(searchableText);

    return {
      vendor: record.vendor,

      billingModel,

      recurringLikelihood,

      amount: record.amount,

      currency: record.currency,

      date: record.date,
    };
  });
}
