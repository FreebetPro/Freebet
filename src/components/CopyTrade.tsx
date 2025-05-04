import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Play, Pause, CheckCircle2, XCircle, Clock, Settings, Filter, 
  DollarSign, TrendingUp, Users, AlertTriangle, User, Bell, HelpCircle, 
  Download, Search, ChevronDown, ChevronLeft, ChevronRight, Copy
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { supabase } from '../lib/supabase';

interface BettingHouse {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
  cpf: string;
  balance: number;
  lastBet: string;
  status: 'success' | 'error' | 'pending';
}

interface Promotion {
  title: string;
  platform: string;
  odds: number;
  value?: number;
}

const CopyTrade: React.FC = () => {
  // State for main account
  const [mainAccount, setMainAccount] = useState({
    balance: 5000,
    openBets: 1200,
    dailyProfit: 750,
  });

  // State for child accounts
  const [childAccounts, setChildAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [bettingHouses, setBettingHouses] = useState<BettingHouse[]>([]);
  const [loadingBettingHouses, setLoadingBettingHouses] = useState(true);
  const [selectedBettingHouse, setSelectedBettingHouse] = useState('');

  // State for configuration
  const [stake, setStake] = useState<number>(10);
  const [useFreebet, setUseFreebet] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [betType, setBetType] = useState<'back' | 'lay'>('back');
  const [delay, setDelay] = useState<number>(2);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Sample promotions
  const promotions: Promotion[] = [
    { title: 'Flamengo vs Palmeiras', platform: 'Bet365', odds: 5.0 },
    { title: 'Freebet', platform: 'Betfair', value: 20 },
    { title: 'Vasco vs Fluminense', platform: 'Betano', odds: 4.5 },
  ];

  // Sample indicator data
  const indicatorCards = [
    { title: "Operações Copiadas Hoje", value: "10" },
    { title: "Operações Copiadas na Semana", value: "50" },
    { title: "Operações Copiadas no Mês", value: "200" },
    { title: "Taxa de Sucesso", value: "85%" },
  ];

  // Sample execution status data
  const executionStatus = [
    {
      fonte: "João Silva",
      operacao: "Union x Cruzeiro - Over 2.5 @ 1.90",
      cpf: "GABRIEL HENRIQUE",
      stake: "R$ 100,00",
      status: { text: "Concluído", color: "text-[#28a745]" },
    },
    {
      fonte: "Lucro Certo",
      operacao: "Flamengo x Palmeiras - 1X2 @ 2.10",
      cpf: "kaiky dos santos",
      stake: "R$ 100,00",
      status: { text: "Em Andamento", color: "text-[#ff9800]" },
    },
    {
      fonte: "João Silva",
      operacao: "São Paulo x Corinthians - Over 1.5 @ 1.50",
      cpf: "Maria Silva",
      stake: "R$ 100,00",
      status: { text: "Falha", color: "text-[#dc3545]" },
    },
  ];

  // Sample operations report data
  const operations = [
    {
      date: "12/04/2025 14:30",
      source: "João Silva",
      operation: "Union x Cruzeiro - Over 2.5",
      cpf: "GABRIEL HENRIQUE",
      bettingHouse: "Bet365",
      odd: "1.90",
      stake: "R$ 100,00",
      status: "Concluído"
    },
    {
      date: "12/04/2025 14:32",
      source: "Lucro Certo",
      operation: "Flamengo x Palmeiras - 1X2",
      cpf: "kaiky dos santos",
      bettingHouse: "Betano",
      odd: "2.10",
      stake: "R$ 100,00",
      status: "Concluído"
    },
    {
      date: "12/04/2025 14:35",
      source: "João Silva",
      operation: "São Paulo x Corinthians - Over 1.5",
      cpf: "Maria Silva",
      bettingHouse: "Sportingbet",
      odd: "1.50",
      stake: "R$ 100,00",
      status: "Falha"
    },
  ];

  // Fetch accounts from Supabase
  useEffect(() => {
    const fetchAccounts = async () => {
      fetchBettingHouses();
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('accounts')
          .select('id, name, cpf')
          .order('name');

        if (error) {
          throw error;
        }

        // Transform the data to match our Account interface
        const transformedAccounts = data.map(account => ({
          id: account.id,
          name: account.name,
          cpf: account.cpf,
          balance: Math.floor(Math.random() * 1000), // Random balance for demo
          lastBet: Math.random() > 0.5 ? `Back ${(Math.random() * 3 + 1).toFixed(1)}` : '-',
          status: Math.random() > 0.7 ? 'success' : Math.random() > 0.4 ? 'pending' : 'error'
        } as Account));

        setChildAccounts(transformedAccounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch betting houses from Supabase
  const fetchBettingHouses = async () => {
    try {
      setLoadingBettingHouses(true);
      const { data, error } = await supabase
        .from('betting_houses')
        .select('id, name')
        .order('name');

      if (error) {
        throw error;
      }

      setBettingHouses(data || []);
    } catch (error) {
      console.error('Error fetching betting houses:', error);
    } finally {
      setLoadingBettingHouses(false);
    }
  };

  // Toggle account selection
  const handleToggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId) 
        : [...prev, accountId]
    );
  };
  // Form fields for configuration
  const formFields = [
    {
      id: "copytradeSource",
      label: "Selecionar Fonte de Copytrade",
      type: "select",
      placeholder: "Selecione a Fonte",
    },
    {
      id: "cpfsToReplicate",
      label: "CPFs para Replicar",
      type: "scroll-area",
      height: "89.19px",
    },
    
    {
      id: "baseStake",
      label: "Stake Base (R$)",
      type: "input",
      placeholder: "Ex.: R$ 100,00",
    },
    {
      id: "riskLimit",
      label: "Limite de Risco (R$)",
      type: "input",
      placeholder: "Ex.: R$ 500,00",
    },
  ];

  const handleExecuteBet = () => {
    // Implement bet execution logic
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Filter operations based on search term
  const filteredOperations = operations.filter(op => 
    op.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);

  // Calculate paginated operations
  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 md:p-8 pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Bot Copytrade</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Meu Perfil</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Configure e monitore suas operações de copytrade</p>
          </div>
        
        </div>
      </div>

      {/* Indicators Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {indicatorCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      

      {/* Configuration Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Configurar Copytrade</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecionar Fonte de Copytrade
            </label>
            <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Selecione a Fonte</option>
              <option value="joao">João Silva</option>
              <option value="lucro">Lucro Certo</option>
            </select>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Casa de Apostas
              </label>
              <select 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedBettingHouse}
                onChange={(e) => setSelectedBettingHouse(e.target.value)}
              >
                <option value="">Selecione a Casa de Apostas</option>
                {loadingBettingHouses ? (
                  <option value="" disabled>Carregando casas de apostas...</option>
                ) : (
                  bettingHouses.map(house => (
                    <option key={house.id} value={house.id}>
                      {house.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stake Base (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="100,00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de Risco (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="500,00"
                  />
                </div>
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mt-4"
            >
              <Play className="w-4 h-4" />
              Iniciar Copytrade
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPFs para Replicar
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center p-4">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">Carregando contas...</span>
                </div>
              ) : childAccounts.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Nenhuma conta encontrada
                </div>
              ) : (
                <div>
                  <div className="sticky top-0 bg-white border-b pb-2 mb-1 flex items-center">
                    <input
                      type="text"
                      placeholder="Buscar CPF..."
                      className="w-full p-2 text-sm border rounded-md"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {childAccounts
                      .filter(account => 
                        account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        account.cpf.includes(searchTerm)
                      )
                      .map(account => (
                        <label key={account.id} className="flex items-center p-2 hover:bg-gray-50 rounded border-l-2 border-transparent hover:border-l-blue-500 transition-colors">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            checked={selectedAccounts.includes(account.id)}
                            onChange={() => handleToggleAccount(account.id)}
                          />
                          <div className="ml-2 flex flex-col">
                            <span className="text-xs font-medium text-gray-900">{account.name}</span>
                            <span className="text-xs text-gray-500">{account.cpf}</span>
                          </div>
                        </label>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {selectedAccounts.length} CPFs selecionados
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedAccounts([])} 
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Limpar seleção
                </button>
                <button 
                  onClick={() => setSelectedAccounts(childAccounts.map(a => a.id))} 
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Selecionar todos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Relatórios de Operações */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Relatórios de Operações Copiadas</h2>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-8 pr-4 py-2 border rounded w-full md:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <select
              className="border rounded p-2 w-full md:w-auto"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Casa de Aposta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Odd</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stake</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOperations.map((op, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.source}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{op.operation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.cpf}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.bettingHouse}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.odd}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{op.stake}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      op.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      op.status === 'Falha' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {op.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredOperations.length)} de {filteredOperations.length} registros
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyTrade;