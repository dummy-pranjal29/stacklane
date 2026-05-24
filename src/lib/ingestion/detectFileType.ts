export type SupportedFileType = "csv" | "pdf" | "excel";

export function detectFileType(filename: string): SupportedFileType {
  const lowerCaseName = filename.toLowerCase();

  if (lowerCaseName.endsWith(".csv")) {
    return "csv";
  }

  if (lowerCaseName.endsWith(".pdf")) {
    return "pdf";
  }

  if (lowerCaseName.endsWith(".xlsx") || lowerCaseName.endsWith(".xls")) {
    return "excel";
  }

  throw new Error("Unsupported file type");
}
