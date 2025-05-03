import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface BettingOperation {
  id: string;
  date: string;
  time: string;
  game_name: string;
  house1_id: string;
  house2_id: string;
  bet_amount: number;
  result: number;
  profit: number;
  promotion_type: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OperationAccount {
  id: string;
  operation_id: string;
  account_id: string;
  betting_house_id: string;
  stake: number;
  role: string;
  is_winner: boolean;
}

interface MonthlySummary {
  id: string;
  year: number;
  month: number;
  total_bets: number;
  total_profit: number;
  total_investment: number;
  roi: number;
}

export function useBettingOperations() {
  const [operations, setOperations] = useState<BettingOperation[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Iniciando hook useBettingOperations');
    
    // Função para buscar operações
    const fetchOperations = async () => {
      try {
        console.log('Buscando operações...');
        const { data, error } = await supabase
          .from('betting_operations')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        console.log('Operações carregadas:', data?.length);
        setOperations(data || []);
      } catch (err) {
        console.error('Erro ao buscar operações:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Função para buscar resumos mensais
    const fetchMonthlySummaries = async () => {
      try {
        const { data, error } = await supabase
          .from('monthly_summaries')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false });

        if (error) throw error;
        setMonthlySummaries(data || []);
      } catch (err) {
        console.error('Erro ao buscar resumos mensais:', err);
      }
    };

    // Carrega os dados iniciais
    fetchOperations();
    fetchMonthlySummaries();

    // Configura o listener em tempo real
    console.log('Configurando listener em tempo real...');
    const subscription = supabase
      .channel('betting_operations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'betting_operations'
        },
        (payload) => {
          console.log('Evento em tempo real recebido:', payload);
          
          // Atualiza imediatamente baseado no tipo de evento
          if (payload.eventType === 'INSERT') {
            console.log('Nova operação inserida:', payload.new);
            setOperations(prev => {
              const newOperations = [payload.new as BettingOperation, ...prev];
              console.log('Estado atualizado com nova operação. Total:', newOperations.length);
              return newOperations;
            });
          } else if (payload.eventType === 'UPDATE') {
            console.log('Operação atualizada:', payload.new);
            setOperations(prev => {
              const updatedOperations = prev.map(op => 
                op.id === payload.new.id ? payload.new as BettingOperation : op
              );
              console.log('Estado atualizado com operação modificada. Total:', updatedOperations.length);
              return updatedOperations;
            });
          } else if (payload.eventType === 'DELETE') {
            console.log('Operação removida:', payload.old);
            setOperations(prev => {
              const remainingOperations = prev.filter(op => op.id !== payload.old.id);
              console.log('Estado atualizado após remoção. Total:', remainingOperations.length);
              return remainingOperations;
            });
          }
          
          // Atualiza os resumos mensais
          fetchMonthlySummaries();
        }
      )
      .subscribe((status) => {
        console.log('Status da inscrição:', status);
      });

    // Cleanup
    return () => {
      console.log('Limpando hook useBettingOperations');
      subscription.unsubscribe();
    };
  }, []);

  async function addOperation(operation: Omit<BettingOperation, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('betting_operations')
        .insert([operation])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error adding operation:', err);
      throw err;
    }
  }

  async function addOperationAccounts(accounts: Omit<OperationAccount, 'id' | 'created_at' | 'updated_at'>[]) {
    try {
      const { data, error } = await supabase
        .from('operation_accounts')
        .insert(accounts)
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error adding operation accounts:', err);
      throw err;
    }
  }

  async function updateOperation(id: string, updates: Partial<Omit<BettingOperation, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('betting_operations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating operation:', err);
      throw err;
    }
  }

  async function updateOperationAccounts(
    operationId: string,
    accounts: Partial<Omit<OperationAccount, 'id' | 'created_at' | 'updated_at'>>[]
  ) {
    try {
      // First delete existing accounts
      await supabase
        .from('operation_accounts')
        .delete()
        .eq('operation_id', operationId);

      // Then insert new accounts
      const { data, error } = await supabase
        .from('operation_accounts')
        .insert(accounts.map(account => ({ ...account, operation_id: operationId })))
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating operation accounts:', err);
      throw err;
    }
  }

  async function deleteOperation(id: string) {
    try {
      const { error } = await supabase
        .from('betting_operations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting operation:', err);
      throw err;
    }
  }

  return {
    operations,
    monthlySummaries,
    loading,
    error,
    addOperation,
    addOperationAccounts,
    updateOperation,
    updateOperationAccounts,
    deleteOperation
  };
}