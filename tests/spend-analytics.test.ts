import { describe, expect, it } from "vitest";

import {
  AnalyticsFinancialRecord,
  generateSpendAnalytics,
} from "../src/lib/analytics/spend";
import type { FinancialRecord } from "../src/lib/ingestion/types";
import type { SubscriptionSignal } from "../src/lib/extractors/subscription";

const baseRecord: FinancialRecord = {
  vendor: "OpenAI",
  amount: 100,
  currency: "USD",
  category: "AI",
  billingModel: "Unknown",
  sourceType: "csv",
  date: "2024-01-15",
};

describe("spend analytics", () => {
  it("summarizes evidence coverage from ingestion batch lineage", () => {
    const records: AnalyticsFinancialRecord[] = [
      {
        ...baseRecord,
        ingestionBatchId: "batch-a",
      },
      {
        ...baseRecord,
        vendor: "Slack",
        amount: 50,
        category: "Communication",
        ingestionBatchId: "batch-a",
      },
      {
        ...baseRecord,
        vendor: "Legacy Vendor",
        amount: 25,
        category: "Unknown",
      },
    ];

    const signals: SubscriptionSignal[] = [];

    const analytics = generateSpendAnalytics(records, signals);

    expect(analytics.evidenceSummary).toEqual({
      recordCount: 3,
      tracedRecordCount: 2,
      untracedRecordCount: 1,
      sourceBatchCount: 1,
    });
  });
});
