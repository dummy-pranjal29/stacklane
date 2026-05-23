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
  const fileName = file.name.toLowerCase();

  if (fileType === "text/csv" || fileName.endsWith(".csv")) {
    try {
      const csvText = buffer.toString("utf-8");
      const records = parseCSV(csvText);
      return {
        type: "csv",
        data: records,
      };
    } catch (error) {
      console.error("CSV parsing error:", error);
      throw new Error(
        `Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    try {
      const text = await parsePDF(buffer);
      return {
        type: "pdf",
        data: text,
      };
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error(
        `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileType === "application/vnd.ms-excel" ||
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls")
  ) {
    try {
      const sheets = parseExcel(buffer);
      return {
        type: "excel",
        data: sheets,
      };
    } catch (error) {
      console.error("Excel parsing error:", error);
      throw new Error(
        `Failed to parse Excel: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  throw new Error(
    `Unsupported file type: ${fileType || fileName}. Supported types: CSV, PDF, XLSX, XLS`,
  );
}
