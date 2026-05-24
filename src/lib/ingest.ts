import FinancialRecord from "../models/FinancialRecord";
import IngestionBatch from "../models/IngestionBatch";
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
  ingestionBatch: {
    id: string;

    status: "completed";

    totalRecordCount: number;

    acceptedRecordCount: number;

    rejectedRecordCount: number;

    subscriptionSignalCount: number;

    durationMs: number;
  };

  normalizedRecords: NormalizedFinancialRecord[];

  rejectedRecords: RejectedFinancialRecord[];

  subscriptionSignals: ReturnType<typeof extractSubscriptionSignals>;
};

type RawRecord = Record<string, unknown>;

export async function ingestFile(
  file: File,

  userId: string,
): Promise<IngestResult> {
  const startedAt = Date.now();
  const batch = await IngestionBatch.create({
    userId,

    fileName: file.name,

    fileType: file.type || "unknown",

    fileSize: file.size,

    status: "processing",
  });

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
    const financialRecordIds = [];
    const subscriptionSignalIds = [];

    if (acceptedRecords.length > 0) {
      const insertedRecords = await FinancialRecord.insertMany(
        acceptedRecords.map((record) => ({
          userId,

          ingestionBatchId: batch._id,

          vendor: record.vendor,

          amount: record.amount,

          currency: record.currency,

          category: record.category,

          billingModel: record.billingModel,

          sourceType: record.sourceType,

          date: record.date,
        })),
      );

      financialRecordIds.push(
        ...insertedRecords.map((record) => record._id),
      );
    }

    if (subscriptionSignals.length > 0) {
      const insertedSignals = await SubscriptionSignalModel.insertMany(
        subscriptionSignals.map((signal) => ({
          userId,

          ingestionBatchId: batch._id,

          vendor: signal.vendor,

          billingModel: signal.billingModel,

          recurringLikelihood: signal.recurringLikelihood,

          amount: signal.amount,

          currency: signal.currency,

          date: signal.date,
        })),
      );

      subscriptionSignalIds.push(
        ...insertedSignals.map((signal) => signal._id),
      );
    }

    const durationMs = Date.now() - startedAt;

    await IngestionBatch.updateOne(
      {
        _id: batch._id,
      },
      {
        $set: {
          parserType: parsed.type,

          status: "completed",

          totalRecordCount: normalizedRecords.length,

          acceptedRecordCount: acceptedRecords.length,

          rejectedRecordCount: rejectedRecords.length,

          subscriptionSignalCount: subscriptionSignals.length,

          durationMs,

          rejectedRecords: rejectedRecords.map((rejection) => ({
            reason: rejection.reason,

            record: rejection.record,
          })),

          financialRecordIds,

          subscriptionSignalIds,
        },
      },
    );

    return {
      ingestionBatch: {
        id: String(batch._id),

        status: "completed",

        totalRecordCount: normalizedRecords.length,

        acceptedRecordCount: acceptedRecords.length,

        rejectedRecordCount: rejectedRecords.length,

        subscriptionSignalCount: subscriptionSignals.length,

        durationMs,
      },

      normalizedRecords,

      rejectedRecords,

      subscriptionSignals,
    };
  } catch (error) {
    await IngestionBatch.updateOne(
      {
        _id: batch._id,
      },
      {
        $set: {
          status: "failed",

          durationMs: Date.now() - startedAt,

          errorMessage:
            error instanceof Error ? error.message : "Unknown ingestion error",
        },
      },
    );

    console.error("Ingest file error:", error);
    throw error;
  }
}
