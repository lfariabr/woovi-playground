import { GraphQLObjectType } from 'graphql';

import { accountConnectionField } from '../modules/account/accountFields';
import { messageConnectionField } from '../modules/message/messageFields';
import { transactionConnectionField } from '../modules/transaction/TransactionFields';
import { rootAccountField } from '../modules/account/accountFields';
import { rootTransactionField } from '../modules/transaction/TransactionFields';

export const QueryType = new GraphQLObjectType({
	name: 'Query',
	fields: () => ({
		...messageConnectionField('messages'),
		
		// New:
		...accountConnectionField('accounts'),
		account: rootAccountField,
		...transactionConnectionField('transactions'),
		transaction: rootTransactionField,
	}),
});
