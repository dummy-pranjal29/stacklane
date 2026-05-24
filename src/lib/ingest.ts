import FinancialRecord from "../models/FinancialRecord";
import { extractPDFInvoice } from "./extractors/pdfInvoice";
import SubscriptionSignalModel from "../models/SubscriptionSignal";

import { parseFile } from "./ingestion/parseFile";

import {
  normalizeRecords,
  FinancialRecord as NormalizedFinancialRecord,
} from "./extractors/normalize";

import { extractSubscriptionSignals } from "./extractors/subscription";

type IngestResult = {
  normalizedRecords: NormalizedFinancialRecord[];

  subscriptionSignals: ReturnType<typeof extractSubscriptionSignals>;
};

type RawRecord = Record<string, unknown>;

export async function ingestFile(
  file: File,

  userId: string,
): Promise<IngestResult> {
  try {
    const parsed = await parseFile(file);

    let rawRecords: RawRecord[];

    switch (parsed.type) {
      case "csv":
        rawRecords = parsed.data;
        break;

      case "excel":
        rawRecords = parsed.data.flatMap((sheet) => sheet.data);
        break;

      case "pdf":
        rawRecords = [extractPDFInvoice(parsed.data)];
        break;
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
