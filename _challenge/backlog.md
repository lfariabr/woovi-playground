# Woovi Challenge - TODO List

## Changelog:

### tag v1.0.0
- [x] Criar branch `feat/crud-bank-relay`
- [x] Forkar repositório e configurar Git remoto
- [x] Criar estrutura de **Account** seguindo o padrão do `Message`:
- [x] `AccountModel.ts` / `AccountType.ts` / `AccountLoader.ts` / `accountFields.ts`
- [x] Criar mutations para Account:
- [x] `AccountAddMutation.ts`
- [x] Criar conexão Relay (`AccountConnection`)
- [x] Implementar paginação estilo Relay para Accounts
- [x] Criar `_challenge/` folder para documentação
- [x] Criar README inicial e queries para teste
- [x] Fazer merge da feature com `main`
- [x] Testes websocket

### tag v1.1.0
- [x] Criar sistema de **Account Subscriptions**:
- [x] `AccountAddedSubscription.ts`
- [x] `accountSubscriptions.ts`
- [x] Publicar evento no `AccountAddMutation`
- [x] Testar Subscription via WebSocket Playground
- [x] Criar tag `v1.1.0` da entrega inicial

  ```javascript console tests
  const ws = new WebSocket('ws://localhost:4000/graphql/ws');
  ws.onopen = () => console.log('WebSocket connected!');
  ws.onclose = () => console.log('WebSocket disconnected!');
  ws.onerror = (error) => console.error('WebSocket error:', error);
  ws.onmessage = (msg) => console.log('WebSocket message:', msg.data);
  ```
### tag v1.2.0
- [x] `TransactionModel.ts`
- [x] `TransactionType.ts`
- [x] `TransactionLoader.ts` (opcional)
- [x] `transactionFields.ts`
- [x] `transactionMutations.ts`
- [x] `TransactionAddedSubscription.ts` (opcional)
- [x] Criar tag `v1.2.0` da entrega inicial

### tag v1.3.0
- [X] Criar `techstack.md`[_challenge/techstack.md](https://github.com/lfariabr/woovi-playground/tree/main/_challenge/techstack.md)
- [X] Atualizar backlog com as atualizações dos últimos 2 dias

---

## In Progress

## Next Tasks

- [ ] Relacionar Transações ao `accountId` (referência)
- [ ] (Optional) Transaction data-loader
- [ ] Front-end: Relay‐style pagination + useSubscription for TransactionAdded(input:{})

---

## Requisitos básicos do desafio (Core)

- [x] Implementar **Transação entre duas contas**:
  - [x] Mutation: `createTransaction(fromAccountId, toAccountId, amount)`
  - [x] Subtrair `amount` da conta de origem
  - [x] Somar `amount` na conta de destino
  - [x] Validar saldo insuficiente na origem antes de completar a transação
  - [ ] Criar registro de transação

---

## Extras e Melhorias (opcionais)

- [X] Criação de Release no GitHub com changelog
- [ ] Subscription para Transaction adicionada
- [ ] Testes unitários com Jest
- [ ] Dockerfile + docker-compose.yml para ambiente local
- [ ] Paginação real com `after`, `cursor` funcional para Accounts e Transactions
- [ ] Arquivo `.graphql` ou `.http` com queries de exemplo
