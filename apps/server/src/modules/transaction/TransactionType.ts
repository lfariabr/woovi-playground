import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { ITransaction } from './TransactionModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { TransactionLoader } from './TransactionLoader';
import { AccountType } from '../account/AccountType';
import { Account } from '../account/AccountModel';

const TransactionType = new GraphQLObjectType<ITransaction>({
	name: 'Transaction',
	description: 'Represents a transaction',
	fields: () => ({
		id: globalIdField('Transaction'),
		sender: {
			type: new GraphQLNonNull(AccountType),
			resolve: async ({ senderAccountId }) => {
				return Account.findById(senderAccountId);
			},
		},
		receiver: {
			type: new GraphQLNonNull(AccountType),
			resolve: async ({ receiverAccountId }) => {
				return Account.findById(receiverAccountId);
			},
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
	}),
	interfaces: () => [nodeInterface],
});

const transactionConnection = connectionDefinitions({
	name: 'Transaction',
	nodeType: TransactionType,
});

registerTypeLoader(TransactionType, TransactionLoader.load);

export { TransactionType, transactionConnection };
