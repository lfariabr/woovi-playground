# Woovi Challenge - TODO List

## Etapas concluídas

- [x] Criar branch `feat/crud-bank-relay`
- [x] Forkar repositório e configurar Git remoto
- [x] Criar estrutura de **Account** seguindo o padrão do `Message`:
  - [x] `AccountModel.ts`
  - [x] `AccountType.ts`
  - [x] `AccountLoader.ts`
  - [x] `accountFields.ts`
- [x] Criar mutations para Account:
  - [x] `AccountAddMutation.ts`
- [x] Criar conexão Relay (`AccountConnection`)
- [x] Implementar paginação estilo Relay para Accounts
- [x] Criar `_challenge/` folder para documentação
- [x] Criar README inicial e queries para teste
- [x] Criar tag `v1.0.0` da entrega inicial
- [x] Fazer merge da feature com `main`

const ws = new WebSocket('ws://localhost:4000/graphql/ws');
ws.onopen = () => console.log('WebSocket connected!');
ws.onclose = () => console.log('WebSocket disconnected!');
ws.onerror = (error) => console.error('WebSocket error:', error);
ws.onmessage = (msg) => console.log('WebSocket message:', msg.data);

- [x] Criar sistema de **Account Subscriptions**:
  - [x] `AccountAddedSubscription.ts`
  - [x] `accountSubscriptions.ts`
  - [x] Publicar evento no `AccountAddMutation`
  - [x] Testar Subscription via WebSocket Playground

---

## Em andamento

### Replicar para **Transaction**:

- [x] `TransactionModel.ts`
- [x] `TransactionType.ts`
- [x] `TransactionLoader.ts` (opcional)
- [x] `transactionFields.ts`
- [x] `transactionMutations.ts`
- [x] `TransactionAddedSubscription.ts` (opcional)

## Próximas tarefas

- [ ] Implementar Relay-style pagination
- [ ] Relacionar Transações ao `accountId` (referência)
- [ ] (Optional) Transaction data-loader
- [ ] Front-end: Relay‐style pagination + useSubscription for TransactionAdded(input:{})

---

## Requisitos básicos do desafio (Core)

- [ ] Implementar **Transação entre duas contas**:
  - [ ] Mutation: `createTransaction(fromAccountId, toAccountId, amount)`
  - [ ] Subtrair `amount` da conta de origem
  - [ ] Somar `amount` na conta de destino
  - [ ] Criar registro de transação
  - [ ] Validar saldo insuficiente na origem antes de completar a transação

---

## Extras e Melhorias (opcionais)

- [ ] Subscription para Transaction adicionada
- [ ] Testes unitários com Jest
- [ ] Dockerfile + docker-compose.yml para ambiente local
- [ ] Criação de Release no GitHub com changelog
- [ ] Paginação real com `after`, `cursor` funcional para Accounts e Transactions
- [ ] Arquivo `.graphql` ou `.http` com queries de exemplo
