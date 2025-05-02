import { Box, Button, CircularProgress, TextField, Typography, Alert } from '@mui/material';
import { useState, useCallback } from 'react';
import { useLazyLoadQuery, commitMutation, graphql } from 'react-relay';
import { Environment } from 'relay-runtime';
import { createEnvironment } from '../relay/environment';

interface CreateTransactionProps {
  accountId: string;
  accountNumber: string;
  onTransactionSuccess?: () => void;
}

// GraphQL mutation document
const createTransactionMutation = graphql`
  mutation CreateTransactionMutation($input: TransferInput!) {
    createTransaction(input: $input) {
      transaction {
        id
        value
        senderAccountId
        receiverAccountId
        createdAt
        description
        type
      }
      clientMutationId
    }
  }
`;

export default function CreateTransaction({ accountId, accountNumber, onTransactionSuccess }: CreateTransactionProps) {
  const [accountReceiverNumber, setAccountReceiverNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [receiverLookupError, setReceiverLookupError] = useState<string | null>(null);

  const resetForm = () => {
    setAccountReceiverNumber("");
    setAmount("");
    setDescription("");
    setReceiverId(null);
    setReceiverLookupError(null);
    setError(null);
    setSuccess(null);
  };

  // Function to search _id by account number
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

  const createTransaction = useCallback(async () => {
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
      
      const clientMutationId = "frontend";
      
      const input = {
        value: parseFloat(amount),
        senderAccountId: accountId,
        receiverAccountId: receiverId,
        description: description || 'Transferência via frontend',
        idempotencyKey,
        clientMutationId,
      };

      // Using Relay's commitMutation instead of fetch
      commitMutation(createEnvironment(), {
        mutation: createTransactionMutation,
        variables: { input },
        onCompleted: (response, errors) => {
          console.log('Transaction created successfully:', response);
          if (errors) {
            console.error('GraphQL errors:', errors);
            setError(errors.map(e => e.message).join(', '));
            return;
          }
          
          try {
            const localStorageKey = `transactions_${accountId}`;
            const existingTransactions = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
            
            const newTransaction = {
              id: `manual_${Date.now()}`,
              senderAccountId: accountId,
              receiverAccountId: receiverId,
              value: -parseFloat(amount), // Negative for sender
              createdAt: new Date().toISOString(),
              type: 'SENT',
              description: description || 'Transferência via frontend'
            };
            
            existingTransactions.unshift(newTransaction);
            localStorage.setItem(localStorageKey, JSON.stringify(existingTransactions));
            
            const receiverStorageKey = `transactions_${receiverId}`;
            const receiverTransactions = JSON.parse(localStorage.getItem(receiverStorageKey) || '[]');
            const receiverTransaction = {
              ...newTransaction,
              value: Math.abs(parseFloat(amount)), // Positive for receiver
              type: 'RECEIVED'
            };
            receiverTransactions.unshift(receiverTransaction);
            localStorage.setItem(receiverStorageKey, JSON.stringify(receiverTransactions));
            
            console.log('Transação salva no localStorage');
          } catch (e) {
            console.error('Erro ao salvar transação no localStorage:', e);
          }
          
          setAccountReceiverNumber("");
          setAmount("");
          resetForm();
          setSuccess("Transação criada com sucesso!");
          
          // Trying to force page reload after a short delay
          // TODO
          // to allow the server to process the transaction completely
          setTimeout(() => {
            console.log("Recarregando a página para exibir novas transações...");
            window.location.reload();
          }, 800);

          try {
            const updateKey = `transaction_update_${Date.now()}`;
            localStorage.setItem(updateKey, JSON.stringify({
              timestamp: Date.now(),
              accountId: accountId,
              receiverId: receiverId,
              amount: parseFloat(amount)
            }));
            
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.startsWith('transaction_update_') && key !== updateKey) {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                const timestamp = data.timestamp || 0;
                // Remove flags older than 5 minutes
                if (Date.now() - timestamp > 5 * 60 * 1000) {
                  localStorage.removeItem(key);
                }
              }
            });
            
            const updateEvent = new CustomEvent('transaction:created', {
              detail: {
                senderAccountId: accountId,
                receiverAccountId: receiverId,
                amount: parseFloat(amount),
                timestamp: Date.now()
              }
            });
            window.dispatchEvent(updateEvent);
          } catch (e) {
            console.error('Error storing update flag:', e.message);
          }

          if (onTransactionSuccess) {
            onTransactionSuccess();
          }
        },
        onError: err => {
          console.error('Error creating transaction:', err);
          setError(err.message || "Failed to create transaction");
        },
      });
    } catch (err: any) {
      console.error('Exception in createTransaction:', err);
      setError(err.message || "Failed to create transaction");
    } finally {
      setIsPending(false);
    }
  }, [accountId, receiverId, amount, onTransactionSuccess]);

  const isFormValid =
    !!accountReceiverNumber.trim() &&
    !!amount.trim() &&
    parseFloat(amount) > 0 &&
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
          sx={{ mr: 2, mb: 2 }}
          error={!!receiverLookupError}
          helperText={receiverLookupError}
        />
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          size="small"
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="small"
          sx={{ mr: 2, mb: 2 }}
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