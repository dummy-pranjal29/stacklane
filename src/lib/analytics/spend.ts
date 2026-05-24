import { FinancialRecord } from "../extractors/normalize";

import { SubscriptionSignal } from "../extractors/subscription";

export type AnalyticsFinancialRecord = FinancialRecord & {
  ingestionBatchId?: string;
};

export type SpendAnalytics = {
  totalSpend: number;

  currencyBreakdown: Record<string, number>;

  vendorBreakdown: Record<string, number>;

  recurringSpend: number;

  categoryBreakdown: Record<string, number>;

  evidenceSummary: {
    recordCount: number;

    tracedRecordCount: number;

    untracedRecordCount: number;

    sourceBatchCount: number;
  };
};

export function generateSpendAnalytics(
  records: AnalyticsFinancialRecord[],

  subscriptionSignals: SubscriptionSignal[],
): SpendAnalytics {
  let totalSpend = 0;

  let recurringSpend = 0;

  const currencyBreakdown: Record<string, number> = {};

  const vendorBreakdown: Record<string, number> = {};

  const categoryBreakdown: Record<string, number> = {};

  const sourceBatchIds = new Set<string>();

  let tracedRecordCount = 0;

  for (const record of records) {
    totalSpend += record.amount;

    currencyBreakdown[record.currency] =
      (currencyBreakdown[record.currency] || 0) + record.amount;

    vendorBreakdown[record.vendor] =
      (vendorBreakdown[record.vendor] || 0) + record.amount;

    categoryBreakdown[record.category] =
      (categoryBreakdown[record.category] || 0) + record.amount;

    if (record.ingestionBatchId) {
      tracedRecordCount += 1;

      sourceBatchIds.add(record.ingestionBatchId);
    }
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

    evidenceSummary: {
      recordCount: records.length,

      tracedRecordCount,

      untracedRecordCount: records.length - tracedRecordCount,

      sourceBatchCount: sourceBatchIds.size,
    },
  };
}
