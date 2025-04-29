// run at main directory:
// node subscribeAccountAdded.js
const { createClient } = require('graphql-ws');

const client = createClient({
  url: 'ws://localhost:4000/graphql/ws',
});

(async () => {
  const onNext = (data) => {
    console.log('Subscription event received:', JSON.stringify(data, null, 2));
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
          AccountAdded(input: {clientSubscriptionId: "test"}) {
            account {
              id
              accountNumber
              balance
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

  // Optional: unsubscribe after 5 minutes
  setTimeout(() => {
    unsubscribe();
    console.log('Unsubscribed after 5 minutes');
  }, 5 * 60 * 1000);
})();