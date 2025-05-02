# Woovi Challenge - TODO List

## Changelog:

### tag v1.0.0: feature/crud-bank-relay
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

### tag v1.1.0: feature/account-subscriptions
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
### tag v1.2.0: feature/transaction-model
- [x] `TransactionModel.ts`/ `TransactionType.ts`/ `TransactionLoader.ts` (opcional)/ `transactionFields.ts`/ `transactionMutations.ts`/ `TransactionAddedSubscription.ts` (opcional)
- [x] Criar tag `v1.2.0` da entrega

### tag v1.3.0: feature/techstack
- [x] Criar `techstack.md`[_challenge/techstack.md](https://github.com/lfariabr/woovi-playground/tree/main/_challenge/techstack.md)
- [x] Atualizar backlog com as atualizações dos últimos 2 dias

### tag v1.4.0: feature/transaction-connection
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

### tag v1.5.0: feature/data-loader
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

### tag v1.6.0: feature/transaction-controller
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

### tag v1.7.0: feature/jest-tdd
- [x] Criado e expandido o conjunto de testes unitários com Jest para Accounts e Transactions
- [x] Adicionados testes de mutation e query 
- [x] Os testes cobrem: Criação de registros, Validações de entrada, Execução de mutations, Consulta de dados (queries)
- [x] Adicionado tsconfig.server.json para compatibilidade do ts com ts-jest
- [x] Reestruturada a organização da pasta de testes
```run tests
npx jest --clearCache
npx jest
```

### tag v1.8.0: feature/graphql-api-improvements
- [x] Atualizando arquivo `schema.graphql`[apps/server/schema/schema.graphql](https://github.com/lfariabr/woovi-playground/tree/main/apps/server/schema/schema.graphql) para adicionar novas queries e mutations
- [x] Criar arquivo `examples.graphql`[apps/server/schema/examples.graphql](https://github.com/lfariabr/woovi-playground/tree/main/apps/server/schema/examples.graphql) com queries de exemplo
Extras:
- [x] Criei um endpoint para poder dar fetch em uma única conta por ID

### tag v1.9.0: feature/transaction-refactor
- [x] Conferir se o refactor do Transaction não quebrou o subscription - quebrou... já ajustado!
- [x] Refatorei o fluxo de Transações para arquitetura mais modular e limpa
- [x] Corrigi e reataivei o Subscription GraphQL TransactionAdded 
- [x] Permiti que a mutation de transação aceite accountNumber, ObjectId ou Relay globalId para origem/destino
- [x] Testei eventos de transação em Redis PubSub utilizando scripts auxiliares (subscribeAccountAdded.js, subscribeTransactionMade.js - [scripts/dev/](https://github.com/lfariabr/woovi-playground/tree/main/scripts/dev)) devido a limitações de validação no GraphiQL Playground
- [x] Adicionei suporte para utilizar o accountNumber em requisições de API para busca de contas e realização de transferências, visando facilitar os testes durante o desafio. Em ambiente de produção, o ideal seria trabalhar apenas com identificadores únicos, como os ObjectIds do MongoDB, que também continuam disponíveis.

### tag v1.10.0: feature/frontend-setup
- [x] pnpm relay-compiler
- [x] Refatoração do backend de Transações: mais modular, limpo e com melhor tratamento de erros.
- [x] Modelos (Account, Transaction) agora exigem todos os campos obrigatórios (name, createdAt).
- [x] Todos os testes atualizados e passando com as novas validações
- [x] Novo playground front-end em [apps/web/src/pages/test.tsx]: base pronta em Relay/React para futuras melhorias (paginação Relay, subscriptions em tempo real, UX, etc).

### tag v1.11.0: feature/frontend-pagination
- [x] Página test com a possibilidade de busca por AccountId e exibição simples de balance + histórico de transactions
- [x] Front-end: Relay‐style pagination + useSubscription for TransactionAdded(input:{})
- [x] implementado usePaginationFragment em `accountSection.tsx` com botões "NEXT" e "PREV" 
- [x] implementado useSubscription em `accountSection.tsx` para transações
- [x] adicionado scripts/createTransaction para validar a criação de transações e disparo de subscriptions no frontend
- [x] adicionado script validateSchema para validar o schema do backend com o schema do frontend
- [x] criado página admin em `apps/web/src/pages/admin.tsx` com a possibilidade de busca por AccountId e exibição de saldo e transações

### tag v1.12.0: feature/graphql-relay-alignment
- [x] Padronização do fluxo relay: Queries, fragments e subscriptions agora são definidos inline nos componentes, seguindo o padrão Relay Modern (baseado no fluxo de Message já existente no playground)
- [x] Tipagem TypeScript refatorada. Agora todos os hooks do Relay agora usam os tipos gerados automaticamente, eliminando erros de unknown. Código + seguro / legível.
- [x] Compatibilidade total com Relay Compiler: corrigidos todos os problemas de geração de artefatos, warnings e erros de schema
- [x] Correção do tipo de transação: Campo value de Transaction agora é Float no schema GraphQL, garantindo consistência entre backend e frontend
- [x] Refatoração de TransactionList: Aceita agora arrays readonly (alinhando com os tipos gerados pelo Relay)


### tag v1.13.0: feature/refactor-transaction-decimal
- [x] Refatoração completa do tratamento de valores monetários para usar Decimal128 no backend, garantindo precisão em todas as operações 
- [x] Alteração do campo value de Transaction para Float no schema GraphQL, alinhando backend e frontend e eliminando problemas de serialização
- [x] Ajuste das queries, mutations e modelos para suportar valores decimais de forma segura e consistente
- [x] Atualização do frontend para exibir corretamente valores positivos (recebidos) e negativos (enviados) nas transações, com formatação padronizada
- [x] Criação do helper formatter.tsx para padronizar exibição de datas e valores no frontend
- [x] Melhoria na UX na página de admin, exibindo saldos e transações formatados
- [x] Correção e atualização de todos os testes (unitários e integração) para cobrir o novo fluxo decimal

### tag v1.14.0: feature/dockerfile
- [x] Criei `Dockerfile` para web e outro para o server
- [x] Criei `docker-compose.yml` para rodar o ambiente local
- [x] Criei `.dockerignore` para ignorar arquivos e pastas inúteis na imagem
- [x] Atualizei dependências do `package.json`, `tsconfig.json` e `pnpm-lock.yaml`
- [x] Validei o build Docker das aplicações até o boot do app em ambiente containerizado
> Observação: O CSS do Next.js standalone não está carregando devido a um detalhe de assets, mas a entrega principal (infraestrutura Docker pronta e funcional) está concluída. Tratar assets na próxima task.
Ref: https://nextjs.org/docs/pages/api-reference/config/next-config-js/output#automatically-copying-traced-files
```Docker commands
docker builder prune -f
docker-compose build --no-cache
docker-compose up
```

### tag v1.15.0: feature/css-at-docker
- [x] Refatoração do Dockerfile do frontend para Next.js standalone:
  - Copiados explicitamente `.next/standalone`, `.next/static`, `public` e `server.js` para os paths esperados no container.
  - Garantia de build consistente para SSR, assets e CSS.
- [x] Ajuste no `next.config.js`:
  - Adicionado rewrites para proxy transparente de `/graphql` para o backend no Docker Compose.
- [x] Refatoração do fetch GraphQL (`network.ts`):
  - Endpoint agora sempre relativo (`/graphql`), funcionando para SSR e client-side sem depender de env.
- [x] Ajuste do endpoint de subscriptions (WebSocket):
  - `.env` atualizado para usar `ws://localhost:4000/graphql/ws`, permitindo conexão do browser local ao backend no container.
- [x] Testes e validação do fluxo admin:
  - Busca de transações funcionando via proxy, sem erros de DNS ou endpoint.
  - Documentação prática criada em `_challenge/docker.md` com guia passo a passo para conteinerização Next.js.
- [x] Correções menores: `.gitignore` atualizado para versionar `.env` local, inclusão de `_document.tsx` para garantir CSS/estilos.

### tag v1.16.0: feature/frontend-tests
- [x] Criar cobertura de testes para o frontend
- [x] Acessar `/woovi-playground/apps/web` e executar `pnpm test`
- [x] No caso do server, continua sendo `npx jest --clearCache` e `npx jest` no `root`

### tag v1.17.0: feature/frontend-transaction
- [x] Criar tela para realizar transações
- [x] Implementar lógica de transação no frontend
- [x] Testar transações no frontend
- [x] Criar script para limpar o banco de dados em `apps/server/scripts/clear-db.js`
- [x] Ajuste do Transaction Schema tratando idempotentKey, senderAccountId e receiverAccountId como unique:true (removido)

### tag v1.18.0: feature/transaction-fix
- [x] Diagnosticar e corrigir problema de exibição de transações no frontend:
- [x] O problema estava relacionado ao cache do Relay que não atualizava automaticamente após novas transações
- [x] Implementado sistema de eventos para notificar o frontend sobre novas transações (`transaction:created`)
- [x] Adicionado `refreshTrigger` como `fetchKey` para forçar o Relay a recarregar dados
- [x] Adicionado recarregamento da página após uma transação como solução temporária
- [x] Resolvido problema de tipos no TypeScript para permitir manipulação correta dos dados de transação
- [x] Corrigido para exibir corretamente transações enviadas e recebidas com seus respectivos sinais

---

## In Progress

## Next Tasks
- [ ] Corrigir a tela de frontend dando um erro se Account não encontrada
- [ ] Corrigir transação não exibida em tempo real no frontend
- [ ] Subir ambiente final Railway
- [ ] Adicionar as releases no github 

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
- [x] Paginação real com `after`, `cursor` funcional para Accounts e Transactions
- [x] Dockerfile + docker-compose.yml para ambiente local
