import { NextRequest, NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import FinancialRecord from "../../../models/FinancialRecord";

import { connectDB } from "../../../lib/db";

import { generateSpendAnalytics } from "../../../lib/analytics/spend";

import { extractSubscriptionSignals } from "../../../lib/extractors/subscription";

import { analyzeSpend } from "../../../lib/ai/analyzeSpend";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },

        {
          status: 401,
        },
      );
    }

    const decoded = jwt.verify(
      token,

      process.env.JWT_SECRET!,
    ) as {
      userId: string;
    };

    const records = await FinancialRecord.find({
      userId: decoded.userId,
    }).lean();

    const normalizedRecords = records.map((record) => ({
      vendor: record.vendor,

      amount: record.amount,

      currency: record.currency,

      category: record.category,

      billingModel: record.billingModel,

      sourceType: record.sourceType,

      date: record.date,

      ingestionBatchId: record.ingestionBatchId
        ? String(record.ingestionBatchId)
        : undefined,
    }));

    const subscriptionSignals = extractSubscriptionSignals(normalizedRecords);

    const analytics = generateSpendAnalytics(
      normalizedRecords,

      subscriptionSignals,
    );

    const insights = await analyzeSpend(analytics);

    return NextResponse.json({
      success: true,

      insights,
    });
  } catch (error) {
    console.error("AI INSIGHTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate AI insights",
      },

      {
        status: 500,
      },
    );
  }
}
