import { AccountType, accountConnection } from './AccountType';
import { AccountLoader } from './AccountLoader';
import { connectionArgs } from 'graphql-relay';
import { GraphQLID, GraphQLNonNull } from 'graphql';
import { fromGlobalId } from 'graphql-relay';

export const accountField = (key: string) => ({
	[key]: {
		type: AccountType,
		resolve: async (obj: Record<string, unknown>, _, context) =>
			AccountLoader.load(context, obj.account as string),
	},
});

export const accountConnectionField = (key: string) => ({
	[key]: {
		type: accountConnection.connectionType,
		args: {
			...connectionArgs,
		},
		resolve: async (_, args, context) => {
			return await AccountLoader.loadAll(context, args);
		},
	},
});

export const rootAccountField = {
  type: AccountType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (_, { id }, context) => {
    const { type, id: dbId } = fromGlobalId(id);
    if (type !== 'Account') return null;
    return AccountLoader.load(context, dbId);
  },
};