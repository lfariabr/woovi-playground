import { GraphQLObjectType } from 'graphql';

import { messageSubscriptions } from '../modules/message/subscriptions/messageSubscriptions';
import { accountSubscriptions } from '../modules/account/subscriptions/accountSubscriptions';
import { transactionSubscriptions } from '../modules/transaction/subscriptions/transactionSubscriptions';

export const SubscriptionType = new GraphQLObjectType<any, any>({
	name: 'Subscription',
	fields: () => ({
	  ...accountSubscriptions,
	  ...messageSubscriptions,
	  ...transactionSubscriptions,
	}),
});
