import { NextRequest, NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import { connectDB } from "../../../lib/db";

import IngestionBatch from "../../../models/IngestionBatch";

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

    const batches = await IngestionBatch.find({
      userId: decoded.userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,

      batches: batches.map((batch) => ({
        id: String(batch._id),

        fileName: batch.fileName,

        fileType: batch.fileType,

        fileSize: batch.fileSize,

        parserType: batch.parserType,

        status: batch.status,

        totalRecordCount: batch.totalRecordCount,

        acceptedRecordCount: batch.acceptedRecordCount,

        rejectedRecordCount: batch.rejectedRecordCount,

        subscriptionSignalCount: batch.subscriptionSignalCount,

        durationMs: batch.durationMs,

        errorMessage: batch.errorMessage,

        createdAt: batch.createdAt,
      })),
    });
  } catch (error) {
    console.error("INGESTION BATCHES API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load ingestion batches",
      },

      {
        status: 500,
      },
    );
  }
}
