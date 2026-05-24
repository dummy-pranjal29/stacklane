import { parse } from "csv-parse/sync";

export async function parseCSV(
  csvText: string,
): Promise<Record<string, string>[]> {
  try {
    const records: Record<string, string>[] = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    });

    if (!Array.isArray(records) || records.length === 0) {
      console.warn("CSV parsing resulted in empty records");
    }

    return records;
  } catch (error) {
    console.error("CSV parse error:", error);
    throw new Error(
      `CSV parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
