import FinancialRecord from "../models/FinancialRecord";

import { parseFile } from "./parsers";

import {
  normalizeRecords,
  FinancialRecord as NormalizedFinancialRecord,
} from "./extractors/normalize";

import { extractSubscriptionSignals } from "./extractors/subscription";

type IngestResult = {
  normalizedRecords: NormalizedFinancialRecord[];

  subscriptionSignals: ReturnType<typeof extractSubscriptionSignals>;
};

export async function ingestFile(
  file: File,

  userId: string,
): Promise<IngestResult> {
  const parsed = await parseFile(file);

  let rawRecords: Record<string, unknown>[] = [];

  if (parsed.type === "csv") {
    rawRecords = parsed.data as Record<string, unknown>[];
  }

  if (parsed.type === "excel") {
    const sheets = parsed.data as {
      sheetName: string;

      data: Record<string, unknown>[];
    }[];

    rawRecords = sheets.flatMap((sheet) => sheet.data);
  }

  if (parsed.type === "pdf") {
    rawRecords = [
      {
        Vendor: "Unknown Vendor",

        Amount: 0,

        Text: parsed.data,
      },
    ];
  }

  const normalizedRecords = normalizeRecords(rawRecords, parsed.type);

  const subscriptionSignals = extractSubscriptionSignals(normalizedRecords);

  await FinancialRecord.insertMany(
    normalizedRecords.map((record) => ({
      userId,

      vendor: record.vendor,

      amount: record.amount,

      currency: record.currency,

      category: record.category,

      billingModel: record.billingModel,

      sourceType: record.sourceType,

      date: record.date,
    })),
  );

  return {
    normalizedRecords,

    subscriptionSignals,
  };
}
