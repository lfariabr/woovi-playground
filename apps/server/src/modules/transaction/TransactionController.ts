import { z } from 'zod'

import { Transaction } from './TransactionModel'
import { GraphQLError } from 'graphql'
import { Account } from '../account/AccountModel'

const transferFundsSchema = z.object({
  amount: z.number().int().positive(),
  senderAccountId: z.string(),
  receiverAccountId: z.string(),
  idempotencyKey: z.string(),
});

export async function transferTypeValidator(args: z.infer<typeof transferFundsSchema>) {
  try {
    const parsed = transferFundsSchema.safeParse(args);
    if (!parsed.success) {
      console.error('[Transaction] Validation error:', parsed.error.flatten().fieldErrors);
      throw new GraphQLError('Invalid input', {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args,
          errors: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const { amount, senderAccountId, receiverAccountId, idempotencyKey } = parsed.data;

    // Preventing sender and receiver from being the same account
    if (senderAccountId === receiverAccountId) {
      console.warn(`[Transaction] Sender and receiver are the same account: ${senderAccountId}`);
      throw new GraphQLError('Sender and receiver accounts must be different.');
    }

    // Fetching accounts
    const sender = await Account.findById(senderAccountId);
    const receiver = await Account.findById(receiverAccountId);
    if (!sender) {
      console.error(`[Transaction] Sender account not found: ${senderAccountId}`);
      throw new GraphQLError('Sender account not found');
    }
    if (!receiver) {
      console.error(`[Transaction] Receiver account not found: ${receiverAccountId}`);
      throw new GraphQLError('Receiver account not found');
    }

    // Idempotency enforcement to check for existing transaction by sender + idempotentKey
    const existingTx = await Transaction.findOne({
      senderAccountId,
      idempotentKey: idempotencyKey,
    });
    if (existingTx) {
      console.warn(`[Transaction] Duplicate idempotencyKey for sender: ${senderAccountId}, key: ${idempotencyKey}`);
      throw new GraphQLError('Duplicate idempotencyKey: a transaction with this key already exists for this sender.');
    }

    // Atomic balance update for race condition/concurrency safety
    const senderUpdate = await Account.findOneAndUpdate(
      {
        _id: senderAccountId,
        balance: { $gte: amount },
      },
      { $inc: { balance: -amount } },
      { new: true }
    );
    if (!senderUpdate) {
      console.warn(`[Transaction] Insufficient funds for sender: ${senderAccountId}, attempted: ${amount}`);
      throw new GraphQLError('Insufficient funds (atomic check failed)');
    }

    // Credit receiver atomically (no balance check needed)
    await Account.findByIdAndUpdate(
      receiverAccountId,
      { $inc: { balance: amount } },
      { new: true }
    );

    // Create transaction (now safe)
    let transaction;
    try {
      transaction = await Transaction.create({
        senderAccountId,
        receiverAccountId,
        value: amount,
        idempotentKey: idempotencyKey,
      });
    } catch (err: any) {
      // Handle duplicate key error (race condition fallback)
      if (err.code === 11000) {
        console.error('[Transaction] Duplicate key error (DB-level idempotency):', err.keyValue);
        throw new GraphQLError('Duplicate idempotencyKey (DB-level): a transaction with this key already exists for this sender.');
      }
      console.error('[Transaction] DB error:', err);
      throw new GraphQLError('Transaction creation failed due to a database error.');
    }

    console.info('[Transaction] Created transaction:', {
      senderAccountId,
      receiverAccountId,
      value: amount,
      idempotentKey: idempotencyKey,
      transactionId: transaction._id,
    });

    if (!transaction) {
      throw new GraphQLError('Transaction creation failed');
    }

    return { transaction: transaction._id };
  } catch (err: any) {
    // Log and rethrow for GraphQL error propagation
    console.error('[Transaction] Error:', err);
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError('Unexpected error occurred during transaction.');
  }
}
