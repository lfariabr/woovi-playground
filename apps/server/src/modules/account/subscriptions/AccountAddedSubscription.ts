import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { withFilter } from 'graphql-subscriptions';
import { GraphQLString } from 'graphql';

import { accountField, AccountType } from '../accountFields';
import { Account } from '../AccountModel';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

type AccountAddedPayload = {
	accountNumber: string;
};

const subscription = subscriptionWithClientId({
	name: 'AccountAdded',
	subscribe: withFilter(
		() => redisPubSub.asyncIterator(PUB_SUB_EVENTS.ACCOUNT.ADDED),
		async (payload: AccountAddedPayload, context) => {
			console.log('AccountAdded subscription filter called with:', payload);
			const account = await Account.findOne({
				accountNumber: payload.accountNumber,
			});

			if (!account) {
				return false;
			}

			return true;
		}
	),
	getPayload: async (obj: AccountAddedPayload) => ({
		accountNumber: obj?.accountNumber,
	}),
	outputFields: {
		account: {
			type: AccountType,
			resolve: async (payload: AccountAddedPayload) => {
				return Account.findOne({ accountNumber: payload.accountNumber });
			},
		},
		accountNumber: {
			type: GraphQLString,
			resolve: (payload: AccountAddedPayload) => payload.accountNumber,
		},
	},
});

export const AccountAddedSubscription = {
	...subscription,
};