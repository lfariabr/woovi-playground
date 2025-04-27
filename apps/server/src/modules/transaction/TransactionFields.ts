import { TransactionType, TransactionConnection } from './TransactionType';
import { TransactionLoader } from './TransactionLoader';
import { connectionArgs } from 'graphql-relay';

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