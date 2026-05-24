import mongoose, { Schema, Document } from "mongoose";

export interface IFinancialRecord extends Document {
  userId: mongoose.Types.ObjectId;

  ingestionBatchId?: mongoose.Types.ObjectId;

  vendor: string;

  amount: number;

  currency: string;

  category: string;

  billingModel: string;

  sourceType: string;

  date?: string;
}

const FinancialRecordSchema = new Schema<IFinancialRecord>(
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

    amount: {
      type: Number,

      required: true,
    },

    currency: {
      type: String,

      required: true,
    },

    category: {
      type: String,

      required: true,
    },

    billingModel: {
      type: String,

      required: true,
    },

    sourceType: {
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

export default mongoose.models.FinancialRecord ||
  mongoose.model<IFinancialRecord>("FinancialRecord", FinancialRecordSchema);
