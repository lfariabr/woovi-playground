import { Box, Container, Typography, MenuItem, Select, Button, Paper } from '@mui/material';
import { useState, useEffect, Suspense } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import TransactionList from './TransactionList';
import CreateTransaction from './CreateTransaction';
import { useTransactionHistory, useTransactionHistoryData } from './useTransactionHistory';

interface TransactionNode {
  id: string;
  value: number | string;
  createdAt: string;
  senderAccountId: string;
  receiverAccountId?: string;
  description?: string;
  type?: string;
}

interface Props {
  accountId: string;
}

export default function AccountSection({ accountId }: Props) {
  const [limit, setLimit] = useState<number>(5);
  const [manualTransactions, setManualTransactions] = useState<Array<{node: TransactionNode}>>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  useEffect(() => {
    const handleTransactionCreated = (event: CustomEvent) => {      
      setRefreshTrigger(prev => prev + 1);
      fetchLatestTransactions();
    };
    
    const fetchLatestTransactions = () => {
      setTimeout(() => {
        fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetLatestTransactions($id: ID!, $limit: Int!) {
                account(id: $id) {
                  transactions(first: $limit) {
                    edges {
                      node {
                        id
                        value
                        senderAccountId
                        receiverAccountId
                        createdAt
                        type
                      }
                    }
                  }
                }
              }
            `,
            variables: { id: accountId, limit: 10 }
          }),
        })
        .then(res => res.json())
        .then(data => {
          if (data.data?.account?.transactions?.edges) {
            const newTransactions = data.data.account.transactions.edges.map((edge: any) => ({
              node: {
                ...edge.node,
                value: typeof edge.node.value === 'string' ? parseFloat(edge.node.value) : edge.node.value,
                type: edge.node.type || 
                  (edge.node.senderAccountId === accountId ? 'SENT' : 'RECEIVED')
              }
            }));
            setManualTransactions(newTransactions);
          }
        })
        .catch(err => console.error('Erro ao buscar transações:', err));
      }, 500);
    };
    
    window.addEventListener('transaction:created', handleTransactionCreated as EventListener);
    
    return () => {
      window.removeEventListener('transaction:created', handleTransactionCreated as EventListener);
    };
  }, [accountId]);
  
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" sx={{ 
          color: 'primary.main', 
          mb: 3, 
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Account Details
        </Typography>

        <Suspense fallback={<Typography>Carregando detalhes da conta...</Typography>}>
          <AccountContent 
            accountId={accountId} 
            limit={limit}
            onLimitChange={setLimit}
            manualTransactions={manualTransactions}
            refreshTrigger={refreshTrigger}
          />
        </Suspense>
      </Paper>
    </Container>
  );
}

// Account's content Component
function AccountContent({
  accountId,
  limit,
  onLimitChange,
  manualTransactions,
  refreshTrigger
}: {
  accountId: string;
  limit: number;
  onLimitChange: (limit: number) => void;
  manualTransactions: Array<{node: TransactionNode}>;
  refreshTrigger: number;
}) {
  const accountData = useLazyLoadQuery(
    graphql`
      query AccountSectionQuery($id: ID!) {
        account(id: $id) {
          id
          name
          balance
          transactions(first: 10) {
            edges {
              node {
                id
                value
                senderAccountId
                receiverAccountId
                createdAt
                type
              }
            }
          }
        }
      }
    `,
    { id: accountId },
    { fetchKey: refreshTrigger }
  );
  
  const account = accountData?.account || null;
  
  if (!account) {
    return (
      <Box>
        <Typography variant="body1" color="error">
          Conta não encontrada ou erro na consulta.
        </Typography>
      </Box>
    );
  }
  
  const balance = account.balance || '0';
  const name = account.name || 'Conta';
  
  const serverTransactions = account?.transactions?.edges || [];
  const allTransactions = [...manualTransactions, ...serverTransactions];
  
  const uniqueTransactions = Array.from(
    new Map(allTransactions.map(tx => [tx.node.id, tx])).values()
  );
  
  const sortedTransactions = [...uniqueTransactions].sort((a, b) => {
    const dateA = new Date(a.node.createdAt).getTime();
    const dateB = new Date(b.node.createdAt).getTime();
    return dateB - dateA;
  });
  
  const limitedTransactions = sortedTransactions.slice(0, limit);
  
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Account: {name}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Balance: R$ {balance}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1">
          Transactions
        </Typography>
        
        <Select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </Box>

      <TransactionList 
        transactions={limitedTransactions} 
      />
      
      <Box mt={4}>
        <CreateTransaction 
          accountId={accountId} 
          accountNumber={name}
        />
      </Box>
    </Box>
  );
}
