import { FinancialRecord } from "../extractors/normalize";

import { SubscriptionSignal } from "../extractors/subscription";

export type SpendAnalytics = {
  totalSpend: number;

  currencyBreakdown: Record<string, number>;

  vendorBreakdown: Record<string, number>;

  recurringSpend: number;

  categoryBreakdown: Record<string, number>;
};

export function generateSpendAnalytics(
  records: FinancialRecord[],

  subscriptionSignals: SubscriptionSignal[],
): SpendAnalytics {
  let totalSpend = 0;

  let recurringSpend = 0;

  const currencyBreakdown: Record<string, number> = {};

  const vendorBreakdown: Record<string, number> = {};

  const categoryBreakdown: Record<string, number> = {};

  for (const record of records) {
    totalSpend += record.amount;

    currencyBreakdown[record.currency] =
      (currencyBreakdown[record.currency] || 0) + record.amount;

    vendorBreakdown[record.vendor] =
      (vendorBreakdown[record.vendor] || 0) + record.amount;

    categoryBreakdown[record.category] =
      (categoryBreakdown[record.category] || 0) + record.amount;
  }

  for (const signal of subscriptionSignals) {
    if (signal.recurringLikelihood === "High") {
      recurringSpend += signal.amount;
    }
  }

  return {
    totalSpend,

    currencyBreakdown,

    vendorBreakdown,

    recurringSpend,

    categoryBreakdown,
  };
}
