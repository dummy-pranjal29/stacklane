import { NextRequest, NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import { connectDB } from "../../../lib/db";

import { ingestFile } from "../../../lib/ingest";

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file uploaded",
        },

        {
          status: 400,
        },
      );
    }

    const result = await ingestFile(
      file,

      decoded.userId,
    );

    return NextResponse.json({
      success: true,

      normalizedRecords: result.normalizedRecords,

      subscriptionSignals: result.subscriptionSignals,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Upload error:", errorMessage, error);

    return NextResponse.json(
      {
        error: "Upload ingestion failed",
        details: errorMessage,
      },

      {
        status: 500,
      },
    );
  }
}
