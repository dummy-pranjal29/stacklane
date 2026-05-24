type AnalyticsInput = {
  totalSpend: number;

  recurringSpend: number;

  currencyBreakdown: Record<string, number>;

  vendorBreakdown: Record<string, number>;

  categoryBreakdown: Record<string, number>;

  evidenceSummary: {
    recordCount: number;

    tracedRecordCount: number;

    untracedRecordCount: number;

    sourceBatchCount: number;
  };
};

export function buildSpendAnalysisPrompt(analytics: AnalyticsInput) {
  return `
You are analyzing already-computed financial metrics.

Rules:
- Use only the Analytics Data below.
- Do not invent causes, savings, anomalies, vendors, categories, or recommendations.
- If a conclusion is not directly supported by the metrics, say the evidence is insufficient.
- Treat category "Unknown" and currency "UNKNOWN" as explicit uncertainty, not as insight.
- Prefer concise observations with the metric that supports each observation.

Provide:
- verified spend observations
- vendor or category concentration only when visible in the metrics
- recurring spend context only from the recurringSpend metric
- data quality limitations that affect confidence
- no optimization recommendations unless the metrics directly prove them

Analytics Data:
${JSON.stringify(analytics, null, 2)}

Respond in concise executive language. Include a short "Evidence limits" section.
`;
}
