import React, { useState, useEffect } from 'react';
import { User, Bell, HelpCircle, Settings, DollarSign, Calculator, FileText, Calendar, Download, Filter, Search, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { supabase } from '../lib/supabase';

const ControleImposto: React.FC = () => {
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [accountData, setAccountData] = useState<any>(null);
  const [taxData, setTaxData] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [annualTaxData, setAnnualTaxData] = useState<any>(null);
  
  // Limite de isenção do imposto (valor real atual)
  const taxExemptionLimit = 28559.70;

  useEffect(() => {
    // Verificar o usuário logado e carregar seus dados
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAccounts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && selectedAccountId) {
      fetchAccountData();
      fetchAnnualTaxData();
      fetchMonthlyTaxData();
    }
  }, [currentUser, selectedAccountId, year]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      
      // Obter o usuário atual do Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        setCurrentUser(user);
      } else {
        console.error('Nenhum usuário logado');
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as contas associadas ao usuário logado
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAccounts(data);
        // Seleciona a primeira conta por padrão
        setSelectedAccountId(data[0].id);
      } else {
        console.error('Nenhuma conta encontrada para este usuário');
      }
      
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      
      if (!selectedAccountId) return;
      
      // Buscar a conta específica pelo ID
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', selectedAccountId)
        .single();

      if (error) throw error;
      
      setAccountData({ account: data });
      
    } catch (error) {
      console.error('Erro ao buscar dados da conta:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnnualTaxData = async () => {
    try {
      if (!selectedAccountId) return;
      
      // Buscar dados fiscais anuais da conta selecionada para o ano específico
      const { data, error } = await supabase
        .from('tax_annual_data')
        .select('*')
        .eq('account_id', selectedAccountId)
        .eq('year', parseInt(year))
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou dados para este ano, pode ser normal
          console.log('Sem dados fiscais anuais para este ano');
          setAnnualTaxData(null);
        } else {
          throw error;
        }
      } else if (data) {
        setAnnualTaxData(data);
        
        // Atualizar accountData com os dados fiscais
        setAccountData(prevState => ({
          ...prevState,
          taxInfo: {
            totalIncome: data.total_income,
            taxableIncome: data.taxable_income,
            taxDue: data.tax_due,
            taxPaid: data.tax_paid
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar dados fiscais anuais:', error);
    }
  };
  
  const fetchMonthlyTaxData = async () => {
    try {
      if (!selectedAccountId) return;
      
      // Buscar dados fiscais mensais da conta selecionada para o ano específico
      const { data, error } = await supabase
        .from('tax_monthly_data')
        .select('*')
        .eq('account_id', selectedAccountId)
        .eq('year', parseInt(year))
        .order('month', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Mapear os dados para o formato esperado pelo componente
        const months = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 
          'Maio', 'Junho', 'Julho', 'Agosto',
          'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const formattedData = data.map(item => ({
          id: item.id,
          month: months[item.month - 1],
          totalIncome: item.total_income,
          taxableIncome: item.taxable_income,
          taxDue: item.tax_due,
          status: item.status
        }));
        
        // Completar com meses não disponíveis se necessário
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const yearInt = parseInt(year);
        
        const allMonths = months.map((month, index) => {
          const monthNumber = index + 1;
          const existingData = formattedData.find(item => months.indexOf(item.month) === index);
          
          // Se o mês estiver no futuro ou não tiver dados
          if ((yearInt === currentYear && monthNumber > currentMonth) || !existingData) {
            return {
              id: `${yearInt}-${monthNumber}`,
              month,
              totalIncome: 0,
              taxableIncome: 0,
              taxDue: 0,
              status: 'Não disponível'
            };
          }
          
          return existingData;
        });
        
        setTaxData(allMonths);
      } else {
        // Se não houver dados, criar array com todos os meses indisponíveis
        createEmptyMonthlyData();
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados fiscais mensais:', error);
      // Em caso de erro, criar array com todos os meses indisponíveis
      createEmptyMonthlyData();
    }
  };
  
  const createEmptyMonthlyData = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 
      'Maio', 'Junho', 'Julho', 'Agosto',
      'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const emptyData = months.map((month, index) => ({
      id: `${year}-${index + 1}`,
      month,
      totalIncome: 0,
      taxableIncome: 0,
      taxDue: 0,
      status: 'Não disponível'
    }));
    
    setTaxData(emptyData);
  };

  // Calcular totais anuais a partir dos dados mensais
  // (necessário apenas se não houver dados anuais)
  const calculateYearlyTotals = () => {
    const validTaxData = taxData.filter(item => item.status !== 'Não disponível');
    return {
      totalIncome: validTaxData.reduce((sum, item) => sum + (Number(item.totalIncome) || 0), 0),
      taxableIncome: validTaxData.reduce((sum, item) => sum + (Number(item.taxableIncome) || 0), 0),
      taxDue: validTaxData.reduce((sum, item) => sum + (Number(item.taxDue) || 0), 0),
      taxPaid: validTaxData.filter(item => item.status === 'Pago').reduce((sum, item) => sum + (Number(item.taxDue) || 0), 0)
    };
  };
  
  const yearlyTotals = annualTaxData ? {
    totalIncome: annualTaxData.total_income,
    taxableIncome: annualTaxData.taxable_income,
    taxDue: annualTaxData.tax_due,
    taxPaid: annualTaxData.tax_paid
  } : calculateYearlyTotals();

  const taxableIncome = accountData?.taxInfo?.taxableIncome || yearlyTotals.taxableIncome || 0;
  const remainingExemption = Math.max(0, taxExemptionLimit - taxableIncome);
  const exemptionPercentage = (taxableIncome / taxExemptionLimit) * 100;

  // Filtrar dados com base no termo de pesquisa
  const filteredData = taxData.filter(item => 
    item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    setLoading(true);
    if (currentUser && selectedAccountId) {
      fetchAccountData();
      fetchAnnualTaxData();
      fetchMonthlyTaxData();
    } else {
      fetchCurrentUser();
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
  };

  return (
    <div className="p-6 pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Controle de Imposto por CPF</div>
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

      {loading && !accountData ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Carregando dados...</span>
        </div>
      ) : !currentUser ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Usuário não autenticado</h3>
          <p className="text-gray-600 mb-4">
            Por favor, faça login para visualizar seus dados de imposto.
          </p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Calculator className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma conta encontrada</h3>
          <p className="text-gray-600 mb-4">
            Não foi encontrada nenhuma conta CPF associada ao seu usuário.
          </p>
        </div>
      ) : (
        <>
          {/* Account Selection */}
          {accounts.length > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center">
                <label className="text-gray-700 mr-2 font-medium">Selecionar Conta:</label>
                <select
                  value={selectedAccountId || ''}
                  onChange={handleAccountChange}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - CPF: {account.cpf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tax Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Renda Total Anual</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {accountData?.taxInfo ? formatCurrency(accountData.taxInfo.totalIncome) : formatCurrency(yearlyTotals.totalIncome)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Renda Tributável</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {accountData?.taxInfo ? formatCurrency(accountData.taxInfo.taxableIncome) : formatCurrency(yearlyTotals.taxableIncome)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Imposto Devido</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {accountData?.taxInfo ? formatCurrency(accountData.taxInfo.taxDue) : formatCurrency(yearlyTotals.taxDue)}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Imposto Pago</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {accountData?.taxInfo ? formatCurrency(accountData.taxInfo.taxPaid) : formatCurrency(yearlyTotals.taxPaid)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tax Exemption Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Limite de Isenção Anual</h2>
              {accountData?.account && (
                <div className="text-sm text-gray-700 font-medium">
                  CPF: {accountData.account.cpf}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Ano Fiscal: 
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  className="ml-2 px-2 py-1 border rounded-md"
                  disabled={loading}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>

            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-600">Progresso: {exemptionPercentage.toFixed(1)}%</span>
              <span className="text-sm text-gray-600">
                {formatCurrency(taxableIncome)} / {formatCurrency(taxExemptionLimit)}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full ${
                  taxableIncome / taxExemptionLimit * 100 >= 100 
                    ? 'bg-red-500' 
                    : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(
                    (taxableIncome / taxExemptionLimit) * 100, 
                    100
                  )}%` 
                }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {taxableIncome < taxExemptionLimit 
                    ? `Você ainda tem ${formatCurrency(remainingExemption)} de isenção disponível` 
                    : 'Você ultrapassou o limite de isenção'}
                </p>
              </div>
              <div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Relatório Anual
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Tax Table */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Controle Mensal de Impostos
                {accountData?.account && ` - ${accountData.account.name}`}
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
                <button 
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renda Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renda Tributável</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imposto Devido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${item.status === 'Não disponível' ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.status === 'Não disponível' ? '-' : formatCurrency(item.totalIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.status === 'Não disponível' ? '-' : formatCurrency(item.taxableIncome)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.status === 'Não disponível' ? '-' : formatCurrency(item.taxDue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Pago' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'Pendente' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className={`text-blue-600 hover:text-blue-900 ${item.status === 'Não disponível' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={item.status === 'Não disponível'}
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">Nenhum resultado encontrado</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ControleImposto;