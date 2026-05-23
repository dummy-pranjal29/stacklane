import { NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import { connectDB } from "../../../lib/db";

import { ingestFile } from "../../../lib/ingest";

export async function POST(request: Request) {
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
    console.error(error);

    return NextResponse.json(
      {
        error: "Upload ingestion failed",
      },

      {
        status: 500,
      },
    );
  }
}
