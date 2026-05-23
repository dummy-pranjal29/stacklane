import FinancialRecord from "../models/FinancialRecord";
import { extractPDFInvoice } from "./extractors/pdfInvoice";
import SubscriptionSignalModel from "../models/SubscriptionSignal";

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
  try {
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
      const extracted = extractPDFInvoice(parsed.data as string);

      rawRecords = [extracted];
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
    await SubscriptionSignalModel.insertMany(
      subscriptionSignals.map((signal) => ({
        userId,

        vendor: signal.vendor,

        billingModel: signal.billingModel,

        recurringLikelihood: signal.recurringLikelihood,

        amount: signal.amount,

        currency: signal.currency,

        date: signal.date,
      })),
    );

    return {
      normalizedRecords,

      subscriptionSignals,
    };
  } catch (error) {
    console.error("Ingest file error:", error);
    throw error;
  }
}
