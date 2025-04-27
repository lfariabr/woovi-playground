import { GraphQLString, GraphQLNonNull, GraphQLFloat } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

import { Account } from '../AccountModel';
import { accountField } from '../accountFields';

export type AccountAddInput = {
	accountNumber: string;
	balance: number;
	userTaxId: string;
};

const mutation = mutationWithClientMutationId({
	name: 'AccountAdd',
	inputFields: {
		accountNumber: {
			type: new GraphQLNonNull(GraphQLString),
		},
		balance: {
			type: new GraphQLNonNull(GraphQLFloat),
		},
		userTaxId: {
			type: new GraphQLNonNull(GraphQLString),
		},
	},
	mutateAndGetPayload: async (args: AccountAddInput) => {
		const account = await new Account({
			accountNumber: args.accountNumber,
			balance: args.balance,
			userTaxId: args.userTaxId,
		}).save();

		console.log('MUTATION publishing:', { account: account._id.toString() });
		redisPubSub.publish(PUB_SUB_EVENTS.ACCOUNT.ADDED, {
			account: account._id.toString(),
		});

		return {
			account: account._id.toString(),
		};
	},
	outputFields: {
		...accountField('account'),
	},
});

export const AccountAddMutation = {
	...mutation,
};
