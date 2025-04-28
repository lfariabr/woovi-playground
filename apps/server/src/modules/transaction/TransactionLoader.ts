import { createLoader } from '@entria/graphql-mongo-helpers';
import { registerLoader } from '../loader/loaderRegister';
import { Transaction } from './TransactionModel';
import DataLoader from 'dataloader';

const { Wrapper, getLoader, clearCache, load, loadAll } = createLoader({
	model: Transaction,
	loaderName: 'TransactionLoader',
});

registerLoader('TransactionLoader', getLoader);

export const TransactionLoader = {
	Transaction: Wrapper,
	getLoader,
	clearCache,
	load,
	loadAll,
};

// Batch function: receives array of accountIds, returns array of arrays of transactions
async function batchTransactionsByAccountIds(accountIds: readonly string[]) {
	// Testing implementation:
	// console.log('[DataLoader] Fetching transactions for accountIds:', accountIds);
	const transactions = await Transaction.find({
	  $or: [
		{ senderAccountId: { $in: accountIds } },
		{ receiverAccountId: { $in: accountIds } },
	  ],
	}).sort({ createdAt: -1 });
  
	// Map: accountId -> [transactions]
	const transactionsMap: Record<string, any[]> = {};
	accountIds.forEach(id => { transactionsMap[id] = []; });
	transactions.forEach(tx => {
	  if (transactionsMap[tx.senderAccountId.toString()]) transactionsMap[tx.senderAccountId.toString()].push(tx);
	  if (transactionsMap[tx.receiverAccountId.toString()]) transactionsMap[tx.receiverAccountId.toString()].push(tx);
	});
  
	return accountIds.map(id => transactionsMap[id]);
  }
  
  // Export the DataLoader instance
  export const transactionsByAccountIdLoader = new DataLoader(batchTransactionsByAccountIds);