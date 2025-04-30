// node apps/server/scripts/createTransaction.js

const fetch = require('node-fetch');

async function createTransaction() {
  const res = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation {
          createTransaction(input: {
            value: 10
            senderAccountId: "444"
            receiverAccountId: "999"
            idempotencyKey: "unique-key-${Date.now()}"
          }) {
            transaction {
              id
              value
              senderAccountId
              receiverAccountId
              idempotencyKey
              createdAt
            }
          }
        }
      `
    }),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

createTransaction();