import { Box, Typography, Chip } from '@mui/material';
import styles from '../styles/TransactionList.module.css';
import { formatDate } from '../helpers/formatter';

interface TransactionNode {
  id: string;
  value: number;
  createdAt: string;
  senderAccountId: string;
  receiverAccountId?: string;
  sender?: string;
  description?: string;
  type?: 'SENT' | 'RECEIVED';
}

interface TransactionListProps {
  transactions: ReadonlyArray<{ node: TransactionNode }>;
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Box>
      {transactions.length === 0 && (
        <Typography variant="body2" align="center" sx={{ padding: 2 }}>
          Nenhuma transação encontrada
        </Typography>
      )}
      {transactions.map(({ node }) => (
        <Box 
          key={node.id} 
          className={`${styles.transactionItem} ${
            node.type === 'SENT' ? styles.transactionSent : styles.transactionReceived
          }`}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              {node.type === 'SENT' ? '-' : '+'}{node.value}
            </Typography>
            <Chip 
              label={node.type === 'SENT' ? 'Enviado' : 'Recebido'} 
              size="small"
              color={node.type === 'SENT' ? 'error' : 'success'}
              variant="outlined"
            />
          </Box>
          <Typography variant="caption" display="block">
            Data: {formatDate(node.createdAt)}
          </Typography>
          {node.description && (
            <Typography variant="caption" display="block">
              Descrição: {node.description}
            </Typography>
          )}
          {node.type === 'SENT' ? (
            <Typography variant="caption" display="block">
              Para: {node.receiverAccountId || 'N/A'}
            </Typography>
          ) : (
            <Typography variant="caption" display="block">
              De: {node.senderAccountId || 'N/A'}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
