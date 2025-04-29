import { TransactionType, TransactionConnection } from './TransactionType';
import { TransactionLoader } from './TransactionLoader';
import { connectionArgs } from 'graphql-relay';
import { GraphQLID, GraphQLNonNull } from 'graphql';
import { fromGlobalId } from 'graphql-relay';

export const transactionField = (key: string) => ({
	[key]: {
		type: TransactionType,
		resolve: async (obj: Record<string, unknown>, _, context) =>
			TransactionLoader.load(context, obj.transaction as string),
	},
});

export const transactionConnectionField = (key: string) => ({
	[key]: {
		type: TransactionConnection,
		args: {
			...connectionArgs,
		},
		resolve: async (_, args, context) => {
			return await TransactionLoader.loadAll(context, args);
		},
	},
});

export const rootTransactionField = {
  type: TransactionType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (_, { id }, context) => {
    const { type, id: dbId } = fromGlobalId(id);
    if (type !== 'Transaction') return null;
    return TransactionLoader.load(context, dbId);
  },
};