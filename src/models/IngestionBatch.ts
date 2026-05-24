import mongoose, { Schema, Document } from "mongoose";

export type IngestionBatchStatus = "processing" | "completed" | "failed";

export interface IIngestionBatch extends Document {
  userId: mongoose.Types.ObjectId;

  fileName: string;

  fileType: string;

  fileSize: number;

  parserType?: string;

  status: IngestionBatchStatus;

  totalRecordCount: number;

  acceptedRecordCount: number;

  rejectedRecordCount: number;

  subscriptionSignalCount: number;

  durationMs?: number;

  errorMessage?: string;

  rejectedRecords: {
    reason: string;

    record: Record<string, unknown>;
  }[];

  financialRecordIds: mongoose.Types.ObjectId[];

  subscriptionSignalIds: mongoose.Types.ObjectId[];
}

const IngestionBatchSchema = new Schema<IIngestionBatch>(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    fileName: {
      type: String,

      required: true,
    },

    fileType: {
      type: String,

      required: true,
    },

    fileSize: {
      type: Number,

      required: true,
    },

    parserType: {
      type: String,
    },

    status: {
      type: String,

      enum: ["processing", "completed", "failed"],

      required: true,

      default: "processing",
    },

    totalRecordCount: {
      type: Number,

      required: true,

      default: 0,
    },

    acceptedRecordCount: {
      type: Number,

      required: true,

      default: 0,
    },

    rejectedRecordCount: {
      type: Number,

      required: true,

      default: 0,
    },

    subscriptionSignalCount: {
      type: Number,

      required: true,

      default: 0,
    },

    durationMs: {
      type: Number,
    },

    errorMessage: {
      type: String,
    },

    rejectedRecords: [
      {
        reason: {
          type: String,

          required: true,
        },

        record: {
          type: Schema.Types.Mixed,

          required: true,
        },
      },
    ],

    financialRecordIds: [
      {
        type: Schema.Types.ObjectId,

        ref: "FinancialRecord",
      },
    ],

    subscriptionSignalIds: [
      {
        type: Schema.Types.ObjectId,

        ref: "SubscriptionSignal",
      },
    ],
  },

  {
    timestamps: true,
  },
);

export default mongoose.models.IngestionBatch ||
  mongoose.model<IIngestionBatch>("IngestionBatch", IngestionBatchSchema);
