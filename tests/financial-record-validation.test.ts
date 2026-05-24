import { describe, expect, it } from "vitest";

import { partitionPersistableFinancialRecords } from "../src/lib/ingestion/validateFinancialRecord";
import type { FinancialRecord } from "../src/lib/ingestion/types";

const baseRecord: FinancialRecord = {
  vendor: "OpenAI",
  amount: 20,
  currency: "USD",
  category: "AI",
  billingModel: "Unknown",
  sourceType: "csv",
  date: "2024-01-15",
};

describe("financial record persistence validation", () => {
  it("accepts records with a reliable vendor and positive finite amount", () => {
    const result = partitionPersistableFinancialRecords([baseRecord]);

    expect(result.acceptedRecords).toEqual([baseRecord]);
    expect(result.rejectedRecords).toEqual([]);
  });

  it("rejects records that would create misleading spend evidence", () => {
    const missingVendor: FinancialRecord = {
      ...baseRecord,
      vendor: "Unknown Vendor",
    };

    const missingAmount: FinancialRecord = {
      ...baseRecord,
      amount: 0,
    };

    const result = partitionPersistableFinancialRecords([
      missingVendor,
      missingAmount,
    ]);

    expect(result.acceptedRecords).toEqual([]);
    expect(result.rejectedRecords).toEqual([
      {
        record: missingVendor,
        reason: "Missing reliable vendor",
      },
      {
        record: missingAmount,
        reason: "Missing positive amount",
      },
    ]);
  });
});
