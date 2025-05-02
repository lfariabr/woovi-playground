import { useLazyLoadQuery, useQueryLoader, PreloadedQuery } from 'react-relay';
import { useCallback, useEffect, useState } from 'react';

import { TransactionHistoryQuery } from './TransactionHistoryQuery';
import type { TransactionHistoryQuery as TransactionHistoryQueryType } from './__generated__/TransactionHistoryQuery.graphql';

/**
 * Hook para carregar e atualizar o histórico de transações
 * 
 * @param accountId ID da conta para consultar as transações
 * @param first Número de transações para carregar
 * @param autoRefresh Se true, recarrega automaticamente os dados a cada intervalo
 * @returns Um objeto com os dados das transações e uma função para forçar atualização
 */
export function useTransactionHistory(
  accountId: string,
  first: number = 10,
  autoRefresh: boolean = false,
) {
  // Criamos um loading para exibir estado de carregamento
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Criamos um estado para controlar se o componente está montado
  const [isMounted, setIsMounted] = useState(true);
  
  // Usamos o QueryLoader do Relay para gerenciar o carregamento da query
  const [
    queryReference,
    loadQuery,
    disposeQuery,
  ] = useQueryLoader<TransactionHistoryQueryType>(TransactionHistoryQuery);

  // Função para atualizar os dados
  const refreshTransactions = useCallback(() => {
    if (!accountId) return;
    
    setIsRefreshing(true);
    
    // Dispõe da query anterior para evitar vazamentos de memória
    disposeQuery();
    
    // Carrega a query novamente com os mesmos parâmetros
    loadQuery({
      accountId,
      first,
    }, {
      fetchPolicy: 'network-only', // Importante: sempre busca do servidor
    });
    
    // Reset do estado após carregamento
    setTimeout(() => {
      if (isMounted) {
        setIsRefreshing(false);
      }
    }, 500);
  }, [accountId, first, disposeQuery, loadQuery, isMounted]);

  // Inicializa a query quando o componente monta
  useEffect(() => {
    loadQuery({
      accountId,
      first,
    });
    
    // Cleanup para evitar vazamentos
    return () => {
      setIsMounted(false);
      disposeQuery();
    };
  }, [accountId, first, loadQuery, disposeQuery]);

  // Se autoRefresh estiver habilitado, recarrega periodicamente
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (isMounted) {
        refreshTransactions();
      }
    }, 5000); // A cada 5 segundos
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshTransactions, isMounted]);

  return {
    queryReference,
    refreshTransactions,
    isRefreshing,
  };
}

/**
 * Hook para consumir os dados do histórico de transações
 * Deve ser usado em conjunto com useTransactionHistory
 */
export function useTransactionHistoryData(
  queryReference: PreloadedQuery<TransactionHistoryQueryType> | null
) {
  const data = queryReference 
    ? useLazyLoadQuery<TransactionHistoryQueryType>(
        TransactionHistoryQuery,
        { accountId: '', first: 10 }, // Os parâmetros vêm do queryReference, isso é ignorado
        { fetchPolicy: 'store-or-network' }
      )
    : null;
  
  return data;
}
