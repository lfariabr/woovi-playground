import type { Document, Model } from 'mongoose';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<IAccount>(
	{
		accountNumber: {
			type: String,
			description: 'The account number',
			unique: true,
			required: true,
		},
		balance: {
			type: mongoose.Schema.Types.Decimal128,
			description: 'The balance of the account',
		},
		userTaxId: {
			type: String,
			ref: 'User',
			unique: true,
			required: true,
		},
		name: {
			type: String,
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
	name: string;
	balance: mongoose.Schema.Types.Decimal128;
	userTaxId: string;
	createdAt: Date;
	updatedAt: Date;
} & Document;

export const Account: Model<IAccount> = mongoose.model('Account', Schema);
