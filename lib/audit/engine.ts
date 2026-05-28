export const TOOLS_CONFIG = {
  cursor: {
    name: "Cursor",
    plans: {
      hobby: { name: "Hobby", monthlyPrice: 0, seats: 1 },
      pro: { name: "Pro", monthlyPrice: 20, seats: 1 },
      business: { name: "Business", monthlyPrice: 40, seats: 1 },
      enterprise: { name: "Enterprise", monthlyPrice: null, seats: null },
    },
  },
  github_copilot: {
    name: "GitHub Copilot",
    plans: {
      individual: { name: "Individual", monthlyPrice: 10, seats: 1 },
      business: { name: "Business", monthlyPrice: 19, seats: null },
      enterprise: { name: "Enterprise", monthlyPrice: null, seats: null },
    },
  },
  claude: {
    name: "Claude",
    plans: {
      free: { name: "Free", monthlyPrice: 0, seats: 1 },
      pro: { name: "Pro", monthlyPrice: 20, seats: 1 },
      team: { name: "Team", monthlyPrice: 30, seats: null },
      enterprise: { name: "Enterprise", monthlyPrice: null, seats: null },
      api: { name: "API Direct", monthlyPrice: "usage-based", seats: null },
    },
  },
  chatgpt: {
    name: "ChatGPT",
    plans: {
      plus: { name: "Plus", monthlyPrice: 20, seats: 1 },
      team: { name: "Team", monthlyPrice: 25, seats: null },
      enterprise: { name: "Enterprise", monthlyPrice: null, seats: null },
      api: { name: "API Direct", monthlyPrice: "usage-based", seats: null },
    },
  },
  openai_api: {
    name: "OpenAI API Direct",
    plans: {
      gpt4omini: {
        name: "GPT-4o mini",
        monthlyPrice: "usage-based",
        seats: null,
      },
      gpt4o: { name: "GPT-4o", monthlyPrice: "usage-based", seats: null },
    },
  },
  anthropic_api: {
    name: "Anthropic API Direct",
    plans: {
      sonnet: {
        name: "Claude 3.5 Sonnet",
        monthlyPrice: "usage-based",
        seats: null,
      },
      haiku: {
        name: "Claude 3.5 Haiku",
        monthlyPrice: "usage-based",
        seats: null,
      },
    },
  },
  gemini: {
    name: "Google Gemini",
    plans: {
      pro: { name: "Pro", monthlyPrice: 20, seats: 1 },
      ultra: { name: "Ultra", monthlyPrice: 20, seats: 1 },
      api: { name: "API", monthlyPrice: "usage-based", seats: null },
    },
  },
  windsurf: {
    name: "Windsurf",
    plans: {
      free: { name: "Free", monthlyPrice: 0, seats: 1 },
      pro: { name: "Pro", monthlyPrice: 10, seats: 1 },
      business: { name: "Business", monthlyPrice: 25, seats: 1 },
    },
  },
};

export type ToolType = keyof typeof TOOLS_CONFIG;
export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface SpendInput {
  toolId: ToolType;
  plan: string;
  currentMonthlySpend: number;
  seats: number;
  teamSize: number;
}

export interface AuditRecommendation {
  toolId: ToolType;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  potentialMonthlySavings: number;
  reasoning: string;
  isAlreadyOptimal: boolean;
}

export function calculateAudit(
  inputs: SpendInput[],
  teamSize: number,
  useCase: UseCase,
): {
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
} {
  const recommendations: AuditRecommendation[] = [];

  for (const input of inputs) {
    const tool = TOOLS_CONFIG[input.toolId];
    const recommendation = evaluateTool(input, tool, teamSize, useCase);
    recommendations.push(recommendation);
  }

  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.potentialMonthlySavings,
    0,
  );

  return {
    recommendations,
    totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    totalAnnualSavings: Math.round(totalMonthlySavings * 12 * 100) / 100,
  };
}

function evaluateTool(
  input: SpendInput,
  tool: (typeof TOOLS_CONFIG)[ToolType],
  teamSize: number,
  useCase: UseCase,
): AuditRecommendation {
  let recommendation: AuditRecommendation = {
    toolId: input.toolId,
    toolName: tool.name,
    currentPlan: input.plan,
    currentSpend: input.currentMonthlySpend,
    recommendedAction: "Keep current plan",
    potentialMonthlySavings: 0,
    reasoning: "",
    isAlreadyOptimal: true,
  };

  // Evaluate based on tool and plan
  if (input.toolId === "cursor") {
    recommendation = evaluateCursor(input, teamSize, useCase);
  } else if (input.toolId === "github_copilot") {
    recommendation = evaluateGitHubCopilot(input, teamSize, useCase);
  } else if (input.toolId === "claude") {
    recommendation = evaluateClaude(input, teamSize, useCase);
  } else if (input.toolId === "chatgpt") {
    recommendation = evaluateChatGPT(input, teamSize, useCase);
  } else if (input.toolId === "gemini") {
    recommendation = evaluateGemini(input, teamSize, useCase);
  } else if (input.toolId === "windsurf") {
    recommendation = evaluateWindsurf(input, teamSize, useCase);
  }

  return recommendation;
}

