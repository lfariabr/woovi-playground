import { getDataloaders } from '../modules/loader/loaderRegister';
import { transactionsByAccountIdLoader as TransactionsByAccountIdLoaderClass } from '../modules/transaction/TransactionLoader';

const getContext = () => {
	const dataloaders = getDataloaders();

	// instantiate DataLoaders per request in the context function
	return {
		dataloaders,
		transactionsByAccountIdLoader: TransactionsByAccountIdLoaderClass,
	} as const;
};

export { getContext };
