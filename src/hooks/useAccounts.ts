import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Account } from '../types/database';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Obter o usuário atual ao montar o componente
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        fetchAccounts(user.id);
      } else {
        setError('Usuário não autenticado');
        setLoading(false);
      }
    };

    getCurrentUser();

    // Configurar a inscrição para mudanças em tempo real
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const subscription = supabase
        .channel('accounts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Change received!', payload);
            fetchAccounts(user.id); // Atualizar dados quando houver mudanças
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    const unsubscribe = setupSubscription();
    
    return () => {
      // Limpar inscrição ao desmontar
      if (unsubscribe) {
        unsubscribe.then(unsub => {
          if (unsub) unsub();
        });
      }
    };
  }, []);

  async function fetchAccounts(uid: string | null = userId) {
    if (!uid) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Resetar estado de erro antes de buscar

      // Verificar conexão com Supabase
      const { error: connectionError } = await supabase
        .from('accounts')
        .select('count')
        .eq('user_id', uid)
        .single();

      if (connectionError) {
        console.error('Erro de conexão Supabase:', connectionError);
        throw new Error(`Erro de conexão com o banco de dados: ${connectionError.message}`);
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', uid)
        .order('item', { ascending: true });

      if (error) {
        console.error('Erro na consulta Supabase:', error);
        throw error;
      }

      console.log('Contas obtidas:', data?.length || 0, 'registros');
      setAccounts(data || []);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      let errorMessage = 'Ocorreu um erro ao buscar as contas';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Verificar erros específicos de rede
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Não foi possível conectar ao banco de dados. Verifique sua conexão de internet e tente novamente.';
        }
      }
      
      setError(errorMessage);
      setAccounts([]); // Resetar contas em caso de erro
    } finally {
      setLoading(false);
    }
  }

  async function addAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Verificar se o usuário está autenticado
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Adicionando conta:', account);

      // Validar campos obrigatórios
      if (!account.name || !account.cpf || !account.birth_date || !account.responsavel || !account.status) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      // Formatar data se necessário
      let formattedDate = account.birth_date;
      if (account.birth_date.includes('/')) {
        const [day, month, year] = account.birth_date.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert([{ 
          ...account, 
          birth_date: formattedDate, 
          user_id: userId // Adicionar o ID do usuário logado
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após a inserção');
      }

      setAccounts(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Erro ao adicionar conta:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar conta';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      // Verificar se o usuário está autenticado
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Atualizando conta:', id, updates);

      // Formatar data se estiver sendo atualizada e incluir '/'
      if (updates.birth_date?.includes('/')) {
        const [day, month, year] = updates.birth_date.split('/');
        updates.birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Verificar se a conta pertence ao usuário atual antes de atualizar
      const { data: accountCheck, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (checkError || !accountCheck) {
        throw new Error('Você não tem permissão para atualizar esta conta');
      }

      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId) // Garantir que apenas as contas do usuário sejam atualizadas
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após a atualização');
      }

      setAccounts(prev => prev.map(account => account.id === id ? data : account));
      return data;
    } catch (err) {
      console.error('Erro ao atualizar conta:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conta';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function deleteAccount(id: string) {
    try {
      // Verificar se o usuário está autenticado
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Excluindo conta:', id);

      // Verificar se a conta pertence ao usuário atual antes de excluir
      const { data: accountCheck, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (checkError || !accountCheck) {
        throw new Error('Você não tem permissão para excluir esta conta');
      }

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Garantir que apenas as contas do usuário sejam excluídas

      if (error) {
        console.error('Erro Supabase:', error);
        throw new Error(error.message);
      }

      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir conta';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  return {
    accounts,
    loading,
    error,
    addAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts: () => fetchAccounts(userId)
  };
}