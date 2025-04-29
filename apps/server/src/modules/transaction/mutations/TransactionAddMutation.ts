import { GraphQLString, GraphQLInt, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { transactionField } from '../transactionFields';
import { transferTypeValidator } from '../TransactionController'

export type TransactionAddInput = {
	value: number;
	senderAccountId: string;
	receiverAccountId: string;
	idempotencyKey: string;
	createdAt?: string;
};

export const TransferMutation = mutationWithClientMutationId({
	name: 'Transfer',
	inputFields: {
		value: {
			description: 'The amount to transfer in cents',
			type: new GraphQLNonNull(GraphQLInt)
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