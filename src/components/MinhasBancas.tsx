import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, FileDown, Bell, HelpCircle, User, Play } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authService } from '../services/supabaseService';
import { useTheme } from '../utils/themecontext';

interface Bank {
  id: string;
  name: string;
  initial_capital: number;
  roi: number;
  gross_profit: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  bet_count?: number;
}

const MinhasBancas: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    initialCapital: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Usuário autenticado via Supabase:", session.user.id);
          setUserId(session.user.id);
          await fetchBanks(session.user.id);
          
          // Configurar listener para mudanças em tempo real
          const banksSubscription = supabase
            .channel('banks_changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'banks',
                filter: `user_id=eq.${session.user.id}`
              },
              async (payload) => {
                console.log('Mudança detectada:', payload);
                await fetchBanks(session.user.id);
              }
            )
            .subscribe();

          // Configurar listener para mudanças nas operações
          const operationsSubscription = supabase
            .channel('operations_changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'betting_operations',
                filter: `user_id=eq.${session.user.id}`
              },
              async () => {
                console.log('Mudança em operações detectada');
                await fetchBanks(session.user.id);
              }
            )
            .subscribe();
          
          if (session.access_token) {
            localStorage.setItem('token', session.access_token);
            localStorage.setItem('user', JSON.stringify({
              id: session.user.id,
              email: session.user.email
            }));
            localStorage.setItem('isAuthenticated', 'true');
          }

          return () => {
            banksSubscription.unsubscribe();
            operationsSubscription.unsubscribe();
          };
        } else {
          const tokenCheck = authService.verifyToken();
          if (tokenCheck.valid && tokenCheck.user) {
            console.log("Usuário autenticado via localStorage:", tokenCheck.user.id);
            setUserId(tokenCheck.user.id);
            await fetchBanks(tokenCheck.user.id);
          } else {
            console.log("Nenhum usuário autenticado");
            setUserId(null);
            setBanks([]);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUserId(null);
        setBanks([]);
      }
      setLoading(false);
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  const fetchBanks = async (uid: string) => {
    try {
      setLoading(true);
      console.log('Buscando bancas para o usuário ID:', uid);
      
      if (!uid) {
        console.error('ID de usuário inválido para buscar bancas');
        setBanks([]);
        setLoading(false);
        return;
      }
      
      // Buscar bancas
      const { data: banksData, error: banksError } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });

      if (banksError) {
        console.error('Erro do Supabase ao buscar bancas:', banksError);
        throw banksError;
      }

      // Buscar operações para cada banca
      const banksWithOperations = await Promise.all(
        banksData.map(async (bank) => {
          const { data: operationsData, error: operationsError } = await supabase
            .from('betting_operations')
            .select('*')
            .eq('bank_id', bank.id)
            .order('date', { ascending: false });

          if (operationsError) {
            console.error('Erro ao buscar operações:', operationsError);
            return bank;
          }

          // Calcular métricas atualizadas
          const totalBets = operationsData.length;
          const totalBetAmount = operationsData.reduce((sum, op) => sum + (Number(op.bet_amount) || 0), 0);
          const totalProfit = operationsData.reduce((sum, op) => sum + (Number(op.profit) || 0), 0);
          const roi = totalBetAmount > 0 ? (totalProfit / totalBetAmount) * 100 : 0;

          return {
            ...bank,
            bet_count: totalBets,
            gross_profit: totalProfit,
            roi: roi
          };
        })
      );
      
      console.log('Bancas recuperadas com operações:', banksWithOperations);
      setBanks(banksWithOperations);
      
    } catch (error) {
      console.error('Erro ao buscar bancas:', error);
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };
  
  const addBank = async (bankData: Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    let currentUserId = userId;
    
    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      currentUserId = session?.user?.id || null;
      
      if (currentUserId) {
        setUserId(currentUserId);
      } else {
        console.error('Não é possível adicionar banca: Nenhum usuário autenticado');
        throw new Error('Autenticação necessária');
      }
    }
    
    console.log('Adicionando banca para o usuário ID:', currentUserId);
    
    const { data, error } = await supabase
      .from('banks')
      .insert([{ ...bankData, user_id: currentUserId }])
      .select();
      
    if (error) {
      console.error('Erro de inserção do Supabase:', error);
      throw error;
    }
    
    if (data) {
      const newBanksWithBetCount = data.map(bank => ({
        ...bank,
        bet_count: 0
      }));
      setBanks(prevBanks => [...prevBanks, ...newBanksWithBetCount]);
    }
    
    return data;
  };

  const updateBank = async (id: string, updates: Partial<Bank>) => {
    if (!userId) {
      console.error('Não é possível atualizar banca: Nenhum usuário autenticado');
      throw new Error('Autenticação necessária');
    }
    
    console.log('Atualizando banca ID:', id, 'para usuário:', userId);
    
    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select();
      
    if (error) {
      console.error('Erro de atualização do Supabase:', error);
      throw error;
    }
    
    if (data && data[0]) {
      const existingBank = banks.find(bank => bank.id === id);
      const updatedBank = {
        ...data[0],
        bet_count: existingBank?.bet_count || 0
      };
      
      setBanks(prevBanks => prevBanks.map(bank => bank.id === id ? updatedBank : bank));
    }
    
    return data;
  };

  const deleteBank = async (id: string) => {
    if (!userId) {
      console.error('Não é possível excluir banca: Nenhum usuário autenticado');
      throw new Error('Autenticação necessária');
    }
    
    console.log('Excluindo banca ID:', id, 'para usuário:', userId);
    
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Erro de exclusão do Supabase:', error);
      throw error;
    }
    
    setBanks(prevBanks => prevBanks.filter(bank => bank.id !== id));
  };

  const formatCurrencyInput = (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    
    if (numericValue === '') return '';
    
    const floatValue = parseFloat(numericValue) / 100;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(floatValue);
  };

  const parseCurrencyValue = (value: string): number => {
    return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  };

  

  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setFormData({ ...formData, initialCapital: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert('Você deve estar logado para realizar esta ação');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const capitalValue = parseCurrencyValue(formData.initialCapital);
      
      if (editingBank) {
        await updateBank(editingBank.id, {
          name: formData.name,
          initial_capital: capitalValue
        });
      } else {
        await addBank({
          name: formData.name,
          initial_capital: capitalValue,
          roi: 0,
          gross_profit: 0,
          bet_count: 0
        });
      }
      
      setFormData({ name: '', initialCapital: '' });
      setIsModalOpen(false);
      setEditingBank(null);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Falha ao salvar banca. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, bankId: string) => {
    e.stopPropagation();
    
    if (!userId) {
      alert('Você deve estar logado para realizar esta ação');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta banca?')) {
      try {
        await deleteBank(bankId);
      } catch (error) {
        console.error('Erro ao excluir banca:', error);
        alert('Falha ao excluir banca. Por favor, tente novamente.');
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, bank: Bank) => {
    e.stopPropagation();
    setEditingBank(bank);
    
    const formattedCapital = formatCurrencyInput((bank.initial_capital * 100).toString());
    
    setFormData({
      name: bank.name,
      initialCapital: formattedCapital
    });
    setIsModalOpen(true);
  };

  const handleCardClick = (bankId: string) => {
    navigate(`/dashboard?bank=${bankId}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateOperatingCapital = (bank: Bank) => {
    return bank.initial_capital + bank.gross_profit;
  };

  const exportData = () => {
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  const calcularIndicadores = () => {
    if (!banks || banks.length === 0) {
      return {
        totalBancasAtivas: 0,
        saldoTotal: 0,
        roiMedioGlobal: 0,
        bancasComRoiNegativo: 0,
        bancasComSaldoZerado: 0
      };
    }

    // Calcula o saldo total (capital inicial + lucro) de todas as bancas
    const saldoTotal = banks.reduce(
      (acc, bank) => acc + bank.initial_capital + bank.gross_profit, 
      0
    );
    
    // Calcula o ROI médio global
    const roiMedioGlobal = banks.length > 0 ? 
      banks.reduce((acc, bank) => acc + bank.roi, 0) / banks.length : 
      0;
    
    // Conta bancas com ROI negativo
    const bancasComRoiNegativo = banks.filter(bank => bank.roi < 0).length;
    
    // Conta bancas com saldo zerado (capital inicial + lucro = 0)
    const bancasComSaldoZerado = banks.filter(bank => 
      bank.initial_capital + bank.gross_profit === 0
    ).length;
    
    // Calcula o total de apostas em todas as bancas
    const totalApostas = banks.reduce((acc, bank) => acc + (bank.bet_count || 0), 0);
    
    // Calcula o lucro total de todas as bancas
    const lucroTotal = banks.reduce((acc, bank) => acc + bank.gross_profit, 0);
    
    return {
      totalBancasAtivas: banks.length,
      saldoTotal,
      roiMedioGlobal,
      bancasComRoiNegativo,
      bancasComSaldoZerado,
      totalApostas,
      lucroTotal
    };
  };
  
  const indicadores = calcularIndicadores();

  if (loading && !authChecked) {
    return (
      <div className={`flex-1 p-8 flex justify-center items-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Determinar ícone com base no nome da banca
  const getBankIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('spock') || nameLower.includes('betfair')) return "🟢";
    if (nameLower.includes('maria') || nameLower.includes('betano')) return "🔸";
    if (nameLower.includes('lucro') || nameLower.includes('certo')) return "🔶";
    return "🔶"; // Ícone padrão
  };

  // Determinar status do ROI
  const getRoiStatus = (roi: number) => {
    if (roi > 0) return "positive";
    if (roi < 0) return "negative";
    return "neutral";
  };

  return (
    <div className={`min-h-screen flex-1 p-2 sm:p-4 md:p-6 lg:p-8 pt-20 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
      {/* Header - Responsive Fixed Header */}
      <div className={`fixed top-0 right-0 left-0 md:left-64 h-16 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'} shadow-sm z-40 transition-all duration-300 border-b`}>
        <div className="flex justify-between items-center h-full px-4 lg:px-8">
          <div className="text-lg md:text-xl font-bold truncate">Minhas Bancas</div>
          <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsVideoModalOpen(true)}
            className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors flex items-center gap-1`}
          >
            <Play className="w-5 h-5" />
            <span className="hidden md:inline text-sm">Como funciona</span>
          </button>
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors`}>
              <Bell className="w-5 h-5" />
            </button>
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors md:hidden`}>
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors hidden md:block`}>
              <Settings className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-2 ml-2 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-1 md:p-2 rounded-lg transition-colors`}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium hidden md:inline">Meu Perfil</span>
            </div>
          </div>
        </div>
      </div>

      {isVideoModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg w-full max-w-3xl overflow-hidden`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-medium text-lg">Como funciona</h3>
        <button 
          onClick={() => setIsVideoModalOpen(false)}
          className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="p-4">
        <div className="aspect-video w-full bg-black">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
      <div className="p-4 border-t flex justify-end">
        <button 
          onClick={() => setIsVideoModalOpen(false)}
          className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded`}
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
)}

      <div className="h-16"></div>

      <div className={` min-h-screen flex-1 p-2 sm:p-4 md:p-6 lg:p-8 pt-20 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minhas Bancas</p>
            <h1 className="text-2xl font-semibold">Minhas Bancas</h1>
          </div>
          <button
            onClick={exportData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Exportar Dados
          </button>
        </header>

        {/* Indicadores Gerais */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Indicadores Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow p-4 flex flex-col items-center justify-center`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total de Bancas Ativas</p>
              <p className="text-2xl font-bold">{indicadores.totalBancasAtivas}</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow p-4 flex flex-col items-center justify-center`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Saldo Total</p>
              <p className="text-2xl font-bold">{formatCurrency(indicadores.saldoTotal)}</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow p-4 flex flex-col items-center justify-center`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>ROI Médio Global</p>
              <p className={`text-2xl font-bold ${indicadores.roiMedioGlobal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {indicadores.roiMedioGlobal.toFixed(2)}%
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow p-4 flex flex-col items-center justify-center`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total de Apostas</p>
              <p className="text-2xl font-bold">{indicadores.totalApostas}</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow p-4 flex flex-col items-center justify-center`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Lucro Total</p>
              <p className={`text-2xl font-bold ${indicadores.lucroTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(indicadores.lucroTotal)}
              </p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow p-4 flex flex-col items-center justify-center`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Bancas com ROI Negativo</p>
              <p className="text-2xl font-bold text-red-500">{indicadores.bancasComRoiNegativo}</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg shadow p-4 flex flex-col items-center justify-center`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Bancas com Saldo Zerado</p>
              <p className="text-2xl font-bold text-yellow-500">{indicadores.bancasComSaldoZerado}</p>
            </div>
          </div>
        </section>

        {/* Bancas Ativas */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bancas Ativas</h2>
            <button
              onClick={() => {
                if (!userId) {
                  navigate('/login');
                  return;
                }
                setIsModalOpen(true);
                setFormData({ name: '', initialCapital: '' });
                setEditingBank(null);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              disabled={loading || isSubmitting}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Banca
            </button>
          </div>

          {loading && authChecked && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!userId && authChecked && !loading && (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>Entre com sua conta para visualizar suas bancas</p>
              <button 
                onClick={() => navigate('/login')} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ir para Login
              </button>
            </div>
          )}

          {userId && !loading && banks.length === 0 && (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>Você ainda não adicionou nenhuma banca</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {banks.map(bank => {
              const bankIcon = getBankIcon(bank.name);
              const roiStatus = getRoiStatus(bank.roi);
              
              return (
                <div
                  key={bank.id}
                  className="border-l-4 rounded-md overflow-hidden shadow-sm"
                  style={{
                    borderLeftColor:
                      roiStatus === "positive"
                        ? "#22c55e"
                        : roiStatus === "negative"
                          ? "#ef4444"
                          : "#f59e0b",
                  }}
                >
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{bankIcon}</span>
                      <h3 className="font-medium">{bank.name}</h3>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Capital Inicial:
                        </span>
                        <span className="text-sm">{formatCurrency(bank.initial_capital)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Lucro:
                        </span>
                        <span className="text-sm">{formatCurrency(bank.gross_profit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ROI - Progressão:
                        </span>
                        <span className={`text-sm px-2 py-1 rounded text-white ${
                          roiStatus === "positive"
                            ? "bg-green-500"
                            : roiStatus === "negative"
                              ? "bg-red-500"
                              : "bg-gray-500"
                        }`}>
                          {bank.roi.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Quantidade de Apostas:
                        </span>
                        <span className="text-sm">{bank.bet_count || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleCardClick(bank.id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Registrar Operação
                      </button>
                      <button
                        onClick={(e) => handleEdit(e, bank)}
                        className="bg-amber-500 text-white hover:bg-amber-600 px-3 py-2 rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, bank.id)}
                        className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Botão flutuante */}
        <button
          onClick={() => {
            if (!userId) {
              navigate('/login');
              return;
            }
            setIsModalOpen(true);
            setFormData({ name: '', initialCapital: '' });
            setEditingBank(null);
          }}
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white shadow-lg"
          disabled={loading || isSubmitting}
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Modal para adicionar/editar banca */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg p-6 w-full max-w-md`}>
              <h2 className="text-xl font-semibold mb-4">
                {editingBank ? 'Editar Banca' : 'Nova Banca'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Nome da Banca
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-6">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Capital Inicial
                  </label>
                  <input
                    type="text"
                    value={formData.initialCapital}
                    onChange={handleCapitalChange}
                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                    placeholder="R$ 0,00"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingBank(null);
                      setFormData({ name: '', initialCapital: '' });
                    }}
                    className={`px-4 py-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinhasBancas;