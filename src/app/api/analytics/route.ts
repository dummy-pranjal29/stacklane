import { NextRequest, NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import FinancialRecord from "../../../models/FinancialRecord";

import IngestionBatch from "../../../models/IngestionBatch";

import { connectDB } from "../../../lib/db";

import { generateSpendAnalytics } from "../../../lib/analytics/spend";

import { extractSubscriptionSignals } from "../../../lib/extractors/subscription";

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

    // Fetch ingestion batches to get parser confidence mapping
    const ingestionBatchIds = records
      .map((r) => r.ingestionBatchId)
      .filter(Boolean);

    const batches = await IngestionBatch.find(
      { _id: { $in: ingestionBatchIds } },
      { _id: 1, parserConfidence: 1 },
    ).lean();

    const parserConfidenceMap: Record<string, "high" | "medium" | "low"> = {};

    for (const batch of batches) {
      parserConfidenceMap[String(batch._id)] = batch.parserConfidence;
    }

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

      parserConfidenceMap,
    );

    return NextResponse.json({
      success: true,

      analytics,
    });
  } catch (error) {
    console.error("ANALYTICS API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate analytics",
      },

      {
        status: 500,
      },
    );
  }
}
