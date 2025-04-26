import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from 'graphql';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { IAccount } from './AccountModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { AccountLoader } from './AccountLoader';

const AccountType = new GraphQLObjectType<IAccount>({
	name: 'Account',
	description: 'Represents an account',
	fields: () => ({
		id: globalIdField('Account'),
		name: {
			type: GraphQLString,
			resolve: (account) => account.name,
		},
		balance: {
			type: GraphQLString,
			resolve: (account) => account.balance,
		},
		createdAt: {
			type: GraphQLString,
			resolve: (account) => account.createdAt.toISOString(),
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
