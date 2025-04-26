import { GraphQLString, GraphQLNonNull, GraphQLFloat } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

import { Account } from '../AccountModel';
import { accountField } from '../accountFields';

export type AccountAddInput = {
	name: string;
	balance: number;
};

const mutation = mutationWithClientMutationId({
	name: 'AccountAdd',
	inputFields: {
		name: {
			type: new GraphQLNonNull(GraphQLString),
		},
		balance: {
			type: new GraphQLNonNull(GraphQLFloat),
		},
	},
	mutateAndGetPayload: async (args: AccountAddInput) => {
		const account = await new Account({
			name: args.name,
			balance: args.balance,
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
