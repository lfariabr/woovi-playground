import { useState, Suspense } from 'react';
import { Box, Typography, CircularProgress, TextField, Button } from '@mui/material';
import AccountSection from '../components/AccountSection';
// TODO
export default function TransactionPage() {
  const [accountId, setAccountId] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [queryAccountId, setQueryAccountId] = useState<string | null>(null);

  return (
    <main>
      <Typography variant="h4" gutterBottom>Fazer uma Transferência</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Selecione um Account ID para realizar uma transação pelo frontend (Transaction/Test mode)
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
          disabled={!accountId.trim()}
        >
          LOAD ACCOUNT
        </Button>
      </Box>
      {queryAccountId && (
        <>
          <Suspense fallback={<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Loading…</Typography></Box>}>
            <AccountSection
              accountId={queryAccountId}
            />
          </Suspense>
        </>
      )}
    </main>
  );
}
