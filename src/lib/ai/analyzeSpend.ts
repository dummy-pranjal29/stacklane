import Groq from "groq-sdk";

import type { SpendAnalytics } from "../analytics/spend";

import { buildSpendAnalysisPrompt } from "./prompts";

export async function analyzeSpend(analytics: SpendAnalytics) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const prompt = buildSpendAnalysisPrompt(analytics);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",

        content: "You are an elite financial intelligence analyst.",
      },

      {
        role: "user",

        content: prompt,
      },
    ],

    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content || "No insights generated.";
}
