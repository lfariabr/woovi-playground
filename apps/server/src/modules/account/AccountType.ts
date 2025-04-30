import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';
import { globalIdField, connectionDefinitions, connectionArgs, connectionFromArray } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { IAccount } from './AccountModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { AccountLoader } from './AccountLoader';
import { TransactionLoader } from '../transaction/TransactionLoader';
import { TransactionType } from '../transaction/TransactionType';
import { Transaction } from '../transaction/TransactionModel';
import { TransactionConnection } from '../transaction/TransactionType';

// Add a transactions connection field that returns all transactions where the account is either sender or receiver

const AccountType = new GraphQLObjectType<IAccount>({
	name: 'Account',
	description: 'Represents an account',
	fields: () => ({
		id: globalIdField('Account'),
		accountNumber: {
			type: GraphQLString,
			resolve: (account) => account.accountNumber,
		},
		name: {
			type: GraphQLString,
			resolve: (account) => account.name,
		},
		balance: {
			type: GraphQLString,
			resolve: (account) =>
			  account.balance && typeof account.balance.toString === 'function'
			    ? account.balance.toString()
			    : account.balance,
		},
		userTaxId: {
			type: GraphQLString,
			resolve: (account) => account.userTaxId,
		},
		createdAt: {
			type: GraphQLString,
			resolve: (account) => account.createdAt.toISOString(),
		},
		updatedAt: {
			type: GraphQLString,
			resolve: (account) => account.updatedAt.toISOString(),
		},
		transactions: {
			type: TransactionConnection,
			args: connectionArgs,
			resolve: async (account, args, context) => {
				const transactions = await context.transactionsByAccountIdLoader.load(account._id.toString());
				return connectionFromArray(transactions, args);
			},
		},
	}),
	interfaces: () => [nodeInterface],
});

const accountConnection = connectionDefinitions({
	name: 'Account',
	nodeType: AccountType,
});

registerTypeLoader(AccountType, AccountLoader.load);

export { AccountType, accountConnection };
