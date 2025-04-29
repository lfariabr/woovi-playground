// run at main directory:
// node subscribeTransactionMade.js
const { createClient } = require('graphql-ws');

const client = createClient({
  url: 'ws://localhost:4000/graphql/ws',
});

(async () => {
  const onNext = (data) => {
    console.log('Transaction subscription event received:', JSON.stringify(data, null, 2));
  };

  const onError = (err) => {
    console.error('Subscription error:', err);
  };

  const onComplete = () => {
    console.log('Subscription complete');
  };

  const unsubscribe = client.subscribe(
    {
      query: `
        subscription {
          TransactionAdded(input: {clientSubscriptionId: "test"}) {
            transaction {
              id
              senderAccountId
              receiverAccountId
              value
              createdAt
            }
            clientSubscriptionId
          }
        }
      `,
    },
    {
      next: onNext,
      error: onError,
      complete: onComplete,
    }
  );

  setTimeout(() => {
    unsubscribe();
    console.log('Unsubscribed after 5 minutes');
  }, 5 * 60 * 1000);
})();