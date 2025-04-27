import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<IAccount>(
	{
		accountNumber: {
			type: String,
			description: 'The account number',
		},
		balance: {
			type: Number,
			description: 'The balance of the account',
		},
		userTaxId: {
			type: String,
			ref: 'User',
			unique: true,
			required: true,
		},
	},
	{
		collection: 'Account',
		timestamps: true,
	}
);

export type IAccount = {
	accountNumber: string;
	balance: number;
	userTaxId: string;
	createdAt: Date;
	updatedAt: Date;
} & Document;

export const Account: Model<IAccount> = mongoose.model('Account', Schema);
