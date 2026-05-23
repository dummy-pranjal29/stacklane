import { NextResponse } from "next/server";
import { parseCSV } from "../../../lib/parsers/csv";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No valid file uploaded",
        },
        {
          status: 400,
        },
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const csvText = buffer.toString("utf-8");

    const records = parseCSV(csvText);

    console.log("Parsed Records:", records);

    console.log("Received File:", file);

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Upload Error:", error);

    return NextResponse.json(
      {
        error: "Upload failed",
      },
      {
        status: 500,
      },
    );
  }
}
