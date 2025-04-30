import { Box, Typography } from '@mui/material';
import styles from '../styles/TransactionList.module.css';
import { formatDate } from '../helpers/formatter';

interface TransactionNode {
  id: string;
  value: number;
  createdAt: string;
  senderAccountId: string;
  sender?: string;
  description?: string;
}

interface TransactionListProps {
  transactions: ReadonlyArray<{ node: TransactionNode }>;
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Box>
      {transactions.map(({ node }) => (
        <Box key={node.id} className={styles.transactionItem}>
          <Typography variant="body2">Amount: {node.value}</Typography>
          <Typography variant="caption" display="block">
            Date: {formatDate(node.createdAt)}
          </Typography>
          <Typography variant="caption" display="block">
            {node.description && <>Description: {node.description}</>}
          </Typography>
          <Typography variant="caption" display="block">Sender Account Number: {node.senderAccountId}</Typography>
        </Box>
      ))}
    </Box>
  );
}
