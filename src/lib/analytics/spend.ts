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

    parserConfidenceBreakdown: {
      high: number;

      medium: number;

      low: number;

      unknown: number;
    };
  };
};

export function generateSpendAnalytics(
  records: AnalyticsFinancialRecord[],

  subscriptionSignals: SubscriptionSignal[],

  parserConfidenceMap: Record<string, "high" | "medium" | "low"> = {},
): SpendAnalytics {
  let totalSpend = 0;

  let recurringSpend = 0;

  const currencyBreakdown: Record<string, number> = {};

  const vendorBreakdown: Record<string, number> = {};

  const categoryBreakdown: Record<string, number> = {};

  const sourceBatchIds = new Set<string>();

  let tracedRecordCount = 0;

  const confidenceBreakdown = { high: 0, medium: 0, low: 0, unknown: 0 };

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

      const confidence = parserConfidenceMap[record.ingestionBatchId];

      if (confidence) {
        confidenceBreakdown[confidence] += 1;
      } else {
        confidenceBreakdown.unknown += 1;
      }
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

      parserConfidenceBreakdown: confidenceBreakdown,
    },
  };
}
