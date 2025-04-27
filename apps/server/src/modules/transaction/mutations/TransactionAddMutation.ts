import { GraphQLString, GraphQLNonNull, GraphQLFloat } from 'graphql';
import { mutationWithClientMutationId, toGlobalId } from 'graphql-relay';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';
import { Transaction } from '../TransactionModel';
import { transactionField } from '../transactionFields';
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../../account/AccountModel';

export type TransactionAddInput = {
	receiverAccountNumber: string;
 	value: string;
 	description?: string;
};

const mutation = mutationWithClientMutationId({
	name: 'TransactionAdd',
	inputFields: {
		receiverAccountNumber: {
			type: new GraphQLNonNull(GraphQLString),
		},
		value: {
			type: new GraphQLNonNull(GraphQLString),
		},
		description: {
			type: GraphQLString,
		},
	},
	mutateAndGetPayload: async (args: TransactionAddInput) => {
		
		// Commenting for testing at dev env
		// const session = await mongoose.startSession();
		// session.startTransaction();

		try {

			// 1. Get sender from context (e.g., ctx.user.accountNumber or ctx.user.taxId)
			// const sender = await Account.findOne({ userTaxId: ctx.user?.taxId }); // Adjust as needed
			// if (!sender) throw new Error('Sender account not found');
			const sender = await Account.findOne({ accountNumber: "1" }); // Use a real test account

			// 2. Find receiver by account number
			const receiver = await Account.findOne({ accountNumber: args.receiverAccountNumber });
			if (!receiver) throw new Error('Receiver account not found');

			// 3. Generate idempotentKey
			const idempotentKey = uuidv4();

			// 4. Validate the balance
			const value = Number(args.value);
			
			if (!sender || sender.balance < value) {
				throw new Error('Insufficient funds');
			}
			
			// sender.balance -= value;
			// receiver.balance += value;
			sender.balance = Number(sender.balance) - value;
			receiver.balance = Number(receiver.balance) + value;
			
			// Save both accounts with the session
			// await sender.save({ session });
			// await receiver.save({ session });
			await sender.save();
  			await receiver.save();

			// 5. Create transaction
			const transaction = await new Transaction({
				senderAccountId: sender._id,
				receiverAccountId: receiver._id,
				value: args.value,
				idempotentKey,
				description: args.description,
			// }).save({ session });
			}).save();

			redisPubSub.publish(PUB_SUB_EVENTS.TRANSACTION.ADDED, {
				transaction: transaction._id.toString(),
			});

			// await session.commitTransaction();
			return {
				transaction: transaction._id.toString(),
			};
		} catch (err) {
			// await session.abortTransaction();
			throw err;
		} finally {
			// await session.endSession();
		}
	},
	outputFields: {
		...transactionField('transaction'),
	},
});

export const TransactionAddMutation = {
	...mutation,
};
