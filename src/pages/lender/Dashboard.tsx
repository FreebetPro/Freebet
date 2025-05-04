import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Wallet, X, Check, Info, AlertTriangle, TrendingUp,
  MessageCircle, Copy, ChevronDown, Download, Play,
  LineChart as ChartLine, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { lenderAuthService } from '../../services/lenderAuthService';

// Register ChartJS components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LenderDashboard = () => {
  // Estados para modais
  const [showSaqueModal, setShowSaqueModal] = useState(false);
  const [showEarnMoreModal, setShowEarnMoreModal] = useState(false);
  const [valorSaque, setValorSaque] = useState('');
  
  // Estados para filtros de data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estados para dados do usuário
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState([]);
  
  // Estados para métricas
  const [totalOperacoes, setTotalOperacoes] = useState(0);
  const [totalDepositos, setTotalDepositos] = useState(0);
  const [totalSaques, setTotalSaques] = useState(0);
  const [comissaoAtual, setComissaoAtual] = useState(0);
  
  // Estados para dados fiscais
  const [taxData, setTaxData] = useState(null);
  const [irProgress, setIrProgress] = useState(0);
  const [irFaltante, setIrFaltante] = useState(0);
  const [limiteIsencao, setLimiteIsencao] = useState(27110.40);
  
  // Estados para operações de apostas
  const [bettingOperations, setBettingOperations] = useState([]);
  
  // Estados para dados do gráfico
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Lucro Diário',
      data: [],
      borderColor: '#2563eb',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  });

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!lenderAuthService.isAuthenticated()) {
      console.error('Usuário não autenticado');
      return;
    }

    // Buscar o perfil do usuário
    const currentLender = lenderAuthService.getCurrentLender();
    if (currentLender) {
      setProfile(currentLender);
      
      // Carregar dados do lender
      loadLenderData(currentLender.id);
      
      // Aplicar os filtros padrão (mês atual)
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(lastDay));
      
      aplicarFiltros(formatDate(firstDay), formatDate(lastDay), currentLender.id);
    }
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadLenderData = async (lenderId) => {
    if (!lenderId) return;
    
    try {
      // Carregar as tarefas pendentes
      await loadPendingTasks(lenderId);
      
      // Carregar dados da conta do emprestador
      await loadLenderAccountData(lenderId);
      
      // Carregar dados fiscais
      await loadTaxData(lenderId);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do emprestador:', error);
      setLoading(false);
    }
  };

  const loadLenderAccountData = async (lenderId) => {
    try {
      // Buscar o emprestador pelo ID
      const { data: emprestador, error: emprestadorError } = await supabase
        .from('emprestadores')
        .select('*')
        .eq('id', lenderId)
        .single();
        
      if (emprestadorError) {
        console.error('Erro ao buscar emprestador:', emprestadorError);
        return;
      }
      
      if (emprestador) {
        // Buscar conta associada ao emprestador
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', emprestador.account_id)
          .single();
          
        if (accountError) {
          console.error('Erro ao buscar conta:', accountError);
          return;
        }
        
        if (account) {
          // Buscar casas de apostas associadas à conta
          const { data: bettingHouses, error: bettingHousesError } = await supabase
            .from('account_betting_houses')
            .select(`
              *,
              betting_houses:betting_house_id(name)
            `)
            .eq('account_id', account.id);
            
          if (bettingHousesError) {
            console.error('Erro ao buscar casas de apostas:', bettingHousesError);
            return;
          }
          
          // Calcular totais
          let depositos = 0;
          let saques = 0;
          let comissao = 0;
          
          bettingHouses.forEach(house => {
            depositos += parseFloat(house.deposito || 0);
            saques += parseFloat(house.sacado || 0);
            comissao += parseFloat(house.creditos || 0);
          });
          
          setTotalDepositos(depositos);
          setTotalSaques(saques);
          setComissaoAtual(comissao);
          
          // Enriquecer profile com dados da conta
          setProfile(prev => ({
            ...prev,
            account: account,
            bettingHouses: bettingHouses
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao processar dados da conta:', error);
    }
  };

  const loadTaxData = async (lenderId) => {
    try {
      // Buscar emprestador para obter account_id
      const { data: emprestador, error: emprestadorError } = await supabase
        .from('emprestadores')
        .select('account_id')
        .eq('id', lenderId)
        .single();
      
      if (emprestadorError || !emprestador) {
        console.error('Erro ao buscar account_id do emprestador:', emprestadorError);
        return;
      }
      
      const currentYear = new Date().getFullYear();
      
      // Buscar dados fiscais anuais
      const { data: annualData, error: annualError } = await supabase
        .from('tax_annual_data')
        .select('*')
        .eq('account_id', emprestador.account_id)
        .eq('year', currentYear)
        .single();
        
      if (annualError && annualError.code !== 'PGRST116') { // Ignorar erro "not found"
        console.error('Erro ao buscar dados fiscais anuais:', annualError);
      }
      
      // Buscar dados fiscais mensais para gráfico
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('tax_monthly_data')
        .select('*')
        .eq('account_id', emprestador.account_id)
        .eq('year', currentYear)
        .order('month', { ascending: true });
        
      if (monthlyError) {
        console.error('Erro ao buscar dados fiscais mensais:', monthlyError);
      }
      
      setTaxData({
        annual: annualData || {
          total_income: 0,
          taxable_income: 0,
          tax_due: 0,
          tax_paid: 0
        },
        monthly: monthlyData || []
      });
      
      // Atualizar progresso do IR
      if (annualData) {
        updateIRProgress(annualData.taxable_income, limiteIsencao);
      } else {
        updateIRProgress(0, limiteIsencao);
      }
      
      // Atualizar dados do gráfico
      if (monthlyData && monthlyData.length > 0) {
        updateChartData(monthlyData);
      }
    } catch (error) {
      console.error('Erro ao processar dados fiscais:', error);
    }
  };

  const updateChartData = (monthlyData) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    const labels = monthlyData.map(item => `${months[item.month - 1]}`);
    const values = monthlyData.map(item => item.total_income);
    
    setChartData({
      labels: labels,
      datasets: [{
        label: 'Lucro Mensal',
        data: values,
        borderColor: '#2563eb',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    });
  };

  const loadPendingTasks = async (lenderId) => {
    if (!lenderId) return;

    try {
      const { data, error } = await supabase
        .from('lender_tasks')
        .select('*')
        .eq('lender_id', lenderId)
        .eq('status', 'pending');

      if (error) {
        console.error('Erro ao buscar tarefas pendentes:', error);
        return;
      }

      setPendingTasks(data || []);
    } catch (error) {
      console.error('Erro ao processar tarefas pendentes:', error);
    }
  };

  const loadBettingOperations = async (lenderId, startDate, endDate) => {
    try {
      // Buscar account_id do emprestador
      const { data: emprestador, error: emprestadorError } = await supabase
        .from('emprestadores')
        .select('account_id')
        .eq('id', lenderId)
        .single();
      
      if (emprestadorError || !emprestador) {
        console.error('Erro ao buscar account_id do emprestador:', emprestadorError);
        return;
      }
      
      // Buscar operações de apostas relacionadas à conta do emprestador
      const { data: operations, error: operationsError } = await supabase
        .from('betting_operations')
        .select(`
          *,
          house1:house1_id(name),
          house2:house2_id(name),
          operation_accounts!inner(account_id)
        `)
        .eq('operation_accounts.account_id', emprestador.account_id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
        
      if (operationsError) {
        console.error('Erro ao buscar operações de apostas:', operationsError);
        return;
      }
      
      setBettingOperations(operations || []);
      setTotalOperacoes(operations ? operations.length : 0);
    } catch (error) {
      console.error('Erro ao processar operações de apostas:', error);
    }
  };

  const completarTarefa = async (taskId) => {
    try {
      const { error } = await supabase
        .from('lender_tasks')
        .update({ 
          status: 'completed', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId);

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        alert('Erro ao concluir a tarefa. Tente novamente.');
        return;
      }

      // Atualiza a lista de tarefas pendentes
      setPendingTasks(pendingTasks.filter(task => task.id !== taskId));
      alert('Tarefa marcada como concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao processar conclusão da tarefa:', error);
      alert('Ocorreu um erro ao processar sua solicitação.');
    }
  };

  const aplicarFiltros = (start = startDate, end = endDate, lenderId = profile?.id) => {
    if (!lenderId) return;
    
    // Validar datas
    if (!start || !end) {
      alert('Selecione as datas de início e fim para aplicar os filtros.');
      return;
    }
    
    // Carregar operações de apostas filtradas
    loadBettingOperations(lenderId, start, end);
    
    console.log('Filtros aplicados:', { startDate: start, endDate: end });
  };

  const updateIRProgress = (lucroAtual, limiteIsencao) => {
    const percentual = Math.min((lucroAtual / limiteIsencao) * 100, 100);
    const faltante = Math.max(limiteIsencao - lucroAtual, 0);

    setIrProgress(percentual);
    setIrFaltante(faltante);
  };

  const confirmarSaque = async () => {
    const valorSaqueNum = parseFloat(valorSaque);
    const saldoDisponivel = comissaoAtual;
    const saqueMinimo = 50.00;
    const taxa = 2.00;

    if (isNaN(valorSaqueNum) || valorSaqueNum < saqueMinimo) {
      alert(`O valor mínimo para saque é R$ ${saqueMinimo.toFixed(2)}.`);
      return;
    }

    if (valorSaqueNum + taxa > saldoDisponivel) {
      alert('Saldo insuficiente para realizar o saque.');
      return;
    }

    try {
      // Criar registro de solicitação de saque
      // Aqui você pode implementar a lógica para registrar o saque no banco de dados
      
      const valorLiquido = valorSaqueNum - taxa;
      alert(`Saque de R$ ${valorSaqueNum.toFixed(2)} solicitado com sucesso!\nValor líquido: R$ ${valorLiquido.toFixed(2)}\nTaxa de saque: R$ ${taxa.toFixed(2)}`);
      setShowSaqueModal(false);
      setValorSaque('');
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      alert('Ocorreu um erro ao processar sua solicitação de saque.');
    }
  };

  const copyVideoLink = () => {
    const videoLink = 'https://www.youtube.com/embed/uMPOEo17mss';
    navigator.clipboard.writeText(videoLink);
    alert('Link copiado para a área de transferência!');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#2563eb',
        titleColor: 'white',
        bodyColor: 'white'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value;
          }
        }
      }
    }
  };

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do seu painel...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm fixed w-full top-0 z-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Dashboard do Emprestador</h1>
              {profile && (
                <span className="text-white/80 text-sm hidden md:inline-block">
                  Olá, {profile.account?.name || profile.email}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={() => aplicarFiltros()}
                className="px-4 py-1.5 text-sm bg-white text-blue-600 font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={() => setShowEarnMoreModal(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-white/90 transition-colors"
                title="Veja como aumentar sua renda"
              >
                <ChartLine className="w-4 h-4 mr-2" />
                Ganhe Mais
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 gap-6">

          {/* Task Board */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-1">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Verificações Pendentes</h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {pendingTasks.length} pendentes
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-10 bg-blue-500 rounded-l-lg -ml-3" />
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                      </div>
                      <button
                        onClick={() => completarTarefa(task.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-lg 
                          hover:from-orange-700 hover:to-red-700 transform hover:scale-102 transition-all duration-200 shadow-sm"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Cumprir Tarefa
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma tarefa pendente</h3>
                    <p className="text-gray-500 mt-1">Todas as verificações foram concluídas!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Comissão Atual</h2>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(comissaoAtual)}</p>
              <button
                onClick={() => setShowSaqueModal(true)}
                className="mt-3 w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Solicitar Saque
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Total de Operações</h2>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalOperacoes}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Total de Depósitos</h2>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalDepositos)}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Total de Saques</h2>
              <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(totalSaques)}</p>
            </div>
          </div>

          {/* IR Progress */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Progresso do Imposto de Renda (Lucro Anual)
            </h2>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${irProgress}%` }}
              />
            </div>
            <p className="mt-4 text-gray-600">
              Falta <span className="font-semibold text-blue-600">{formatCurrency(irFaltante)}</span>{' '}
              para atingir o limite de isenção de {formatCurrency(limiteIsencao)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Obs.: O imposto é aplicado apenas sobre o lucro anual que exceder {formatCurrency(limiteIsencao)}.
            </p>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gráfico de Lucros</h2>
            <div className="h-[300px] sm:h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Betting Operations Table */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Operações nas Casas de Aposta</h2>
              <button
                onClick={() => {/* Implement download logic */}}
                className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Relatório
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Casa de Aposta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Operação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bettingOperations.length > 0 ? (
                    bettingOperations.map((operation) => (
                      <tr key={operation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{operation.date}</td>
                        <td className="px-6 py-4">{operation.house1?.name || 'N/A'}</td>
                        <td className="px-6 py-4">{operation.game_name || 'Aposta Esportiva'}</td>
                        <td className="px-6 py-4">{formatCurrency(operation.bet_amount)}</td>
                        <td className={`px-6 py-4 ${parseFloat(operation.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(operation.profit)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        Nenhuma operação encontrada no período selecionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Saque Modal */}
      {showSaqueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Solicitar Saque</h3>
              <button
                onClick={() => setShowSaqueModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Saldo disponível:</span>
                <strong className="text-blue-600">R$ 1.200,00</strong>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Wallet className="w-4 h-4 inline mr-1" />
                Valor do Saque
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="number"
                  value={valorSaque}
                  onChange={(e) => setValorSaque(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  placeholder="0,00"
                />
              </div>
              <p className="mt-1 text-sm text-yellow-600 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                Taxa de saque: R$ 2,00
              </p>
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Valor mínimo para saque: R$ 50,00
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSaqueModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <XIcon className="w-4 h-4 inline mr-1" />
                Cancelar
              </button>
              <button
                onClick={confirmarSaque}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Check className="w-4 h-4 inline mr-1" />
                Confirmar Saque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Earn More Modal */}
      {showEarnMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 overflow-y-auto">
          <div className="relative bg-white rounded-lg p-4 md:p-6 w-full max-w-lg mx-auto my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 pr-8">Siga os Passos Abaixo para Aumentar sua Renda Sem Risco</h3>
              <button
                onClick={() => setShowEarnMoreModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <div className="space-y-6">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">
                    1- Procure em sua Lista de Contatos um Amigo ou Parente mais próximo de Confiança
                  </h4>
                  <p className="text-blue-600 text-sm md:text-base">
                    Cuidado... considere as pessoas que você sabe que são Honestas.
                  </p>
                </div>

                <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">
                    2- Mostre seus Resultados e Ganhos já recebidos
                  </h4>
                  <p className="text-green-600 text-sm md:text-base">
                    Atenção, mostre seus ganhos recebidos no Banco, sem investir nada.
                  </p>
                </div>

                <div className="bg-purple-50 p-3 md:p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">
                    3- Explique Como Funciona o Seu Painel
                  </h4>
                  <p className="text-purple-600 text-sm md:text-base">
                    Explique detalhadamente o painel e suas funções e segurança.
                  </p>
                </div>

                <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-700 mb-2">
                    4- Encaminhe para ela o Vídeo Explicação do Projeto
                  </h4>
                  <p className="text-orange-600 text-sm md:text-base mb-4">
                    No vídeo explicaremos passo a passo completo de como funciona.
                  </p>
                </div>
              </div>

              <div className="aspect-video bg-gray-100 rounded-lg relative">
                <a
                  href="https://www.youtube.com/embed/uMPOEo17mss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </a>
              </div>

              <button
                onClick={copyVideoLink}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link do Vídeo
              </button>
              
              <div className="bg-red-50 p-3 md:p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-red-700 mb-2">
                  5- Compartilhe o Contato com o Responsável que Opera em Sua Conta
                </h4>
                <p className="text-red-600 text-sm md:text-base">
                  Após isto será feito um acordo com a pessoa, e se tudo der certo solicite ao Responsável da sua conta uma comissão mensal pela indicação desta conta... Exemplo: R$ 30,00 por conta Indicada.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LenderDashboard;