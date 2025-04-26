import { GraphQLNonNull } from 'graphql';
import { withFilter } from 'graphql-subscriptions';
import { Account } from '../AccountModel';
import { AccountType } from '../AccountType';
import { redisPubSub } from '../../pubSub/redisPubSub';
import { PUB_SUB_EVENTS } from '../../pubSub/pubSubEvents';

// Enhanced debug: log every stage and return a clear error if payload is missing
export const AccountAddedSubscription = {
  type: new GraphQLNonNull(AccountType),
  subscribe: withFilter(
    (...args) => {
      console.log('SUBSCRIPTION subscribe args:', args);
      const iterator = redisPubSub.asyncIterator(PUB_SUB_EVENTS.ACCOUNT.ADDED);
      const originalNext = iterator.next.bind(iterator);
      iterator.next = (...nextArgs) => {
        return originalNext(...nextArgs).then((result) => {
          console.log('SUBSCRIPTION iterator.next result:', result);
          return result;
        });
      };
      return iterator;
    },
    async (payload, context) => {
      console.log('SUBSCRIPTION filter payload:', payload);
      return true;
    }
  ),
  resolve: async (payload) => {
    console.log('SUBSCRIPTION resolve payload:', payload);
    if (!payload) {
      // Instead of throwing, return a clear error object for debugging
      return {
        id: 'ERROR',
        name: 'Subscription payload was undefined',
        balance: 0,
      };
    }
    const account = await Account.findById(payload.account);
    return account;
  },
};