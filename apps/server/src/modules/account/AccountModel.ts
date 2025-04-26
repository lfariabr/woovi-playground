import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';

export type IAccount = {
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
} & Document;

const AccountSchema = new mongoose.Schema<IAccount>(
  {
    name: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Prevent OverwriteModelError in dev/watch mode
export const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
