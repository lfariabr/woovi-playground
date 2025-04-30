import { Box, Typography, Select, MenuItem, Button } from '@mui/material';
import { graphql, useLazyLoadQuery, usePaginationFragment, useSubscription } from 'react-relay';
import TransactionList from './TransactionList';
import styles from '../styles/AccountSection.module.css';
import type { AccountSectionQuery } from '../__generated__/AccountSectionQuery.graphql';
import type { AccountSectionFragment$key } from '../__generated__/AccountSectionFragment.graphql';
import type { AccountSectionPaginationQuery } from '../__generated__/AccountSectionPaginationQuery.graphql';

// Inline GraphQL definitions (replicando fluxo Message)
const AccountSectionQuery = graphql`
  query AccountSectionQuery($id: ID!, $first: Int) {
    account(id: $id) {
      ...AccountSectionFragment @arguments(first: $first)
    }
  }
`;

const AccountSectionFragment = graphql`
  fragment AccountSectionFragment on Account
    @argumentDefinitions(
      first: { type: "Int", defaultValue: 5 }
      after: { type: "String" }
    )
    @refetchable(queryName: "AccountSectionPaginationQuery")
  {
    transactions(first: $first, after: $after) @connection(key: "Account_transactions") {
      __id
      edges {
        node {
          id
          value
          createdAt
          senderAccountId
          description
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

const AccountSectionSubscription = graphql`
  subscription AccountSectionSubscription($input: TransactionAddedInput!, $connections: [ID!]!) {
    TransactionAdded(input: $input) {
      transaction @appendNode(connections: $connections, edgeTypeName: "TransactionEdge") {
        id
        value
        createdAt
        senderAccountId
        description
      }
    }
  }
`;

interface AccountSectionProps {
  accountId: string;
  pageSize: number;
  setPageSize: (n: number) => void;
}

export default function AccountSection({ accountId, pageSize, setPageSize }: AccountSectionProps) {
  const data = useLazyLoadQuery<AccountSectionQuery>(AccountSectionQuery, { id: accountId, first: pageSize }, { fetchKey: pageSize });
  const {
    data: accountData,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious
  } = usePaginationFragment<AccountSectionPaginationQuery, AccountSectionFragment$key>(AccountSectionFragment, data.account);

  useSubscription({
    subscription: AccountSectionSubscription,
    variables: {
      input: { accountId },
      connections: [accountData?.transactions?.__id],
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>Account Details</div>
      <Box className={styles.accountSectionHeader}>
        <Typography variant="h6" className={styles.accountSectionName}>Account: {accountData.name}</Typography>
        <Typography variant="subtitle1" className={styles.accountSectionBalance}>Balance: R$ {accountData.balance}</Typography>
      </Box>
      <Box>
        <Box className={styles.transactionsHeader}>
          <Typography variant="subtitle1" className={styles.transactionsTitle}>Transactions</Typography>
          <Select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            size="small"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
          </Select>
        </Box>
        <TransactionList
          transactions={accountData.transactions.edges}
        />
        <Box className={styles.pagination}>
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
    </div>
  );
}
