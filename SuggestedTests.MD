# Suggested Tests

## Backend

1. Access Railway Backend:
```bash
https://woovi-playground-server.up.railway.app/graphql
```

2. Try querying accounts
```graphql
query {
  accounts(first: 5) {
    edges {
      node {
        id
        accountNumber
        balance
        userTaxId
        createdAt
        updatedAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

3. Try adding one account
```graphql
mutation {
  AccountAdd(input: {
    accountNumber: "<ACCOUNT_NUMBER>"
    balance: "<BALANCE>"
    userTaxId: "<USER_TAX_ID>"
    name: "<NAME>"
    clientMutationId: "XXXX"
  }) {
    account {
      id
      accountNumber
      balance
      name
    }
    clientMutationId
  }
}
```

4. Try creating a transaction
```graphql
mutation {
  createTransaction(input: {
    value: "<VALUE>"
    senderAccountId: "<SENDER_ACCOUNT_ID>"
    receiverAccountId: "<RECEIVER_ACCOUNT_ID>"
    idempotencyKey: "<IDEMPOTENCY_KEY>"
    clientMutationId: "XXXX"
  }) {
    transaction {
      id
      value
      senderAccountId
      receiverAccountId
      createdAt
    }
    clientMutationId
  }
}
```

5. Other commands
```bash
https://github.com/lfariabr/woovi-playground/blob/main/apps/server/schema/examples.graphql
```

## Frontend

1. Access Frontend:
```bash
https://woovi-playground-app.up.railway.app/admin
```

2. Try searching for one account that exists (ID: "1")

3. Try searching for one account that does not exist (ID: "999")

4. Try creating a transaction from account "1" to account "2"
The balance should be removed from sender and added to receiver

