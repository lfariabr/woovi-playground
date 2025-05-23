import { GraphQLString, GraphQLNonNull, GraphQLFloat } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';

import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

import { Account } from '../AccountModel';
import { accountField } from '../accountFields';

export type AccountAddInput = {
	accountNumber: string;
	balance: number;
	userTaxId: string;
	name: string;
};

const mutation = mutationWithClientMutationId({
	name: 'AccountAdd',
	inputFields: {
		accountNumber: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Número da conta',
		},
		balance: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'Saldo da conta',
		},
		userTaxId: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'CPF do usuário',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Nome da conta',
		},
	},
	mutateAndGetPayload: async (args: AccountAddInput) => {
		const account = await new Account({
			accountNumber: args.accountNumber,
			balance: args.balance,
			userTaxId: args.userTaxId,
			name: args.name,
		}).save();

		console.log('MUTATION publishing:', { account: account._id.toString(), accountNumber: account.accountNumber });
		redisPubSub.publish(PUB_SUB_EVENTS.ACCOUNT.ADDED, {
			accountNumber: account.accountNumber,
		});

		return {
			account: account._id.toString(),
		};
	},
	outputFields: {
		...accountField('account'),
	},
});

export const AccountAddMutation = {
	...mutation,
};
