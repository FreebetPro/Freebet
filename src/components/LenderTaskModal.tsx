import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Account } from '../types/database';
import { BettingHouse } from '../types/database';

type TaskType = 'custom' | 'verification-withdrawal' | 'verification-initial';

interface LenderTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const LenderTaskModal: React.FC<LenderTaskModalProps> = ({ isOpen, onClose, onSuccess, onError }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [bettingHouses, setBettingHouses] = useState<BettingHouse[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedBettingHouse, setSelectedBettingHouse] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('custom');
  const [taskTitle, setTaskTitle] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  // Obter o usuário logado quando o componente montar
  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };
  
  fetchCurrentUser();
}, []);

useEffect(() => {
  fetchAccounts();
  fetchBettingHouses();
}, [currentUser]); // Adiciona currentUser como dependência

  const fetchAccounts = async () => {
    try {
      // Se não tiver usuário logado, não faz nada
      if (!currentUser) return;
      
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, cpf, status')
        .eq('user_id', currentUser.id)  // Filtra apenas contas do usuário logado
        .order('name');
  
      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchBettingHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('betting_houses')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBettingHouses(data || []);
    } catch (error) {
      console.error('Error fetching betting houses:', error);
    }
  };

  const handleTaskTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TaskType;
    setTaskType(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount || !taskTitle.trim()) {
      onError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      // Primeiro, busque o emprestador associado à conta selecionada
      const { data: emprestador, error: emprestadorError } = await supabase
        .from('emprestadores')
        .select('id')
        .eq('account_id', selectedAccount)  // Supondo que a tabela emprestadores tenha uma coluna account_id
        .single();

      if (emprestadorError) {
        console.error('Erro ao buscar emprestador:', emprestadorError);
        throw new Error('Não foi possível encontrar um emprestador associado a esta conta');
      }

      if (!emprestador) {
        throw new Error('Não existe um emprestador associado a esta conta');
      }

      // Prepare task title with amount if it's a withdrawal verification
      const finalTitle = taskType === 'verification-withdrawal' && withdrawalAmount
        ? `${taskTitle} - R$ ${withdrawalAmount}`
        : taskTitle + (selectedBettingHouse ? ` - ${bettingHouses.find(h => h.id === selectedBettingHouse)?.name || ''}` : '');
        
        const { data, error } = await supabase
        .from('lender_tasks')
        .insert([{
          lender_id: emprestador.id, // Nome correto da coluna
          title: finalTitle.trim(),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      
      onSuccess('Tarefa criada com sucesso!');
      setSelectedAccount('');
      setTaskTitle('');
      setSelectedBettingHouse('');
      setTaskType('custom');
      setWithdrawalAmount('');
      onClose();
    } catch (error: any) {
      console.error('Error creating task:', error);
      onError(error.message || 'Erro ao criar tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Criar Nova Tarefa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta CPF
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.cpf} ({account.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Tarefa
            </label>
            <select
              value={taskType}
              onChange={handleTaskTypeChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="custom">Personalizada</option>
              <option value="verification-withdrawal">Verificação Facial para Saque</option>
              <option value="verification-initial">Verificação Inicial da Conta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Casa de Aposta
            </label>
            <select
              value={selectedBettingHouse}
              onChange={(e) => setSelectedBettingHouse(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma casa de aposta</option>
              {bettingHouses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da Tarefa
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título da tarefa"
              required
            />
          </div>

          {taskType === 'verification-withdrawal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor do Saque (R$)
              </label>
              <input
                type="text"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o valor do saque"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LenderTaskModal;