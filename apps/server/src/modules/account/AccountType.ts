import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';
import { globalIdField, connectionDefinitions, connectionArgs, connectionFromArray } from 'graphql-relay';
import type { ConnectionArguments } from 'graphql-relay';

import { IAccount } from './AccountModel';
import { nodeInterface } from '../node/typeRegister';
import { registerTypeLoader } from '../node/typeRegister';
import { AccountLoader } from './AccountLoader';
import { TransactionLoader } from '../transaction/TransactionLoader';
import { TransactionType } from '../transaction/TransactionType';
import { Transaction } from '../transaction/TransactionModel';
import { TransactionConnection } from '../transaction/TransactionType';

// Add a transactions connection field that returns all transactions where the account is either sender or receiver

const AccountType = new GraphQLObjectType<IAccount>({
	name: 'Account',
	description: 'Represents an account',
	fields: () => ({
		id: globalIdField('Account'),
		accountNumber: {
			type: GraphQLString,
			resolve: (account) => account.accountNumber,
		},
		name: {
			type: GraphQLString,
			resolve: (account) => account.name,
		},
		balance: {
			type: GraphQLString,
			resolve: (account) =>
			  account.balance && typeof account.balance.toString === 'function'
			    ? account.balance.toString()
			    : account.balance,
		},
		userTaxId: {
			type: GraphQLString,
			resolve: (account) => account.userTaxId,
		},
		createdAt: {
			type: GraphQLString,
			resolve: (account) => account.createdAt.toISOString(),
		},
		updatedAt: {
			type: GraphQLString,
			resolve: (account) => account.updatedAt.toISOString(),
		},
		transactions: {
			type: TransactionConnection,
			args: connectionArgs,
			resolve: async (account, args, context) => {
				try {
					const mongoose = require('mongoose');
					
					// 1. Garantir que temos um ID de conta válido
					const accountId = account._id.toString();
					console.log('🔍 Buscando transações para conta:', accountId);
					
					// 2. Converter para ObjectId para consulta MongoDB
					let accountObjectId;
					try {
						accountObjectId = new mongoose.Types.ObjectId(accountId);
					} catch (err) {
						console.error('❌ Erro ao converter accountId para ObjectId:', err);
						return connectionFromArray([], args);
					}
					
					// 3. Usar o próprio modelo Transaction para a consulta (evita problemas de context)
					const Transaction = mongoose.model('Transaction');
					
					// 4. Fazer a consulta com ObjectId, não com string
					const transactions = await Transaction.find({
						$or: [
							{ senderAccountId: accountObjectId },
							{ receiverAccountId: accountObjectId }
						]
					}).sort({ createdAt: -1 });
					
					// 5. Log detalhado para debugging
					console.log(`✅ Encontradas ${transactions.length} transações para a conta ${accountId}`);
					transactions.forEach((tx, index) => {
						console.log(`   Transação #${index+1}: ${tx._id.toString()}`);
						console.log(`   - De: ${tx.senderAccountId.toString()}`);
						console.log(`   - Para: ${tx.receiverAccountId.toString()}`);
						console.log(`   - Valor: ${tx.value.toString()}`);
						console.log(`   - Data: ${tx.createdAt.toISOString()}`);
						
						// 6. Adicionar campo de tipo para facilitar o frontend
						if (!tx.type) {
							if (tx.senderAccountId.toString() === accountId) {
								tx.type = 'SENT';
							} else {
								tx.type = 'RECEIVED';
							}
						}
					});
					
					// 7. Retornar os resultados formatados para o GraphQL
					return connectionFromArray(transactions, args);
				} catch (error) {
					// 8. Tratamento adequado de erros
					console.error('❌ Erro ao buscar transações:', error);
					throw new Error(`Falha ao buscar transações: ${error.message}`);
				}
			},
		},
	}),
	interfaces: () => [nodeInterface],
});

const accountConnection = connectionDefinitions({
	name: 'Account',
	nodeType: AccountType,
});

registerTypeLoader(AccountType, AccountLoader.load);

export { AccountType, accountConnection };
