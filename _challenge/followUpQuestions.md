1. como voce garante consistencia do saldo ?
2. como voce garante que não duplica ? 
r: Schema.index({ senderAccountId: 1, idempotentKey: 1 }, { unique: true });

3. como lida com concorrencia ?
4. como seu ledger integra com outros sistemas de pagametnos ?
5. como fica o seu ledger integrando com as apis da woovi ?
6. pensou em double entry accounting ?
7. como voce categoriza as entradas no ledger ?
8. o idempotencyID é global ou por conta ?
r: per account

9. não faz sentido zod parse para resultados de aggregates do mongodb 
10. eu consumiria esse graphql no frontend usando relay também:
- como voce lida com sincronia ?
- num cenário de replica set qual write e read concern recomendados ?