function evaluateCursor(
  input: SpendInput,
  teamSize: number,
  useCase: UseCase,
): AuditRecommendation {
  const recommendation: AuditRecommendation = {
    toolId: "cursor",
    toolName: "Cursor",
    currentPlan: input.plan,
    currentSpend: input.currentMonthlySpend,
    recommendedAction: "Keep current plan",
    potentialMonthlySavings: 0,
    reasoning: "",
    isAlreadyOptimal: true,
  };

  if (input.plan === "pro" && input.seats > 5) {
    recommendation.recommendedAction =
      "Switch to Business plan or negotiate volume";
    recommendation.potentialMonthlySavings = input.seats * (20 - 40);
    recommendation.reasoning =
      "Business plan ($40/seat) offers better value for larger teams over Pro ($20/seat).";
    recommendation.isAlreadyOptimal = false;
  }

  return recommendation;
}

function evaluateGitHubCopilot(
  input: SpendInput,
  teamSize: number,
  useCase: UseCase,
): AuditRecommendation {
  const recommendation: AuditRecommendation = {
    toolId: "github_copilot",
    toolName: "GitHub Copilot",
    currentPlan: input.plan,
    currentSpend: input.currentMonthlySpend,
    recommendedAction: "Keep current plan",
    potentialMonthlySavings: 0,
    reasoning: "",
    isAlreadyOptimal: true,
  };

  if (input.plan === "individual" && input.seats > 1) {
    const businessCost = input.seats * 19;
    if (businessCost < input.currentMonthlySpend) {
      recommendation.recommendedAction = "Switch to Business plan";
      recommendation.potentialMonthlySavings =
        input.currentMonthlySpend - businessCost;
      recommendation.reasoning = `Business plan ($19/user) is cheaper per seat than Individual ($10/month).`;
      recommendation.isAlreadyOptimal = false;
    }
  }

  return recommendation;
}

function evaluateClaude(
  input: SpendInput,
  teamSize: number,
  useCase: UseCase,
): AuditRecommendation {
  const recommendation: AuditRecommendation = {
    toolId: "claude",
    toolName: "Claude",
    currentPlan: input.plan,
    currentSpend: input.currentMonthlySpend,
    recommendedAction: "Keep current plan",
    potentialMonthlySavings: 0,
    reasoning: "",
    isAlreadyOptimal: true,
  };

  if (input.plan === "pro" && input.seats > 3) {
    const teamCost = input.seats * 30;
    if (teamCost < input.currentMonthlySpend) {
      recommendation.recommendedAction = "Switch to Team plan";
      recommendation.potentialMonthlySavings =
        input.currentMonthlySpend - teamCost;
      recommendation.reasoning = `Team plan ($30/user) is more efficient for ${input.seats} users.`;
      recommendation.isAlreadyOptimal = false;
    }
  }

  return recommendation;
}

function evaluateChatGPT(
  input: SpendInput,
  teamSize: number,
  useCase: UseCase,
): AuditRecommendation {
  const recommendation: AuditRecommendation = {
    toolId: "chatgpt",
    toolName: "ChatGPT",
    currentPlan: input.plan,
    currentSpend: input.currentMonthlySpend,
    recommendedAction: "Keep current plan",
    potentialMonthlySavings: 0,
    reasoning: "",
    isAlreadyOptimal: true,
  };

  if (input.plan === "plus" && input.seats > 2) {
    const teamCost = input.seats * 25;
    if (teamCost < input.currentMonthlySpend) {
      recommendation.recommendedAction = "Switch to Team plan";
      recommendation.potentialMonthlySavings =
        input.currentMonthlySpend - teamCost;
      recommendation.reasoning = `Team plan ($25/user) provides better value for teams over Plus ($20/month individual).`;
      recommendation.isAlreadyOptimal = false;
    }
  }

  return recommendation;
}

function evaluateGemini(
  input: SpendInput,
  teamSize: number,
  useCase: UseCase,
): AuditRecommendation {
  return {
    toolId: "gemini",
    toolName: "Google Gemini",
    currentPlan: input.plan,
    currentSpend: input.currentMonthlySpend,
    recommendedAction: "Keep current plan",
    potentialMonthlySavings: 0,
    reasoning:
      "Gemini pricing is straightforward. Current plan appears optimal.",
    isAlreadyOptimal: true,
  };
}

function evaluateWindsurf(
  input: SpendInput,
  teamSize: number,
  useCase: UseCase,
): AuditRecommendation {
  const recommendation: AuditRecommendation = {
    toolId: "windsurf",
    toolName: "Windsurf",
    currentPlan: input.plan,
    currentSpend: input.currentMonthlySpend,
    recommendedAction: "Keep current plan",
    potentialMonthlySavings: 0,
    reasoning: "",
    isAlreadyOptimal: true,
  };

  if (input.plan === "pro" && input.seats > 3) {
    recommendation.recommendedAction = "Evaluate Business plan";
    recommendation.reasoning =
      "For teams larger than 3, Business plan ($25) per user may provide better features.";
  }

  return recommendation;
}
