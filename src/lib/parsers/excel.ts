import * as XLSX from "xlsx";
import { ParsedExcelSheet } from "../ingestion/types/excel";

export function parseExcel(buffer: Buffer): ParsedExcelSheet[] {
  try {
    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheetNames = workbook.SheetNames;

    if (!sheetNames || sheetNames.length === 0) {
      throw new Error("No sheets found in Excel file");
    }

    const parsedSheets = sheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        throw new Error(`Could not read sheet: ${sheetName}`);
      }

      const data: Record<string, unknown>[] =
        XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      return {
        sheetName,
        data,
      };
    });

    return parsedSheets;
  } catch (error) {
    console.error("Excel parse error:", error);
    throw new Error(
      `Excel parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
