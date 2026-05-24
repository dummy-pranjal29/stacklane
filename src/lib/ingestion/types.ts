export interface FinancialRecord {
  vendor: string;
  amount: number;

  currency?: string;
  category?: string;
  date?: string;

  sourceType: "csv" | "pdf" | "excel";
}
