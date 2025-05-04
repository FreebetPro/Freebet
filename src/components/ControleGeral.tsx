import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency, parseCurrency } from '../utils/currency';
import { RefreshCw, ExternalLink, User, Bell, HelpCircle, Settings } from 'lucide-react';

interface BettingHouseBalance {
  name: string;
  totalBalance: number;
}

interface ManualBalances {
  protection: number;
  bankBalance: number;
  fintechBalance: number;
}

interface Props {
  value: number;
  onChange: (value: string) => void;
}

// Add betting house links mapping
const BETTING_HOUSE_LINKS: Record<string, string> = {
  'BateuBet': 'https://apretailer.com.br/click/67ddfba92bfa8178563c6135/186228/352025/subaccount',
  'BET365': 'https://www.bet365.bet.br/',
  'Betano': 'https://www.betano.bet.br/',
  'Betnacional': 'https://betnacional.bet.br/',
  'Betpix365': 'https://betpix365.bet.br/ptb/bet/main',
  'BR4': 'https://br4.bet.br/',
  'EsportivaBet': 'https://go.affiliapass.com?id=67d487cecbafd8001bbc93de',
  'EstrelaBet': 'https://apretailer.com.br/click/67ddfba92bfa81785c0d8668/182492/352025/subaccount',
  'KTO': 'https://www.kto.bet.br/login/',
  'Lotogreen': 'https://apretailer.com.br/click/67d8bc612bfa814c7b7a62b3/186144/352025/subaccount',
  'MC Games': 'https://go.affiliapass.com?id=67d4884fcbafd8001bbc93f6',
  'Novibet': 'https://go.affiliapass.com?id=67d986a5872f83001ab56252',
  'Superbet': 'https://superbet.bet.br/',
  'Vaidebet': 'https://vaidebet.bet.br/ptb/bet/main'
};

