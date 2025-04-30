import { useState, Suspense } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import AccountSection from '../components/AccountSection';

// --- Page Component ---
// NOTE: Production scenario, this page should only allow the logged-in user to view their own transaction history.
// For admin/test/demo purposes, any Account ID can be queried here. Adjust access logic as needed for real-world use.
const TransactionsAdminCheckpointPage = () => {
  const [accountId, setAccountId] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [queryAccountId, setQueryAccountId] = useState<string | null>(null);

  return (
    <main>
      <Typography variant="h4" gutterBottom>Transactions – Admin Checkpoint</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Busque qualquer Account ID pra ver saldo e transações. (Admin/Test mode)
      </Typography>
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
        <Suspense fallback={<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Loading account data…</Typography></Box>}>
          <AccountSection
            key={queryAccountId + '-' + pageSize}
            accountId={queryAccountId}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        </Suspense>
      )}
    </main>
  );
};

export default TransactionsAdminCheckpointPage;
