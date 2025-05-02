import { Box, Typography, Chip } from '@mui/material';
import styles from '../styles/TransactionList.module.css';
import { formatDate } from '../helpers/formatter';

export interface TransactionNode {
  id: string;
  value: number;
  createdAt: string;
  senderAccountId: string;
  receiverAccountId?: string;
  sender?: string;
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
      {transactions.map(({ node }) => {
        const isNegative = node.type === 'SENT' || node.value < 0;
        const displayValue = Math.abs(node.value);
        
        return (
          <Box 
            key={node.id} 
            className={`${styles.transactionItem} ${
              isNegative ? styles.transactionSent : styles.transactionReceived
            }`}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {isNegative ? '-' : '+'}{displayValue}
              </Typography>
              <Chip 
                label={isNegative ? 'Enviado' : 'Recebido'} 
                size="small"
                color={isNegative ? 'error' : 'success'}
                variant="outlined"
              />
            </Box>
            <Typography variant="caption" display="block">
              Data: {formatDate(node.createdAt)}
            </Typography>
            {isNegative ? (
              <Typography variant="caption" display="block">
                Para: {node.receiverAccountId || 'N/A'}
              </Typography>
            ) : (
              <Typography variant="caption" display="block">
                De: {node.senderAccountId || 'N/A'}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
