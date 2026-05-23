import { SubscriptionSignal } from "../extractors/subscription";

export type SubscriptionPolicyResult = {
  optimizationPriority: "High" | "Medium" | "Low";

  explanation: string;
};

export function evaluateSubscriptionPolicy(
  signal: SubscriptionSignal,
): SubscriptionPolicyResult {
  if (signal.recurringLikelihood === "High" && signal.amount > 1000) {
    return {
      optimizationPriority: "High",

      explanation:
        "High-confidence recurring spend with significant financial impact.",
    };
  }

  if (signal.recurringLikelihood === "Medium") {
    return {
      optimizationPriority: "Medium",

      explanation:
        "Potential recurring billing pattern detected requiring review.",
    };
  }

  return {
    optimizationPriority: "Low",

    explanation: "No strong recurring financial optimization signal detected.",
  };
}
