// import { GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLID } from 'graphql';
// import Transaction from '../../models/transaction.model';
// import Account from '../../models/account.model';
// import { TransactionType } from './TransactionType'; // You may need to define this GraphQLObjectType

// export const transactionMutations = {
//   createTransaction: {
//     type: TransactionType,
//     args: {
//       accountId: { type: new GraphQLNonNull(GraphQLID) },
//       amount: { type: new GraphQLNonNull(GraphQLFloat) },
//       description: { type: GraphQLString },
//     },
//     resolve: async (_: any, { accountId, amount, description }: any) => {
//       const transaction = new Transaction({ accountId, amount, description });
//       await transaction.save();
//       await Account.findByIdAndUpdate(accountId, { $inc: { balance: amount } });
//       return transaction;
//     },
//   },
// };