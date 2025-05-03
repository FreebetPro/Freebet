import React, { useState, useEffect } from "react";
import { User, Bell, HelpCircle, Settings, Calendar, Filter, Download, RefreshCw, FileDown } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { ActionItemsSection } from "./sections/ActionItemsSection";
import { DataSummarySection } from "./sections/DataSummarySection/DataSummarySection";
import { DepositsTableSection } from "./sections/DepositsTableSection";
import { DetailsTableSection } from "./sections/DetailsTableSection/DetailsTableSection";
import { GeneralStatisticsTableSection } from "./sections/GeneralStatisticsTableSection";
import { HeaderSection } from "./sections/HeaderSection";
import { MetricsOverviewSection } from "./sections/MetricsOverviewSection";
import { PerformanceByCPFSection } from "./sections/PerformanceByCPFSection";
import { ProceduresStatisticsSection } from "./sections/ProceduresStatisticsSection";
import { RevenueProjectionSection } from "./sections/RevenueProjectionSection";
import { StatisticsSection } from "./sections/StatisticsSection";
import { WithdrawalsTableSection } from "./sections/WithdrawalsTableSection";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DatePickerWithRange } from "../components/ui/date-range-picker";
import { supabase } from "../lib/supabase";

// Section title component for reusability
const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex w-full items-center justify-between mb-4">
    <div className="inline-flex flex-col items-start">
      <div className="font-normal text-blue-900 text-lg">{title}</div>
    </div>
  </div>
);

