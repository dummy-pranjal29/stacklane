import type { ParsedExcelSheet } from "./types/excel";

export type SupportedFileType = "csv" | "pdf" | "excel";

export type SupportedCurrency = "USD" | "INR" | "UNKNOWN";

export type SpendCategory =
  | "AI"
  | "Communication"
  | "Infrastructure"
  | "Finance"
  | "Productivity"
  | "Unknown";

export type BillingModel = "License-Based" | "Consumption-Based" | "Unknown";

export type FinancialRecord = {
  vendor: string;

  amount: number;

  currency: SupportedCurrency;

  category: SpendCategory;

  billingModel: BillingModel;

  date?: string;

  sourceType: SupportedFileType;
};

export type ParsedFileResult =
  | {
      type: "csv";
      data: Record<string, string>[];
    }
  | {
      type: "pdf";
      data: string;
    }
  | {
      type: "excel";
      data: ParsedExcelSheet[];
    };
