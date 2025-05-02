import { Box, Container, Typography, MenuItem, Select, Paper, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import TransactionList from './TransactionList';
import CreateTransaction from './CreateTransaction';

interface TransactionNode {
  id: string;
  value: number;
  createdAt: string;
  senderAccountId: string;
  receiverAccountId?: string;
  type?: 'SENT' | 'RECEIVED';
}

interface Props {
  accountId: string;
  pageSize?: number;
  setPageSize?: (size: number) => void;
}

export default function AccountSection({ accountId, pageSize = 5, setPageSize }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Array<{node: TransactionNode}>>([]);
  const [limit, setLimit] = useState(pageSize);

  // Update limit when pageSize prop changes
  useEffect(() => {
    if (pageSize) {
      setLimit(pageSize);
    }
  }, [pageSize]);

  // Handle limit changes
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    if (setPageSize) {
      setPageSize(newLimit);
    }
  };

  // Fetch account data directly with fetch
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setAccountData(null);
    
    fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetAccountData($id: ID!) {
            account(id: $id) {
              id
              name
              balance
            }
          }
        `,
        variables: { id: accountId }
      }),
    })
    .then(res => res.json())
    .then(result => {
      setIsLoading(false);
      
      if (!result.data || !result.data.account) {
        setError(`Conta ID "${accountId}" não encontrada`);
        return;
      }
      
      setAccountData(result.data.account);
      
      // Fetch transactions separately to avoid null reference errors
      fetchTransactions(accountId);
    })
    .catch(err => {
      console.error('Error loading account:', err);
      setIsLoading(false);
      setError('Erro ao carregar dados da conta');
    });
  }, [accountId]);
  
  // Separate function to fetch transactions
  const fetchTransactions = (id: string) => {
    fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetTransactions($id: ID!, $limit: Int!) {
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
        variables: { id, limit: 20 }
      }),
    })
    .then(res => res.json())
    .then(data => {
      // Verificação simples e direta para evitar erro de null reference
      if (!data?.data?.account?.transactions?.edges) {
        console.log('Dados de transações não disponíveis');
        setTransactions([]);
        return;
      }
      
      try {
        const txs = data.data.account.transactions.edges
          .filter((edge: any) => edge && edge.node)
          .map((edge: any) => ({
            node: {
              ...edge.node,
              // Garantir que value seja sempre um number
              value: typeof edge.node.value === 'string' ? parseFloat(edge.node.value) : Number(edge.node.value),
              // Garantir que type seja sempre 'SENT' ou 'RECEIVED'
              type: edge.node.type === 'SENT' || edge.node.type === 'RECEIVED' 
                ? edge.node.type 
                : (edge.node.senderAccountId === accountId ? 'SENT' : 'RECEIVED')
            }
          }));
        setTransactions(txs);
      } catch (err) {
        console.error('Error processing transactions:', err);
        setTransactions([]);
      }
    })
    .catch(err => {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Loading account data...</Typography>
        </Paper>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Verifique o ID da conta e tente novamente.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Render account data
  if (accountData) {
    const balance = accountData.balance || '0';
    const name = accountData.name || 'Conta';

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = a?.node?.createdAt ? new Date(a.node.createdAt).getTime() : 0;
      const dateB = b?.node?.createdAt ? new Date(b.node.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const limitedTransactions = sortedTransactions.slice(0, limit);

    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" sx={{ 
            color: 'primary.main', 
            mb: 3, 
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Detalhes da Conta
          </Typography>

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Conta: {name}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Saldo: R$ {balance}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1">
                Transações
              </Typography>
              
              <Select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                size="small"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </Box>

            {limitedTransactions.length > 0 ? (
              <TransactionList 
                transactions={limitedTransactions} 
              />
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">Nenhuma transação encontrada</Typography>
              </Box>
            )}
            
            <Box mt={4}>
              <CreateTransaction 
                accountId={accountId} 
                accountNumber={name}
              />
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Fallback for any other unexpected state
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, my: 4, borderRadius: 2 }}>
        <Alert severity="error">
          Um erro inesperado ocorreu. Tente novamente mais tarde.
        </Alert>
      </Paper>
    </Container>
  );
}
