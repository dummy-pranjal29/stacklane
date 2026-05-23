export type VendorPolicy = {
  canonicalName: string;

  aliases: string[];

  category:
    | "AI"
    | "Communication"
    | "Infrastructure"
    | "Finance"
    | "Productivity";

  recurringLikely: boolean;
};

export const vendorPolicies: VendorPolicy[] = [
  {
    canonicalName: "OpenAI",

    aliases: ["openai", "chatgpt"],

    category: "AI",

    recurringLikely: true,
  },

  {
    canonicalName: "Anthropic",

    aliases: ["anthropic"],

    category: "AI",

    recurringLikely: true,
  },

  {
    canonicalName: "Slack",

    aliases: ["slack"],

    category: "Communication",

    recurringLikely: true,
  },

  {
    canonicalName: "Amazon Web Services",

    aliases: ["aws", "amazon web services"],

    category: "Infrastructure",

    recurringLikely: true,
  },

  {
    canonicalName: "Vercel",

    aliases: ["vercel"],

    category: "Infrastructure",

    recurringLikely: true,
  },

  {
    canonicalName: "Notion",

    aliases: ["notion"],

    category: "Productivity",

    recurringLikely: true,
  },

  {
    canonicalName: "Stripe",

    aliases: ["stripe"],

    category: "Finance",

    recurringLikely: true,
  },
];
