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
- [x] `TransactionModel.ts`/ `TransactionType.ts`/ `TransactionLoader.ts` (opcional)/ `transactionFields.ts`/ `transactionMutations.ts`/ `TransactionAddedSubscription.ts` (opcional)
- [x] Criar tag `v1.2.0` da entrega

### tag v1.3.0
- [x] Criar `techstack.md`[_challenge/techstack.md](https://github.com/lfariabr/woovi-playground/tree/main/_challenge/techstack.md)
- [x] Atualizar backlog com as atualizações dos últimos 2 dias

### tag v1.4.0
- [x] Criar constant chamada TransactionConnection em `TransactionType.ts` (Relay para conexão das transações)
- [x] Reutilizar a conexão em outro módulo em `TransactionFields.ts` expondo a lista de transações
- [x] Linkar a conexão do TransactionType em `AccountType.ts`, adicionando o campo 'transactions' em AccounType
- [x] Relacionar Transações ao `accountId` (referência)
```GraphiQL teste
query {
  accounts(last: 5) {
    edges {
      node {
        id
        accountNumber
        transactions(first: 5) {
          edges {
            node {
              value
              sender { accountNumber }
              receiver { accountNumber }
              createdAt
            }
          }
        }
      }
    }
  }
}
```

### tag v1.5.0
- [x] (Optional) Transaction data-loader
```GraphiQL test Data Loader implementation
query {
  accounts(first: 5) {
    edges {
      node {
        id
        accountNumber
        transactions(first: 5) {
          edges {
            node {
              value
              createdAt
            }
          }
        }
      }
    }
  }
}
```
- [x] Validated data-loader implementation by putting a console log comment @ `TransactionLoader.ts` `batchTransactionsByAccountIds`
```console log message used to validate implementation
console.log('[DataLoader] Fetching transactions for accountIds:', accountIds);
```

### tag v1.6.0
- [x] Ajustado o fluxo de Transactions para ser dinâmico. A versão anterior estava hardcoded no `TransactionFields.ts`
- [x] Criado `TransactionController` com a lógica de adicionar/remover transações
- [x] Importado Zod para validação de dados no `Controller`
- [x] Implementada verificação de idempotencyKey para garantir operações únicas
- [x] Tratada race condition no MongoDB usando `inc` para garantir a consistência do saldo
- [x] Adicionado error handling estruturado para falhas de banco de dados (logging aprimorado)
- [x] Bloqueio de auto-transferência: remetente e destinatário precisam ser contas diferentes
- [x] Adicionada validação de entrada com erros GraphQL claros (input inválido, conta não encontrada, saldo insuficiente, idempotencyKey duplicada, etc.)
- [x] Log estruturado para todos os eventos críticos e erros de transações
- [x] Implementado fallback seguro para erro de chave duplicada no MongoDB (idempotency race condition)
- [x] Melhorada a modularidade e a manutenibilidade do código para facilitar futuras integrações e novas funcionalidades
- [x] Documentação e backlog atualizados para refletir o novo fluxo de transações

### tag v1.7.0
- [x] Criado e expandido o conjunto de testes unitários com Jest para Accounts e Transactions
- [x] Adicionados testes de mutation e query 
- [x] Os testes cobrem: Criação de registros, Validações de entrada, Execução de mutations, Consulta de dados (queries)
- [x] Adicionado tsconfig.server.json para compatibilidade do ts com ts-jest
- [x] Reestruturada a organização da pasta de testes
```run tests
npx jest --clearCache
npx jest
```

### tag v1.8.0
- [x] Atualizando arquivo `schema.graphql`[apps/server/schema/schema.graphql](https://github.com/lfariabr/woovi-playground/tree/main/apps/server/schema/schema.graphql) para adicionar novas queries e mutations
- [x] Criar arquivo `examples.graphql`[apps/server/schema/examples.graphql](https://github.com/lfariabr/woovi-playground/tree/main/apps/server/schema/examples.graphql) com queries de exemplo
Extras:
- [x] Criei um endpoint para poder dar fetch em uma única conta por ID

### tag v1.9.0
- [x] Conferir se o refactor do Transaction não quebrou o subscription - quebrou... já ajustado!
- [x] Refatorei o fluxo de Transações para arquitetura mais modular e limpa
- [x] Corrigi e reataivei o Subscription GraphQL TransactionAdded 
- [x] Permiti que a mutation de transação aceite accountNumber, ObjectId ou Relay globalId para origem/destino
- [x] Testei eventos de transação em Redis PubSub utilizando scripts auxiliares (subscribeAccountAdded.js, subscribeTransactionMade.js - [scripts/dev/](https://github.com/lfariabr/woovi-playground/tree/main/scripts/dev)) devido a limitações de validação no GraphiQL Playground
- [x] Adicionei suporte para utilizar o accountNumber em requisições de API para busca de contas e realização de transferências, visando facilitar os testes durante o desafio. Em ambiente de produção, o ideal seria trabalhar apenas com identificadores únicos, como os ObjectIds do MongoDB, que também continuam disponíveis.

---

## In Progress

## Next Tasks

- [ ] Front-end: Relay‐style pagination + useSubscription for TransactionAdded(input:{})

---

## Requisitos básicos do desafio (Core)

- [x] Implementar **Transação entre duas contas**:
  - [x] Mutation: `createTransaction(fromAccountId, toAccountId, amount)`
  - [x] Subtrair `amount` da conta de origem
  - [x] Somar `amount` na conta de destino
  - [x] Validar saldo insuficiente na origem antes de completar a transação
  - [x] Criar registro de transação

---

## Extras e Melhorias (opcionais)

- [x] Criação de Release no GitHub com changelog
- [x] Subscription para Transaction adicionada
- [x] Testes unitários com Jest
- [x] Arquivo `.graphql` ou `.http` com queries de exemplo
- [ ] Dockerfile + docker-compose.yml para ambiente local
- [ ] Paginação real com `after`, `cursor` funcional para Accounts e Transactions