const ControleGeral = () => {
  const [balances, setBalances] = useState<BettingHouseBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [manualBalances, setManualBalances] = useState<ManualBalances>(() => {
    const saved = localStorage.getItem('manualBalances');
    return saved ? JSON.parse(saved) : { protection: 0, bankBalance: 0, fintechBalance: 0 };
  });
  const [metrics, setMetrics] = useState({
    totalAccounts: 0,
    documentsFinalized: 0,
    selfiesPending: 0,
    openHouses: 0,
    pendingVerifications: 0,
    fullVerified: 0,
    emOperacao: 0
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Carregar saldos manuais do usuário do banco de dados quando o usuário for autenticado
  useEffect(() => {
    if (currentUser) {
      fetchManualBalancesFromDB();
    }
  }, [currentUser]);

  // Função para buscar saldos manuais do banco de dados
  const fetchManualBalancesFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_balances')
        .select('*')
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transformar os dados do banco para o formato esperado pelo state
        const balancesObj = {
          protection: 0,
          bankBalance: 0,
          fintechBalance: 0
        };
        
        data.forEach(item => {
          switch(item.type) {
            case 'protection':
              balancesObj.protection = Number(item.amount) || 0;
              break;
            case 'bank':
              balancesObj.bankBalance = Number(item.amount) || 0;
              break;
            case 'fintech':
              balancesObj.fintechBalance = Number(item.amount) || 0;
              break;
          }
        });
        
        setManualBalances(balancesObj);
        localStorage.setItem('manualBalances', JSON.stringify(balancesObj));
      }
    } catch (err) {
      console.error('Erro ao buscar saldos manuais:', err);
    }
  };

  // Função para atualizar os saldos manuais no banco de dados
  const updateManualBalancesInDB = async (type: string, amount: number) => {
    if (!currentUser) return;
    
    try {
      // Verifica se o registro já existe
      const { data, error: selectError } = await supabase
        .from('manual_balances')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('type', type);
      
      if (selectError) throw selectError;
      
      const now = new Date();
      
      if (data && data.length > 0) {
        // Atualiza registro existente
        const { error: updateError } = await supabase
          .from('manual_balances')
          .update({
            amount: amount,
            last_updated: now.toISOString()
          })
          .eq('id', data[0].id);
        
        if (updateError) throw updateError;
      } else {
        // Cria novo registro
        const { error: insertError } = await supabase
          .from('manual_balances')
          .insert({
            user_id: currentUser.id,
            type: type,
            amount: amount,
            last_updated: now.toISOString()
          });
        
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error(`Erro ao atualizar saldo manual (${type}):`, err);
    }
  };

  useEffect(() => {
    // Busca o usuário logado atual
    const fetchCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          setCurrentUser(user);
          console.log('Usuário autenticado:', user);
        } else {
          // Redirecionar para página de login se não houver usuário autenticado
          console.error('Nenhum usuário autenticado');
          window.location.href = '/login'; // Redirecionando para login quando não há usuário
        }
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        setError(err instanceof Error ? err.message : 'Erro ao obter usuário autenticado');
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Somente busca dados quando tiver o usuário autenticado
    if (currentUser) {
      fetchBalances();
      fetchMetrics();

      // Inscreve-se para mudanças nas account_betting_houses relacionadas ao usuário atual
      const accountBettingHousesSubscription = supabase
        .channel('account_betting_houses_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'account_betting_houses'
          },
          async (payload) => {
            console.log('Atualização em account_betting_houses recebida:', payload);
            
            // Verificar se a alteração está relacionada a uma conta do usuário atual
            const accountId = payload.new?.account_id || payload.old?.account_id;
            if (accountId) {
              const { data } = await supabase
                .from('accounts')
                .select('user_id')
                .eq('id', accountId)
                .single();
                
              // Só atualiza os dados se a conta pertencer ao usuário atual
              if (data && data.user_id === currentUser.id) {
                setLastUpdate(new Date());
                fetchBalances();
              }
            }
          }
        )
        .subscribe();
        
      // Inscreve-se para mudanças nas accounts do usuário atual
      const accountsSubscription = supabase
        .channel('accounts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log('Atualização em accounts recebida:', payload);
            setLastUpdate(new Date());
            fetchMetrics();
          }
        )
        .subscribe();
        
      // Inscreve-se para mudanças nos saldos manuais do usuário atual
      const manualBalancesSubscription = supabase
        .channel('manual_balances_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'manual_balances',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log('Atualização em manual_balances recebida:', payload);
            fetchManualBalancesFromDB();
          }
        )
        .subscribe();

      return () => {
        accountBettingHousesSubscription.unsubscribe();
        accountsSubscription.unsubscribe();
        manualBalancesSubscription.unsubscribe();
      };
    }
  }, [currentUser]);

  const handleManualBalanceChange = (type: keyof ManualBalances, value: string) => {
    const numericValue = parseCurrency(value);
    setManualBalances(prev => ({
      ...prev,
      [type]: numericValue
    }));
    setLastUpdate(new Date());
    
    // Atualizar no banco de dados
    let dbType;
    switch(type) {
      case 'protection':
        dbType = 'protection';
        break;
      case 'bankBalance':
        dbType = 'bank';
        break;
      case 'fintechBalance':
        dbType = 'fintech';
        break;
    }
    
    if (dbType && currentUser) {
      updateManualBalancesInDB(dbType, numericValue);
    }
  };

  const fetchMetrics = async () => {
    if (!currentUser) return;
    
    try {
      // Primeiro, busca todas as contas do usuário atual
      const { data: userAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', currentUser.id);

      if (accountsError) {
        console.error('Erro ao buscar contas do usuário:', accountsError);
        return;
      }

      if (!userAccounts || userAccounts.length === 0) {
        setMetrics({
          totalAccounts: 0,
          documentsFinalized: 0,
          selfiesPending: 0,
          openHouses: 0,
          pendingVerifications: 0,
          fullVerified: 0,
          emOperacao: 0
        });
        return;
      }

      // Extrai os IDs das contas do usuário
      const accountIds = userAccounts.map(acc => acc.id);

      // Busca todas as contas em casas de apostas para as contas do usuário
      const { data: accountBettingHouses, error: abhError } = await supabase
        .from('account_betting_houses')
        .select(`
          *,
          accounts!inner (
            user_id
          )
        `)
        .in('account_id', accountIds)
        .eq('accounts.user_id', currentUser.id);

      if (abhError) {
        console.error('Erro ao buscar contas em casas de apostas:', abhError);
        return;
      }

      if (!accountBettingHouses) {
        setMetrics({
          totalAccounts: 0,
          documentsFinalized: 0,
          selfiesPending: 0,
          openHouses: 0,
          pendingVerifications: 0,
          fullVerified: 0,
          emOperacao: 0
        });
        return;
      }

      // Calcula as métricas baseadas nas contas em casas de apostas
      const metrics = {
        totalAccounts: accountBettingHouses.length,
        documentsFinalized: accountBettingHouses.filter(abh => abh.status === 'Verificado').length,
        selfiesPending: accountBettingHouses.filter(abh => abh.status === 'Selfie').length,
        openHouses: accountBettingHouses.filter(abh => abh.status === 'ABRIR').length,
        pendingVerifications: accountBettingHouses.filter(abh => abh.verification === 'Verificar').length,
        fullVerified: accountBettingHouses.filter(abh => abh.status === 'Verificado' && abh.verification === 'Verificado').length,
        emOperacao: accountBettingHouses.filter(abh => abh.status === 'Em Operação').length
      };

      console.log('Métricas calculadas:', metrics);
      setMetrics(metrics);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  };

  const fetchBalances = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);

      // Primeiro, busca todas as contas do usuário atual
      const { data: userAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', currentUser.id);

      if (accountsError) throw accountsError;
      
      if (!userAccounts || userAccounts.length === 0) {
        setBalances([]);
        setLoading(false);
        return;
      }

      // Extrai os IDs das contas do usuário
      const accountIds = userAccounts.map(acc => acc.id);
      
      // Busca todas as casas de apostas com valores de saldo para as contas do usuário
      const { data: accountBettingHouses, error: abhError } = await supabase
        .from('account_betting_houses')
        .select(`
          *,
          accounts!inner (
            user_id
          )
        `)
        .in('account_id', accountIds)
        .eq('accounts.user_id', currentUser.id);
        
      if (abhError) throw abhError;
      
      if (!accountBettingHouses || accountBettingHouses.length === 0) {
        setBalances([]);
        setLoading(false);
        return;
      }
      
      // Busca informações de todas as casas de apostas
      const { data: allBettingHouses, error: housesError } = await supabase
        .from('betting_houses')
        .select('id, name')
        .order('name');
        
      if (housesError) throw housesError;
      
      if (!allBettingHouses) {
        setBalances([]);
        setLoading(false);
        return;
      }
      
      // Criar um mapa de id da casa para nome da casa
      const houseIdToName: Record<string, string> = allBettingHouses.reduce((map, house) => {
        map[house.id] = house.name;
        return map;
      }, {} as Record<string, string>);
      
      // Agrupar saldos por casa de apostas
      const balancesByHouse: Record<string, number> = {};
      
      accountBettingHouses.forEach(abh => {
        const houseName = houseIdToName[abh.betting_house_id];
        if (!houseName) return;
        
        if (!balancesByHouse[houseName]) {
          balancesByHouse[houseName] = 0;
        }
        
        balancesByHouse[houseName] += parseCurrency(abh.saldo);
      });
      
      // Converter para o formato esperado
      const formattedBalances: BettingHouseBalance[] = Object.keys(balancesByHouse)
        .map(name => ({
          name,
          totalBalance: balancesByHouse[name]
        }))
        .filter(house => house.totalBalance > 0)
        .sort((a, b) => b.totalBalance - a.totalBalance);

      console.log('Saldos atualizados:', new Date().toISOString());
      console.log('Total de contas em casas:', accountBettingHouses.length);
      setBalances(formattedBalances);
    } catch (err) {
      console.error('Erro ao buscar saldos:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBalances();
    await fetchMetrics();
    await fetchManualBalancesFromDB();
    setLastUpdate(new Date());
  };

  const totalAllHouses = balances.reduce((sum, house) => sum + house.totalBalance, 0) + 
    manualBalances.protection + manualBalances.bankBalance + manualBalances.fintechBalance;

  const metricCards = [
    { title: 'Total de Contas', value: metrics.totalAccounts, color: 'bg-blue-50 text-blue-800' },
    { title: 'Documentos Finalizados', value: metrics.documentsFinalized, color: 'bg-green-50 text-green-800' },
    { title: 'Selfies Pendentes', value: metrics.selfiesPending, color: 'bg-yellow-50 text-yellow-800' },
    { title: 'Abrir Casas', value: metrics.openHouses, color: 'bg-purple-50 text-purple-800' },
    { title: 'Verificações Pendentes', value: metrics.pendingVerifications, color: 'bg-orange-50 text-orange-800' },
    { title: 'Contas 100%', value: metrics.fullVerified, color: 'bg-teal-50 text-teal-800' },
    { title: 'Em Operação', value: metrics.emOperacao, color: 'bg-emerald-50 text-emerald-800' }
  ];

  if (!currentUser) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Verificando autenticação...</div>
      </div>
    );
  }

  if (loading && balances.length === 0) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-xl text-red-600">Erro ao carregar os dados: {error}</div>
      </div>
    );
  }

  // Componente CurrencyInput corrigido para resolver problemas de foco
  const CurrencyInput = ({ value, onChange }: Props) => {
    const [displayValue, setDisplayValue] = useState(formatCurrency(value));
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatCurrency(value));
      }
    }, [value, isFocused]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
  
      // Garante que começa com "R$"
      if (!input.startsWith('R$')) {
        input = `R$ ${input.replace(/[^\d]/g, '')}`;
      }
  
      // Remove tudo que não for número
      const numericOnly = input.replace(/[^\d]/g, '');
      const numericValue = numericOnly ? parseInt(numericOnly) / 100 : 0;
  
      // Atualiza apenas o display
      const formatted = `R$ ${numericValue
        .toFixed(2)
        .replace('.', ',')
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  
      setDisplayValue(formatted);
    };
  
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      e.target.select();
    };
  
    const handleBlur = () => {
      setIsFocused(false);
  
      const numericValue = parseCurrency(displayValue);
      const formatted = formatCurrency(numericValue);
      setDisplayValue(formatted);
  
      onChange(formatted);
    };
  
    return (
      <div className={`relative rounded-md border ${isFocused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'} bg-white transition-all duration-200 hover:border-gray-300`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          className="w-full p-3 text-lg font-bold bg-transparent focus:outline-none"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="R$ 0,00"
        />
      </div>
    );
  };
  
  return (
    <div className="p-6 pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Balanço Financeiro</div>
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
              <span className="text-sm font-medium">{currentUser?.email || 'Meu Perfil'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {/* Total Balance Card */}
        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-lg text-blue-800">
              Saldo Total em Todas as Casas:{' '}
              <span className="font-bold">{formatCurrency(totalAllHouses)}</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-full ${
              refreshing ? 'bg-blue-100' : 'bg-blue-200 hover:bg-blue-300'
            } transition-colors duration-200`}
          >
            <RefreshCw 
              className={`w-5 h-5 text-blue-700 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {metricCards.map((card) => (
          <div key={card.title} className={`${card.color} rounded-lg shadow-sm p-4`}>
            <h3 className="text-sm font-semibold mb-1">{card.title}</h3>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Manual Balance Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Casa Proteção</h3>
          <CurrencyInput
            value={manualBalances.protection}
            onChange={(value) => handleManualBalanceChange('protection', value)}
          />
        </div>
        <div className="bg-slate-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Saldo em Banco</h3>
          <CurrencyInput
            value={manualBalances.bankBalance}
            onChange={(value) => handleManualBalanceChange('bankBalance', value)}
          />
        </div>
        <div className="bg-slate-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Saldo Fintech Freebet</h3>
          <div className="flex gap-2">
            <CurrencyInput
              value={manualBalances.fintechBalance}
              onChange={(value) => handleManualBalanceChange('fintechBalance', value)}
            />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 rounded ${
                refreshing ? 'bg-gray-100' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors duration-200`}
              title="Atualizar Saldo"
            >
              <RefreshCw 
                className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Betting Houses Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {balances.length > 0 ? balances.map((house) => (
          <div
            key={house.name}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-gray-800">{house.name}</h3>
              {BETTING_HOUSE_LINKS[house.name] && (
                <a
                  href={BETTING_HOUSE_LINKS[house.name]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <span className="mr-1">Abrir Conta</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className={`text-lg font-bold ${house.totalBalance > 0 ? 'text-green-600' : 'text-gray-800'}`}>
              {formatCurrency(house.totalBalance)}
            </p>
          </div>
        )) : (
          <div className="col-span-full p-6 text-center text-gray-500">
            Nenhuma casa de apostas com saldo encontrada
          </div>
        )}
      </div>
    </div>
  );
};

export default ControleGeral;