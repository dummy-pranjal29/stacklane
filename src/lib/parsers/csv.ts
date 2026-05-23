import { parse } from "csv-parse/sync";

export function parseCSV(csvText: string) {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  return records;
}
