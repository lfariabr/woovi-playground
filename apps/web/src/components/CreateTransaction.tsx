import { Box, Button, CircularProgress, TextField, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { fetchAccountIdByNumber } from '../helpers/converter';

interface CreateTransactionProps {
  accountId: string;
}

export default function CreateTransaction({ accountId }: CreateTransactionProps) {
  // accountId (remetente) vem via prop

  const [accountReceiverNumber, setAccountReceiverNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // senderId sempre é accountId

  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [accountLookupError, setAccountLookupError] = useState<string | null>(null);
  const [receiverLookupError, setReceiverLookupError] = useState<string | null>(null);

  const resetForm = () => {
    setAccountReceiverNumber("");
    setAmount("");
    setReceiverId(null);
    setReceiverLookupError(null);
    setError(null);
    setSuccess(null);
  };

  // Function to search _id by account number
  // Apenas receiver lookup
  const lookupReceiverId = async (number: string) => {
    setReceiverLookupError(null);
    if (!number.trim()) {
      setReceiverId(null);
      return;
    }
    try {
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query AccountByIdQuery($id: ID!) { account(id: $id) { id accountNumber name } }`,
          variables: { id: number }
        })
      });
      const data = await res.json();
      const found = data?.data?.account;
      if (found && found.id) {
        setReceiverId(found.id);
      } else {
        setReceiverId(null);
        setReceiverLookupError('Conta de destino não encontrada');
      }
    } catch (err) {
      setReceiverLookupError('Erro ao buscar conta');
    }
  };

  const createTransaction = async () => {
    setIsPending(true);
    setError(null);
    setSuccess(null);
    try {
      if (!accountId || !receiverId || !amount) {
        throw new Error("Todos os campos são obrigatórios e as contas devem existir");
      }
      // Generate unique idempotencyKey
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('idempotencyKey:', idempotencyKey);
      const clientMutationId = "frontend";
      const graphqlEndpoint = "/graphql"; 
      const mutation = `
        mutation CreateTransaction($input: TransferInput!) {
          createTransaction(input: $input) {
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
      `;
      const senderAccountMongoId = await fetchAccountIdByNumber(accountId);
      const receiverAccountMongoId = await fetchAccountIdByNumber(receiverId);

      const input = {
        value: amount,
        senderAccountId: senderAccountMongoId,
        receiverAccountId: receiverAccountMongoId,
        idempotencyKey,
        clientMutationId,
      };
      const res = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables: { input } })
      });
      const data = await res.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "Erro na API");
      }
      if (data.data?.createTransaction?.transaction?.id) {
        resetForm();
        setSuccess("Transação criada com sucesso!");
      } else {
        setError("Erro ao criar transação.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create transaction");
    } finally {
      setIsPending(false);
    }
  };


  const isFormValid =
    !!accountReceiverNumber.trim() &&
    !!amount.trim() &&
    !!accountId &&
    !!receiverId &&
    !isPending;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Criar transferência a partir da conta: <b>{accountId}</b>
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Account Receiver ID"
          value={accountReceiverNumber}
          onChange={async (e) => {
            setAccountReceiverNumber(e.target.value);
            await lookupReceiverId(e.target.value);
          }}
          size="small"
          sx={{ mr: 2 }}
          error={!!receiverLookupError}
          helperText={receiverLookupError}
        />
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          size="small"
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          onClick={createTransaction}
          disabled={!isFormValid}
        >
          Criar Transação
        </Button>
      </Box>
      {isPending && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Creating transaction…</Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
}