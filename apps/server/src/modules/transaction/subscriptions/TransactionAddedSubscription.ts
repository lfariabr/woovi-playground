import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { withFilter } from 'graphql-subscriptions';

import { transactionField } from '../transactionFields';
import { Transaction } from '../TransactionModel';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

type TransactionAddedPayload = {
	transaction: string;
};

const subscription = subscriptionWithClientId({
	name: 'TransactionAdded',
	subscribe: withFilter(
		() => redisPubSub.asyncIterator(PUB_SUB_EVENTS.TRANSACTION.ADDED),
		async (payload: TransactionAddedPayload, context) => {
			const transaction = await Transaction.findOne({
				_id: payload.transaction,
			});

			if (!transaction) {
				return false;
			}

			return true;
		}
	),
	getPayload: async (obj: TransactionAddedPayload) => ({
		transaction: obj?.transaction,
	}),
	outputFields: {
		...transactionField('transaction'),
	},
});

export const TransactionAddedSubscription = {
	...subscription,
};