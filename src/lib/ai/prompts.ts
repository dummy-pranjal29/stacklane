type AnalyticsInput = {
  totalSpend: number;

  recurringSpend: number;

  currencyBreakdown: Record<string, number>;

  vendorBreakdown: Record<string, number>;

  categoryBreakdown: Record<string, number>;
};

export function buildSpendAnalysisPrompt(analytics: AnalyticsInput) {
  return `
You are a senior financial intelligence analyst.

Analyze the following SaaS and operational spending data.

Provide:
- key financial observations
- vendor concentration risks
- recurring spend risks
- optimization opportunities
- infrastructure overspending signals
- unusual spending patterns

Analytics Data:
${JSON.stringify(analytics, null, 2)}

Respond in concise executive language.
`;
}
