import type { Document, Model, Decimal128 } from 'mongoose';
import mongoose from 'mongoose';
import { Account } from '../account/AccountModel';

const Schema = new mongoose.Schema<ITransaction>(
  {
    idempotentKey: {
      type: String,
      required: true,
      unique: true,
    },
    senderAccountId: {
      type: mongoose.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    receiverAccountId: {
      type: mongoose.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    description: String,  
  },
  {
    collection: 'Transaction',
    timestamps: true,
  }
);

// Ensuring idempotency per sender
Schema.index({ senderAccountId: 1, idempotentKey: 1 }, { unique: true });

// Adding a pre-save hook to enforce sender's balance check
Schema.pre('save', async function (next) {
  const transaction = this as any;
  try {
    const sender = await Account.findById(transaction.senderAccountId);
    if (!sender) {
      return next(new Error('Sender account does not exist'));
    }
    // Convert Decimal128/null to number for comparison
    const senderBalance =
      sender.balance == null
        ? 0
        : typeof sender.balance === 'object' && typeof (sender.balance as Decimal128).toString === 'function'
          ? parseFloat((sender.balance as Decimal128).toString())
          : sender.balance;
    const txValue = typeof transaction.value === 'object' && transaction.value !== null ? parseFloat(transaction.value.toString()) : transaction.value;
    if (senderBalance < txValue) {
      return next(new Error('Insufficient balance'));
    }
    next();
  } catch (err) {
    next(err);
  }
});

export type ITransaction = {
  senderAccountId: mongoose.Schema.Types.ObjectId;
  receiverAccountId: mongoose.Schema.Types.ObjectId;
  idempotentKey: string;
  value: Decimal128;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Added type field to fix lint error in TransactionType
  type?: 'SENT' | 'RECEIVED'; // added by the loader, not in the database model
} & Document;

export const Transaction: Model<ITransaction> = mongoose.model('Transaction', Schema);