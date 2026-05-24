import { detectFileType } from "./detectFileType";
import { normalizeCSVRow } from "./normalize";
import { parsePDF } from "../parsers/pdf";
import { parseExcel } from "../parsers/excel";

import { parseCSV } from "../parsers/csv";

export async function parseFile(file: File) {
  const fileType = detectFileType(file.name);

  switch (fileType) {
    case "csv": {
      const text = await file.text();

      const rows = await parseCSV(text);

      return rows.map((row: Record<string, string>) =>
        normalizeCSVRow({ row }),
      );
    }

    case "pdf": {
      const arrayBuffer = await file.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      return parsePDF(buffer);
    }

    case "excel": {
      const arrayBuffer = await file.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      return parseExcel(buffer);
    }

    default:
      throw new Error("Unsupported file type");
  }
}
