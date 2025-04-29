import { AccountType, accountConnection } from './AccountType';
import { AccountLoader } from './AccountLoader';
import { connectionArgs } from 'graphql-relay';
import { GraphQLID, GraphQLNonNull } from 'graphql';
import { fromGlobalId } from 'graphql-relay';
import { Account } from './AccountModel';

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
    // Try Relay globalId
    try {
      const { type, id: dbId } = fromGlobalId(id);
      if (type === 'Account' && /^[a-f\d]{24}$/i.test(dbId)) {
        return AccountLoader.load(context, dbId);
      }
    } catch {}
    // Try direct ObjectId
    if (/^[a-f\d]{24}$/i.test(id)) {
      return AccountLoader.load(context, id);
    }
    // Try accountNumber
    const account = await Account.findOne({ accountNumber: id });
    if (account) {
      return AccountLoader.load(context, account._id.toString());
    }
    return null;
  },
};

export { AccountType, accountConnection };