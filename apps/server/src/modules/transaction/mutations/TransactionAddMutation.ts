import { GraphQLString, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { transactionField } from '../TransactionFields';
import { transferTypeValidator } from '../TransactionController'
import mongoose from 'mongoose';

export type TransactionAddInput = {
  value: string; // Decimal128 as string for precision
  senderAccountId: string;
  receiverAccountId: string;
  idempotencyKey: string;
  createdAt?: string;
};

export const TransferMutation = mutationWithClientMutationId({
  name: 'Transfer',
  inputFields: {
    value: {
      description: 'The amount to transfer as a decimal string (e.g., "1.23")',
      type: new GraphQLNonNull(GraphQLString)
    },
    senderAccountId: {
      description: 'ID of the account to withdraw from',
      type: new GraphQLNonNull(GraphQLString)
    },
    receiverAccountId: {
      description: 'ID of the account to deposit to',
      type: new GraphQLNonNull(GraphQLString)
    },
    idempotencyKey: {
      description: 'Idempotency key for the transaction',
      type: new GraphQLNonNull(GraphQLString)
    },
    createdAt: {
      description: 'Creation date of the transaction (optional, ISO string)',
      type: GraphQLString
    }
  },
  mutateAndGetPayload: async (args: TransactionAddInput) => {
    // Convert value to Decimal128 for precision
    return transferTypeValidator({
      amount: args.value,
      senderAccountId: args.senderAccountId,
      receiverAccountId: args.receiverAccountId,
      idempotencyKey: args.idempotencyKey,
      createdAt: args.createdAt
    })
  },
  outputFields: {
    ...transactionField('transaction')
  }
});

export const createTransaction = TransferMutation;