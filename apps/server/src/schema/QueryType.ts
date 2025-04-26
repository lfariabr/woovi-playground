import { GraphQLObjectType } from 'graphql';

import { accountConnectionField } from '../modules/account/accountFields';
import { messageConnectionField } from '../modules/message/messageFields';

export const QueryType = new GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		...accountConnectionField('accounts'),
		...messageConnectionField('messages'),
	}),
});
