import FinancialRecord from "../models/FinancialRecord";
import { extractPDFInvoice } from "./extractors/pdfInvoice";
import SubscriptionSignalModel from "../models/SubscriptionSignal";

import { parseFile } from "./ingestion/parseFile";

import {
  normalizeRecords,
  FinancialRecord as NormalizedFinancialRecord,
} from "./extractors/normalize";

import { extractSubscriptionSignals } from "./extractors/subscription";
import {
  partitionPersistableFinancialRecords,
} from "./ingestion/validateFinancialRecord";
import type { RejectedFinancialRecord } from "./ingestion/validateFinancialRecord";

type IngestResult = {
  normalizedRecords: NormalizedFinancialRecord[];

  rejectedRecords: RejectedFinancialRecord[];

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

    const { acceptedRecords, rejectedRecords } =
      partitionPersistableFinancialRecords(normalizedRecords);

    const subscriptionSignals = extractSubscriptionSignals(acceptedRecords);

    if (acceptedRecords.length > 0) {
      await FinancialRecord.insertMany(
        acceptedRecords.map((record) => ({
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
    }

    if (subscriptionSignals.length > 0) {
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
    }

    return {
      normalizedRecords,

      rejectedRecords,

      subscriptionSignals,
    };
  } catch (error) {
    console.error("Ingest file error:", error);
    throw error;
  }
}
