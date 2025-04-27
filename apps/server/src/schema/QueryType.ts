import { GraphQLObjectType } from 'graphql';

import { accountConnectionField } from '../modules/account/accountFields';
import { messageConnectionField } from '../modules/message/messageFields';
import { transactionConnectionField } from '../modules/transaction/transactionFields';

export const QueryType = new GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		...accountConnectionField('accounts'),
		...messageConnectionField('messages'),
		...transactionConnectionField('transactions'),
	}),
});
