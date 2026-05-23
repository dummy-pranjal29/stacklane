import { NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import FinancialRecord from "../../../models/FinancialRecord";

import { connectDB } from "../../../lib/db";

import { generateSpendAnalytics } from "../../../lib/analytics/spend";

import { extractSubscriptionSignals } from "../../../lib/extractors/subscription";

export async function GET(request: Request) {
  try {
    await connectDB();

    const cookieHeader = request.headers.get("cookie");

    const token = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

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
    }));

    const subscriptionSignals = extractSubscriptionSignals(normalizedRecords);

    const analytics = generateSpendAnalytics(
      normalizedRecords,

      subscriptionSignals,
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
