import { parseCSV } from "./csv";
import { parsePDF } from "./pdf";
import { parseExcel } from "./excel";

type ParsedFileResult =
  | {
      type: "csv";
      data: unknown;
    }
  | {
      type: "pdf";
      data: string;
    }
  | {
      type: "excel";
      data: unknown;
    };

export async function parseFile(file: File): Promise<ParsedFileResult> {
  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  const fileType = file.type;

  if (fileType === "text/csv") {
    const csvText = buffer.toString("utf-8");

    const records = parseCSV(csvText);

    return {
      type: "csv",
      data: records,
    };
  }

  if (fileType === "application/pdf") {
    const text = await parsePDF(buffer);

    return {
      type: "pdf",
      data: text,
    };
  }

  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileType === "application/vnd.ms-excel"
  ) {
    const sheets = parseExcel(buffer);

    return {
      type: "excel",
      data: sheets,
    };
  }

  throw new Error("Unsupported file type");
}
