import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { withFilter } from 'graphql-subscriptions';

import { accountField } from '../accountFields';
import { Account } from '../AccountModel';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

type AccountAddedPayload = {
	account: string;
};

const subscription = subscriptionWithClientId({
	name: 'AccountAdded',
	subscribe: withFilter(
		() => redisPubSub.asyncIterator(PUB_SUB_EVENTS.ACCOUNT.ADDED),
		async (payload: AccountAddedPayload, context) => {
			const account = await Account.findOne({
				_id: payload.account,
			});

			if (!account) {
				return false;
			}

			return true;
		}
	),
	getPayload: async (obj: AccountAddedPayload) => ({
		account: obj?.account,
	}),
	outputFields: {
		...accountField('account'),
	},
});

export const AccountAddedSubscription = {
	...subscription,
};