import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { ITransaction } from './TransactionModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { TransactionLoader } from './TransactionLoader';
import { AccountLoader } from '../account/AccountLoader';

const TransactionType = new GraphQLObjectType<ITransaction>({
	name: 'Transaction',
	description: 'Represents a transaction',
	fields: () => ({
		id: globalIdField('Transaction'),
		senderAccountId: {
			type: GraphQLString,
			resolve: (tx) => tx.senderAccountId ? tx.senderAccountId.toString() : null,
		},
		receiverAccountId: {
			type: GraphQLString,
			resolve: (tx) => tx.receiverAccountId ? tx.receiverAccountId.toString() : null,
		},
		idempotencyKey: {
			type: GraphQLString,
			resolve: (tx) => tx.idempotentKey,
		},
		value: {
			type: new GraphQLNonNull(GraphQLString),
			resolve: ({value}) => `${value}`,
		},
		description: {
			type: GraphQLString,
			resolve: ({description}) => description,
		},
		createdAt: {
			type: GraphQLString,
			resolve: (transaction) => transaction.createdAt.toISOString(),
		},
		senderAccountNumber: {
			type: GraphQLString,
			resolve: async (tx, _, context) => {
			  if (!tx.senderAccountId) return null;
			  const account = await AccountLoader.load(context, tx.senderAccountId.toString());
			  return account?.accountNumber ?? null;
			},
		  },
		  receiverAccountNumber: {
			type: GraphQLString,
			resolve: async (tx, _, context) => {
			  if (!tx.receiverAccountId) return null;
			  const account = await AccountLoader.load(context, tx.receiverAccountId.toString());
			  return account?.accountNumber ?? null;
			},
		},
	}),
	interfaces: () => [nodeInterface],
});

const { connectionType: TransactionConnection } = connectionDefinitions({
	name: 'Transaction',
	nodeType: TransactionType,
});

registerTypeLoader(TransactionType, TransactionLoader.load);

export { TransactionType, TransactionConnection };
