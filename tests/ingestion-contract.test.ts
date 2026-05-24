import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseFile } from "../src/lib/ingestion/parseFile";
import { normalizeRecords } from "../src/lib/extractors/normalize";

describe("ingestion contract", () => {
  it("parses CSV into raw rows and leaves normalization downstream", async () => {
    const csv = await readFile(join(process.cwd(), "tests", "test.csv"));
    const file = new File([csv], "test.csv", {
      type: "text/csv",
    });

    const parsed = await parseFile(file);

    expect(parsed.type).toBe("csv");

    if (parsed.type !== "csv") {
      throw new Error("Expected CSV parse result");
    }

    expect(parsed.data[0]).toEqual({
      Vendor: "AWS",
      Amount: "500.00",
      Currency: "USD",
      Category: "Infrastructure",
      Date: "2024-01-15",
    });
  });

  it("normalizes parsed CSV rows through the canonical financial record contract", async () => {
    const csv = await readFile(join(process.cwd(), "tests", "test.csv"));
    const file = new File([csv], "test.csv", {
      type: "text/csv",
    });

    const parsed = await parseFile(file);

    if (parsed.type !== "csv") {
      throw new Error("Expected CSV parse result");
    }

    const records = normalizeRecords(parsed.data, parsed.type);

    expect(records[0]).toEqual({
      vendor: "Amazon Web Services",
      amount: 500,
      currency: "USD",
      category: "Infrastructure",
      billingModel: "Unknown",
      sourceType: "csv",
      date: "2024-01-15",
    });
  });
});
