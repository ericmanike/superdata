import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId | string;
  reference: string;
  amount: number;
  type: "topup" | "purchase" | "upgrade" | "refund" | "admin_adjustment";
  paymentMethod: string;
  status: "pending" | "success" | "failed";
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["topup", "purchase", "refund","upgrade", "admin_adjustment"],
      default: "topup",
    },
    paymentMethod: { type: String, default: "moolre" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
