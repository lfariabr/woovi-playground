import { useState, Suspense } from 'react';
import { TextField, Button, Box, Typography, Select, MenuItem, CircularProgress } from '@mui/material';
import { graphql, useLazyLoadQuery, usePaginationFragment, useSubscription } from 'react-relay';
import type { test_AccountQuery } from './__generated__/test_AccountQuery.graphql';
import type { test_AccountTransactionsFragment$key } from './__generated__/test_AccountTransactionsFragment.graphql';

// --- Relay GraphQL definitions ---
const AccountQuery = graphql`
  query test_AccountQuery($id: ID!, $first: Int = 5, $after: String) {
    account(id: $id) {
      id
      name
      balance
      ...test_AccountTransactionsFragment @arguments(first: $first, after: $after)
    }
  }
`;

const AccountTransactionsFragment = graphql`
  fragment test_AccountTransactionsFragment on Account
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 5 }
      after: { type: "String" }
    )
    @refetchable(queryName: "test_AccountTransactionsPaginationQuery")
  {
    transactions(first: $first, after: $after) @connection(key: "Account_transactions") {
      __id
      edges {
        node {
          id
          value
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
    name
    balance
  }
`;

const TransactionAddedSubscription = graphql`
  subscription test_TransactionAddedSubscription($input: TransactionAddedInput!, $connections: [ID!]!) {
    TransactionAdded(input: $input) {
      transaction @appendNode(connections: $connections, edgeTypeName: "TransactionEdge") {
        id
        value
        createdAt
      }
    }
  }
`;

// --- Page Component ---
const TestPage = () => {
  const [accountId, setAccountId] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [queryAccountId, setQueryAccountId] = useState<string | null>(null);

  return (
    <main>
      <Typography variant="h4" gutterBottom>Test Page</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Account ID"
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          size="small"
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          onClick={() => setQueryAccountId(accountId)}
          disabled={!accountId}
        >
          Load Account
        </Button>
      </Box>

      {queryAccountId && (
        <Suspense fallback={<CircularProgress />}>
          <AccountSection accountId={queryAccountId} pageSize={pageSize} setPageSize={setPageSize} />
        </Suspense>
      )}
    </main>
  );
};

function AccountSection({ accountId, pageSize, setPageSize }: { accountId: string; pageSize: number; setPageSize: (n: number) => void }) {
  const data = useLazyLoadQuery<test_AccountQuery>(AccountQuery, { id: accountId, first: pageSize });
  const {
    data: accountData,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious
  } = usePaginationFragment<test_AccountTransactionsFragment$key>(AccountTransactionsFragment, data.account);

  // Subscription for real-time updates
  useSubscription({
    subscription: TransactionAddedSubscription,
    variables: {
      input: { accountId },
      connections: [accountData?.transactions?.__id],
    },
    // No skip: Only render this component if accountId is valid
  });

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Account: {accountData.name}</Typography>
        <Typography variant="subtitle1">Balance: R$ {accountData.balance}</Typography>
      </Box>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>Transactions</Typography>
          <Select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            size="small"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
          </Select>
        </Box>
        <Box>
          {accountData.transactions.edges.map(({ node }) => (
            <Box key={node.id} sx={{ mb: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
              <Typography variant="body2">Amount: {node.value}</Typography>
              <Typography variant="caption">Date: {node.createdAt}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => loadPrevious(pageSize)}
            disabled={!hasPrevious || isLoadingPrevious}
          >Prev</Button>
          <Button
            variant="outlined"
            onClick={() => loadNext(pageSize)}
            disabled={!hasNext || isLoadingNext}
          >Next</Button>
        </Box>
      </Box>
    </>
  );
}

export default TestPage;
