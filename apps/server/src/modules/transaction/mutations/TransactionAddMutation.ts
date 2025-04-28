import { GraphQLString, GraphQLInt, GraphQLNonNull } from 'graphql';
import { mutationWithClientMutationId } from 'graphql-relay';
import { transactionField } from '../transactionFields';
import { transferTypeValidator } from '../TransactionController'

export type TransactionAddInput = {
	value: number;
	senderAccountId: string;
	receiverAccountId: string;
	idempotencyKey: string;
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
		description: 'IDempotency key for the transaction',
		type: new GraphQLNonNull(GraphQLString)
	  }
	},
	mutateAndGetPayload: async (args: TransactionAddInput) => {
	  return transferTypeValidator({
		amount: args.value,
		senderAccountId: args.senderAccountId,
		receiverAccountId: args.receiverAccountId,
		idempotencyKey: args.idempotencyKey
	  })
	},
	outputFields: {
	  ...transactionField('transaction')
	}
  })

export const createTransaction = TransferMutation;