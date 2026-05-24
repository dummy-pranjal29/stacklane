export interface ParsedExcelSheet {
  sheetName: string;

  data: Record<string, unknown>[];
}