// Filtro component for reusability
const FilterControls = ({ onFilterChange, onRefresh, isRefreshing }) => (
  <div className="flex flex-wrap gap-3 mb-6 items-center">
    <DatePickerWithRange className="w-auto" onChange={(range) => onFilterChange('dateRange', range)} />
    
    <Select onValueChange={(value) => onFilterChange('cpf', value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por CPF" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os CPFs</SelectItem>
        <SelectItem value="active">CPFs Ativos</SelectItem>
        <SelectItem value="inactive">CPFs Inativos</SelectItem>
      </SelectContent>
    </Select>
    
    <Select onValueChange={(value) => onFilterChange('status', value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status da Conta" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os Status</SelectItem>
        <SelectItem value="active">Ativas</SelectItem>
        <SelectItem value="suspended">Suspensas</SelectItem>
        <SelectItem value="blocked">Bloqueadas</SelectItem>
      </SelectContent>
    </Select>
    
    <Button 
      variant="outline" 
      className="gap-2" 
      onClick={onRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      Atualizar Dados
    </Button>
    
    <Button variant="outline" className="gap-2 ml-auto">
      <Download className="w-4 h-4" />
      Exportar
    </Button>
  </div>
);

// Header component adapted for the new structure
const PageHeader = () => {
  return (
    <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
      <div className="flex justify-between items-center h-full px-8">
        <div className="text-xl font-bold text-gray-800">CPF Estatísticas</div>
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
  );
};

export const CPFStatistics = (): JSX.Element => {
  // Estados para gerenciar dados e UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    dateRange: {
      from: new Date(2025, 3, 1), // 01/04/2025
      to: new Date(2025, 3, 13)   // 13/04/2025
    },
    cpf: "all",
    status: "all"
  });
  
  // Estados para armazenar dados
  const [accountsData, setAccountsData] = useState([]);
  const [statisticsData, setStatisticsData] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    averageBalance: 0,
    taxPaid: 0
  });
  
  // Section titles data - dynamic baseado nos filtros
  const sectionTitles = {
    generalProjection: `Projeção Geral (até 31/12/2025)`,
    revenueProjection: `Projeção de Receita (até 31/12/2025)`,
    proceduresStats: `Estatísticas de Procedimentos (${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()})`,
    lastProcedures: "Últimos Procedimentos (Ativações)",
  };

  // Função para buscar dados do Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar contas
      let { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq(filters.status !== 'all' ? 'status' : '', filters.status !== 'all' ? filters.status : null)
        .order('created_at', { ascending: false });
      
      if (accountsError) throw accountsError;
      
      // Buscar dados fiscais mensais
      let { data: taxData, error: taxError } = await supabase
        .from('tax_monthly_data')
        .select('*')
        .gte('payment_date', filters.dateRange.from.toISOString())
        .lte('payment_date', filters.dateRange.to.toISOString());
      
      if (taxError) throw taxError;
      
      // Calcular estatísticas
      const activeAccounts = accounts ? accounts.filter(acc => acc.status === 'active').length : 0;
      const totalDeposits = taxData ? taxData.reduce((sum, item) => sum + (item.total_income || 0), 0) : 0;
      const totalWithdrawals = taxData ? taxData.reduce((sum, item) => sum + (item.tax_paid || 0), 0) : 0;
      const taxPaid = taxData ? taxData.reduce((sum, item) => sum + (item.tax_due || 0), 0) : 0;
      
      // Atualizar estados com os dados
      setAccountsData(accounts || []);
      setStatisticsData({
        totalAccounts: accounts ? accounts.length : 0,
        activeAccounts,
        totalDeposits,
        totalWithdrawals,
        averageBalance: accounts && accounts.length > 0 ? totalDeposits / accounts.length : 0,
        taxPaid
      });
      
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar filtros
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Função para forçar atualização dos dados
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500); // Para feedback visual
    });
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efeito para reagir a mudanças nos filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const calcularIndicadores = async () => {
    try {
      // Buscar todas as contas do usuário logado
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.error('Usuário não autenticado');
        return {
          totalContas: 0,
          documentosFinalizados: 0,
          selfiesPendentes: 0,
          abrirCasas: 0,
          verificacoesPendentes: 0,
          contasCompletas: 0
        };
      }

      // Buscar contas do usuário
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!accounts || accounts.length === 0) {
        return {
          totalContas: 0,
          documentosFinalizados: 0,
          selfiesPendentes: 0,
          abrirCasas: 0,
          verificacoesPendentes: 0,
          contasCompletas: 0
        };
      }

      // Conta total de contas do usuário
      const totalContas = accounts.length;

      // Conta documentos finalizados (contas com verificação 'approved')
      const documentosFinalizados = accounts.filter(acc => acc.verification === 'approved').length;

      // Conta selfies pendentes (contas com verificação 'pending')
      const selfiesPendentes = accounts.filter(acc => acc.verification === 'pending').length;

      // Conta casas abertas (contas com status 'active')
      const abrirCasas = accounts.filter(acc => acc.status === 'active').length;

      // Conta verificações pendentes (contas com verificação 'pending')
      const verificacoesPendentes = accounts.filter(acc => acc.verification === 'pending').length;

      // Conta contas 100% completas (contas com verificação 'approved' e status 'active')
      const contasCompletas = accounts.filter(acc => 
        acc.verification === 'approved' && acc.status === 'active'
      ).length;

      return {
        totalContas,
        documentosFinalizados,
        selfiesPendentes,
        abrirCasas,
        verificacoesPendentes,
        contasCompletas
      };
    } catch (error) {
      console.error('Erro ao calcular indicadores:', error);
      return {
        totalContas: 0,
        documentosFinalizados: 0,
        selfiesPendentes: 0,
        abrirCasas: 0,
        verificacoesPendentes: 0,
        contasCompletas: 0
      };
    }
  };

  // Estado para armazenar os indicadores
  const [indicadores, setIndicadores] = useState({
    totalContas: 0,
    documentosFinalizados: 0,
    selfiesPendentes: 0,
    abrirCasas: 0,
    verificacoesPendentes: 0,
    contasCompletas: 0
  });

  // Efeito para calcular indicadores quando os dados mudarem
  useEffect(() => {
    const fetchIndicadores = async () => {
      const novosIndicadores = await calcularIndicadores();
      setIndicadores(novosIndicadores);
    };
    fetchIndicadores();
  }, []);

  return (
    <>
      <PageHeader />
      
      <div className="flex flex-col items-center p-8 pt-20 bg-gray-50">
        <div className="w-full max-w-[1262px] mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">CPF Estatísticas</h1>
          <p className="text-gray-600">Visualize estatísticas e métricas relacionadas às contas CPF</p>
        </div>
        
        <Card className="max-w-[1262px] w-full rounded-xl shadow-md border">
          <CardContent className="p-8 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 text-lg">Carregando dados...</p>
                </div>
              </div>
            ) : (
              <>
                <FilterControls 
                  onFilterChange={handleFilterChange} 
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="accounts">Contas</TabsTrigger>
                    <TabsTrigger value="transactions">Transações</TabsTrigger>
                    <TabsTrigger value="tax">Dados Fiscais</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <StatisticsSection data={statisticsData} />
                    <HeaderSection dateRange={filters.dateRange} />
                    <DataSummarySection data={statisticsData} />
                    
                    <SectionTitle title={sectionTitles.generalProjection} />
                    <ActionItemsSection />
                    <MetricsOverviewSection accountsData={accountsData} />
                    
                    <SectionTitle title={sectionTitles.revenueProjection} />
                    <RevenueProjectionSection dateRange={filters.dateRange} />
                  </TabsContent>
                  
                  <TabsContent value="accounts" className="space-y-6">
                    <PerformanceByCPFSection accountsData={accountsData} />
                    <DetailsTableSection accountsData={accountsData} />
                  </TabsContent>
                  
                  <TabsContent value="transactions" className="space-y-6">
                    <SectionTitle title={sectionTitles.lastProcedures} />
                    <DepositsTableSection />
                    <WithdrawalsTableSection />
                  </TabsContent>
                  
                  <TabsContent value="tax" className="space-y-6">
                    <GeneralStatisticsTableSection />
                    <SectionTitle title={sectionTitles.proceduresStats} />
                    <ProceduresStatisticsSection dateRange={filters.dateRange} />
                  </TabsContent>
                </Tabs>

                {/* Indicadores */}
                <section className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Indicadores</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-1">Total de Contas</p>
                      <p className="text-2xl font-bold">{indicadores.totalContas}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-1">Documentos Finalizados</p>
                      <p className="text-2xl font-bold">{indicadores.documentosFinalizados}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-1">Selfies Pendentes</p>
                      <p className="text-2xl font-bold">{indicadores.selfiesPendentes}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-1">Abrir Casas</p>
                      <p className="text-2xl font-bold">{indicadores.abrirCasas}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-1">Verificações Pendentes</p>
                      <p className="text-2xl font-bold">{indicadores.verificacoesPendentes}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-1">Contas 100%</p>
                      <p className="text-2xl font-bold">{indicadores.contasCompletas}</p>
                    </div>
                  </div>
                </section>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CPFStatistics;