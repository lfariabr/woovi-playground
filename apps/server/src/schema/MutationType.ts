import { GraphQLObjectType } from 'graphql';

import { messageMutations } from '../modules/message/mutations/messageMutations';
import { accountMutations } from '../modules/account/mutations/accountMutations';
import { transactionMutations } from '../modules/transaction/mutations/transactionMutations';
import { createTransaction } from '../modules/transaction/mutations/TransactionAddMutation';

export const MutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({
		...accountMutations,
		...messageMutations,
		...transactionMutations,
		createTransaction,
	}),
});
