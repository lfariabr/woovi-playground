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
	  const senderIdString = tx.senderAccountId.toString();
	  const receiverIdString = tx.receiverAccountId.toString();
	  
	  // Ensure the document is converted to a simple object before cloning
	  // Important: Preserve the original _id field for GraphQL to generate the correct globalId
	  let txObj: any;
	  
	  if (tx.toObject) {
	    // For Mongoose documents, use toObject()
	    txObj = tx.toObject();
	  } else {
	    // Fallback for simple objects
	    txObj = JSON.parse(JSON.stringify(tx));
	  }

	  // Ensure _id is present and accessible for GraphQL
	  if (!txObj.id && txObj._id) {
	    txObj.id = txObj._id.toString();
	  }
	  
	  if (transactionsMap[senderIdString]) {
	    // For sender: add with type SENT
	    const sentTx = { ...txObj, type: 'SENT' };
	    transactionsMap[senderIdString].push(sentTx);
	  }
	  
	  if (transactionsMap[receiverIdString]) {
	    // For receiver: add with type RECEIVED
	    const receivedTx = { ...txObj, type: 'RECEIVED' };
	    transactionsMap[receiverIdString].push(receivedTx);
	  }
	});
  
	return accountIds.map(id => transactionsMap[id]);
  }
  
  // Export the DataLoader instance
  export const transactionsByAccountIdLoader = new DataLoader(batchTransactionsByAccountIds);