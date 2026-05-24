import { describe, expect, it } from "vitest";

import { buildSpendAnalysisPrompt } from "../src/lib/ai/prompts";

describe("AI spend analysis prompt", () => {
  it("requires evidence-bounded analysis from deterministic metrics", () => {
    const prompt = buildSpendAnalysisPrompt({
      totalSpend: 100,
      recurringSpend: 20,
      currencyBreakdown: {
        USD: 100,
      },
      vendorBreakdown: {
        OpenAI: 100,
      },
      categoryBreakdown: {
        AI: 100,
      },
      evidenceSummary: {
        recordCount: 1,
        tracedRecordCount: 1,
        untracedRecordCount: 0,
        sourceBatchCount: 1,
      },
    });

    expect(prompt).toContain("Use only the Analytics Data below.");
    expect(prompt).toContain("Do not invent causes, savings, anomalies");
    expect(prompt).toContain("Evidence limits");
    expect(prompt).toContain('"totalSpend": 100');
  });
});
