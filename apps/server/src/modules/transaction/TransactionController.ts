import { z } from 'zod'
import { Transaction } from './TransactionModel'
import { GraphQLError } from 'graphql'
import { Account } from '../account/AccountModel'
import { fromGlobalId } from 'graphql-relay';
import { redisPubSub } from '../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../pubSub/pubSubEvents';
import mongoose from 'mongoose';

// Updated schema: accept string or number, validate as positive decimal
const transferFundsSchema = z.object({
  amount: z.union([z.string(), z.number()])
    .refine(val => {
      const num = typeof val === 'number' ? val : parseFloat(val);
      return !isNaN(num) && num > 0;
    }, { message: 'Amount must be a positive decimal value' }),
  senderAccountId: z.string(),
  receiverAccountId: z.string(),
  idempotencyKey: z.string(),
  createdAt: z.string().optional(),
});

// Accepts args with amount as string or number, converts to Decimal128
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

    const { amount, senderAccountId, receiverAccountId, idempotencyKey, createdAt } = parsed.data;
    // Always convert to Decimal128 for DB/business logic
    const decimalAmount = mongoose.Types.Decimal128.fromString(amount.toString());

    // Accept accountNumber, globalId, or ObjectId for sender/receiver
    const resolvedSenderAccountId = await resolveAccountId(senderAccountId);
    const resolvedReceiverAccountId = await resolveAccountId(receiverAccountId);

    // Preventing sender and receiver from being the same account
    if (resolvedSenderAccountId === resolvedReceiverAccountId) {
      console.warn(`[Transaction] Sender and receiver are the same account: ${resolvedSenderAccountId}`);
      throw new GraphQLError('Sender and receiver accounts must be different.');
    }

    // Fetching accounts
    const sender = await Account.findById(resolvedSenderAccountId);
    const receiver = await Account.findById(resolvedReceiverAccountId);
    if (!sender) {
      console.error(`[Transaction] Sender account not found: ${resolvedSenderAccountId}`);
      throw new GraphQLError('Sender account not found');
    }
    if (!receiver) {
      console.error(`[Transaction] Receiver account not found: ${resolvedReceiverAccountId}`);
      throw new GraphQLError('Receiver account not found');
    }

    // #TODO: maybe consider user timezone or fix at BRT // date fns
    let createdAtDate: Date;
    if (createdAt) {
      const parsedDate = new Date(createdAt);
      if (isNaN(parsedDate.getTime())) {
        throw new GraphQLError('Invalid createdAt date format. Use ISO8601 string.');
      }
      createdAtDate = parsedDate;
    } else {
      createdAtDate = new Date();
    }

    // Idempotency enforcement to check for existing transaction by sender + idempotentKey
    const existingTx = await Transaction.findOne({
      senderAccountId: resolvedSenderAccountId,
      idempotentKey: idempotencyKey,
    });
    if (existingTx) {
      console.warn(`[Transaction] Duplicate idempotencyKey for sender: ${resolvedSenderAccountId}, key: ${idempotencyKey}`);
      throw new GraphQLError('Duplicate idempotencyKey: a transaction with this key already exists for this sender.');
    }

    // Atomic balance update for race condition/concurrency safety
    const senderUpdate = await Account.findOneAndUpdate(
      {
        _id: resolvedSenderAccountId,
        balance: { $gte: decimalAmount },
      },
      { $inc: { balance: -decimalAmount } },
      { new: true }
    );
    if (!senderUpdate) {
      console.warn(`[Transaction] Insufficient funds for sender: ${resolvedSenderAccountId}, attempted: ${decimalAmount}`);
      throw new GraphQLError('Insufficient funds (atomic check failed)');
    }

    // Credit receiver atomically (no balance check needed)
    await Account.findByIdAndUpdate(
      resolvedReceiverAccountId,
      { $inc: { balance: decimalAmount } },
      { new: true }
    );

    // Creating transaction
    let transaction;
    try {
      transaction = await Transaction.create({
        senderAccountId: resolvedSenderAccountId,
        receiverAccountId: resolvedReceiverAccountId,
        value: decimalAmount,
        idempotentKey: idempotencyKey,
        createdAt: createdAtDate,
      });
    } catch (err: any) {
      // Handling duplicate key error (race condition fallback)
      if (err.code === 11000) {
        console.error('[Transaction] Duplicate key error (DB-level idempotency):', err.keyValue);
        throw new GraphQLError('Duplicate idempotencyKey (DB-level): a transaction with this key already exists for this sender.');
      }
      console.error('[Transaction] DB error:', err);
      throw new GraphQLError('Transaction creation failed due to a database error.');
    }

    if (!transaction) {
      throw new GraphQLError('Transaction creation failed');
    }

    await redisPubSub.publish(PUB_SUB_EVENTS.TRANSACTION.ADDED, {
      transaction: transaction._id,
    });

    return { transaction: transaction._id };
  } catch (err: any) {
    console.error('[Transaction] Error:', err);
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError('Unexpected error occurred during transaction.');
  }
}

async function resolveAccountId(accountIdOrNumber: string) {
  // Try ObjectId
  if (/^[a-f\d]{24}$/i.test(accountIdOrNumber)) {
    return accountIdOrNumber;
  }
  // Try Relay globalId
  try {
    const { type, id } = fromGlobalId(accountIdOrNumber);
    if (type === 'Account' && /^[a-f\d]{24}$/i.test(id)) {
      return id;
    }
  } catch {}
  // Fallback: treat as accountNumber
  const account = await Account.findOne({ accountNumber: accountIdOrNumber });
  if (!account) throw new GraphQLError(`Account with number or id '${accountIdOrNumber}' not found`);
  return account._id.toString();
}
