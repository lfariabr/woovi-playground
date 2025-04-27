import type { Document, Model, Decimal128 } from 'mongoose';
 import mongoose from 'mongoose';
 
 const Schema = new mongoose.Schema<ITransaction>(
        {
          idempotentKey: {
            type: String,
            required: true,
          },
          senderAccountId: {
            type: mongoose.Types.ObjectId,
            ref: "Account",
            required: true,
          },
          receiverAccountId: {
            type: mongoose.Types.ObjectId,
            ref: "Account",
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

export type ITransaction = {
      senderAccountId: mongoose.Schema.Types.ObjectId;
      receiverAccountId: mongoose.Schema.Types.ObjectId;
      idempotentKey: string;
      value: Decimal128;
      description?: string;
      createdAt: Date;
      updatedAt: Date;
} & Document;

export const Transaction: Model<ITransaction> = mongoose.model('Transaction', Schema);