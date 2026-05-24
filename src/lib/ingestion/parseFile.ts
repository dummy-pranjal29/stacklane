import { detectFileType } from "./detectFileType";
import type { ParsedFileResult } from "./types";
import { parsePDF } from "../parsers/pdf";
import { parseExcel } from "../parsers/excel";

import { parseCSV } from "../parsers/csv";

export async function parseFile(file: File): Promise<ParsedFileResult> {
  const fileType = detectFileType(file.name);

  switch (fileType) {
    case "csv": {
      const text = await file.text();

      const rows = await parseCSV(text);

      return {
        type: "csv",
        data: rows,
      };
    }

    case "pdf": {
      const arrayBuffer = await file.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      const text = await parsePDF(buffer);

      return {
        type: "pdf",
        data: text,
      };
    }

    case "excel": {
      const arrayBuffer = await file.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      const sheets = parseExcel(buffer);

      return {
        type: "excel",
        data: sheets,
      };
    }

    default:
      throw new Error("Unsupported file type");
  }
}
