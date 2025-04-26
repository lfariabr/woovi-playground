// import Transaction from '../../models/transaction.model';
// import Account from '../../models/account.model';

// export const transactionResolvers = {
//   Query: {
//     transactions: async (
//       _: any,
//       { accountId, first }: { accountId: string; first: number }
//     ) => {
//       const transactions = await Transaction.find({ accountId })
//         .sort({ timestamp: -1 })
//         .limit(first || 10);

//       return {
//         edges: transactions.map((tx) => ({
//           node: tx,
//           cursor: tx.id,
//         })),
//         pageInfo: {
//           endCursor: transactions.length
//             ? transactions[transactions.length - 1].id
//             : null,
//           hasNextPage: false,
//         },
//       };
//     },
//   },
//   Mutation: {
//     createTransaction: async (
//       _: any,
//       {
//         accountId,
//         amount,
//         description,
//       }: { accountId: string; amount: number; description?: string }
//     ) => {
//       const transaction = new Transaction({
//         accountId,
//         amount,
//         description,
//       });

//       await transaction.save();

//       await Account.findByIdAndUpdate(accountId, {
//         $inc: { balance: amount },
//       });

//       return transaction;
//     },
//   },
// };