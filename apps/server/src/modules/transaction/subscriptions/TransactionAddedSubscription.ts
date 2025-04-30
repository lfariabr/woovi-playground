import { subscriptionWithClientId } from 'graphql-relay-subscription';
import { withFilter } from 'graphql-subscriptions';

import { transactionField } from '../TransactionFields';
import { Transaction } from '../TransactionModel';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';
import { GraphQLInputObjectType, GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql';

type TransactionAddedPayload = {
	transaction: string;
};

// Define the correct input type for the subscription
export const TransactionAddedInputType = new GraphQLInputObjectType({
	name: 'TransactionAddedInput',
	fields: {
		accountId: { type: new GraphQLNonNull(GraphQLID) },
		clientSubscriptionId: { type: GraphQLString },
	},
});

const subscription = subscriptionWithClientId({
	name: 'TransactionAdded',
	inputFields: {
		accountId: { type: new GraphQLNonNull(GraphQLID) },
		clientSubscriptionId: { type: GraphQLString },
	},
	subscribe: withFilter(
		() => redisPubSub.asyncIterator(PUB_SUB_EVENTS.TRANSACTION.ADDED),
		async (payload: TransactionAddedPayload, context, variables) => {
			// Filter by accountId if present in variables
			if (variables.input && variables.input.accountId) {
				const transaction = await Transaction.findOne({
					_id: payload.transaction,
				});
				if (!transaction) return false;
				return (
					transaction.senderAccountId === variables.input.accountId ||
					transaction.receiverAccountId === variables.input.accountId
				);
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