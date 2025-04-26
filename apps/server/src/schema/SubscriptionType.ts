import { GraphQLObjectType } from 'graphql';

import { messageSubscriptions } from '../modules/message/subscriptions/messageSubscriptions';
import { accountSubscriptions } from '../modules/account/subscriptions/accountSubscriptions';

export const SubscriptionType = new GraphQLObjectType<any, any>({
	name: 'Subscription',
	fields: () => ({
	  ...accountSubscriptions,
	  ...messageSubscriptions,
	}),
});
