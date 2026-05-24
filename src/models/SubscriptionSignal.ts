import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionSignal extends Document {
  userId: mongoose.Types.ObjectId;

  ingestionBatchId?: mongoose.Types.ObjectId;

  vendor: string;

  billingModel: string;

  recurringLikelihood: string;

  amount: number;

  currency: string;

  date?: string;
}

const SubscriptionSignalSchema = new Schema<ISubscriptionSignal>(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    ingestionBatchId: {
      type: Schema.Types.ObjectId,

      ref: "IngestionBatch",
    },

    vendor: {
      type: String,

      required: true,
    },

    billingModel: {
      type: String,

      required: true,
    },

    recurringLikelihood: {
      type: String,

      required: true,
    },

    amount: {
      type: Number,

      required: true,
    },

    currency: {
      type: String,

      required: true,
    },

    date: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.models.SubscriptionSignal ||
  mongoose.model<ISubscriptionSignal>(
    "SubscriptionSignal",
    SubscriptionSignalSchema,
  );
