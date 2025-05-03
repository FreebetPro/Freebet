import React, { useState, useEffect } from 'react';
import { Check, Trash2, FileDown, Plus, Eye, EyeOff, Search, Upload, MessageCircle, Building2, ChevronDown, ChevronRight, Minus, ChevronUp } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useBettingHouses } from '../hooks/useBettingHouses';
import { formatCurrency } from '../utils/currency';
import { authService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
interface BetCardProps {
  id?: string;
  date: string;
  time: string;
  gameName: string;
  house1: string;
  house2: string;
  betAmount: number;
  result: number;
  profit: number;
  status?: string;
  user_id?: string; // Add user_id field
  promotion_id?: string; // Adicione esta linha se estiver faltando
  observacoes?: string; // Add this line
}

interface DayCardProps {
  date: string;
  bets: BetCardProps[];
}

interface MonthlyCardProps {
  month: string;
  days: DayCardProps[];
  userId?: string; // Add userId prop to filter data
}

interface OperationForm {
  id: string;
  status: string;
  casa1: string;
  cpf1: string;
  stake1: string;
  casa2: string;
  cpf2: string;
  stake2: string;
  // Original protection fields
  casaProt: string;
  cpfProt: string;
  stakeProt: string;
  // New protection fields
  casaProt2: string; 
  cpfProt2: string;
  stakeProt2: string;
  casaProt3: string;
  cpfProt3: string;
  stakeProt3: string;
  // Winner fields
  casaVencedora?: string;
  cpfVencedor?: string;
}

// Adicione essa interface para as promoções
interface Promotion {
  id: string;
  name: string;
}

// Crie um hook para buscar as promoções
export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('promotions')
          .select('id, name');
        
        if (error) throw error;
        
        console.log('Promoções carregadas do banco:', data);
        setPromotions(data || []);
      } catch (err: any) {
        console.error("Erro ao buscar promoções:", err);
        setError(err.message || "Falha ao carregar promoções");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, []);
  
  return { promotions, loading, error };
};


const statusOptions = [
  { value: 'Em Operação', color: 'bg-blue-100 text-blue-800' },
  { value: 'Finalizado', color: 'bg-green-100 text-green-800' },
  { value: 'Pendente', color: 'bg-red-100 text-red-800' }
];

// Format a Date object to DD/MM/YYYY
function formatDateToString(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Parse a string date in format YYYY-MM-DD to a Date object
function parseStringToDate(dateStr: string): Date {
  // Ensure we're working with a valid date string
  if (!dateStr || !dateStr.includes('-')) {
    console.error('Invalid date string:', dateStr);
    return new Date();
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date with UTC to avoid timezone issues
  const date = new Date(Date.UTC(year, month - 1, day));
  return date;
}

// Gets all days in a month, returning Date objects
function getDaysInMonth(monthStr: string): Date[] {
  const monthMap: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
    'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
    'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11,
    // Versões capitalizadas também
    'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3,
    'Maio': 4, 'Junho': 5, 'Julho': 6, 'Agosto': 7,
    'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
  };
  
  // Normaliza a entrada para lidar com formatos como "abril de 2025"
  const normalizedStr = monthStr.replace(/ de /, " ");
  
  // Divide a string em palavras
  const parts = normalizedStr.split(' ');
  
  // Último elemento é o ano
  const yearStr = parts[parts.length - 1];
  
  // Tudo antes do último elemento é o nome do mês
  const monthName = parts.slice(0, parts.length - 1).join(' ').toLowerCase();
  
  // Converte para números
  const year = parseInt(yearStr);
  const month = monthMap[monthName];
  
  // Verifica se ano e mês são válidos
  if (isNaN(year) || month === undefined) {
    console.error(`Não foi possível analisar o mês e ano de "${monthStr}". Mês: "${monthName}", Ano: "${yearStr}"`);
    // Usa data atual como fallback
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const days: Date[] = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }
  
  // Gera os dias do mês usando o fuso horário local
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: Date[] = [];
  const currentDate = new Date(firstDay);
  
  // Itera até o último dia do mês
  while (currentDate <= lastDay) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

// Create a new hook to get the current user from Supabase
export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching user session:", error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setCurrentUser({
            id: session.user.id
          });
        }
      } catch (err) {
        console.error("Failed to get current user:", err);
      } finally {
        setLoading(false);
      }
    };
    
    getCurrentUser();
  }, [supabase]);
  
  return { currentUser, loading };
};

export const MonthlyBetCard: React.FC<MonthlyCardProps> = ({ month, days }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedDayBets, setExpandedDayBets] = useState<BetCardProps[]>([]);

  // Calculate totals
  const totalBetAmount = days.reduce((sum, day) => 
    sum + day.bets.reduce((daySum, bet) => daySum + bet.betAmount, 0), 0);
  const totalResult = days.reduce((sum, day) => 
    sum + day.bets.reduce((daySum, bet) => daySum + bet.result, 0), 0);
  const totalProfit = days.reduce((sum, day) => 
    sum + day.bets.reduce((daySum, bet) => daySum + bet.profit, 0), 0);
  const roi = (totalProfit / totalBetAmount) * 100;

  // Get all days in the month
  const completeDays = getDaysInMonth(month);

  // Create a map of existing bets by date for quick lookup
  const betsByDate = new Map(days.map(day => [day.date, day.bets]));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-green-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-green-600" />
              )}
            </button>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{month}</h3>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-500 hover:text-gray-700"
              title={showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}
            >
              {showDetails ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>

            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Apostado</div>
                <div className={`text-lg font-semibold ${!showDetails ? 'blur-sm' : ''}`}>
                  {formatCurrency(totalBetAmount)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-500">Resultado Total</div>
                <div className={`text-lg font-semibold ${!showDetails ? 'blur-sm' : ''}`}>
                  {formatCurrency(totalResult)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-500">Lucro Total</div>
                <div className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'} ${!showDetails ? 'blur-sm' : ''}`}>
                  {formatCurrency(totalProfit)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-500">ROI</div>
                <div className={`text-lg font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'} ${!showDetails ? 'blur-sm' : ''}`}>
                  {roi.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-2">
          <div className="grid grid-cols-7 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
            {completeDays.map((day, index) => {
              const dayStr = formatDateToString(day);
              const dayBets = betsByDate.get(dayStr) || [];
              const hasBets = dayBets.length > 0;
              const dayProfit = dayBets.reduce((sum, bet) => sum + bet.profit, 0);

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (hasBets) {
                      setExpandedDay(dayStr);
                      setExpandedDayBets(dayBets);
                    }
                  }}
                  className={`p-2 text-center rounded-lg ${
                    hasBets
                      ? dayProfit >= 0
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">{day.getDate()}</div>
                  {hasBets && (
                    <div className="text-xs">
                      {formatCurrency(dayProfit)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {expandedDay && expandedDayBets.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              {expandedDayBets.map((bet, index) => (
                <BetCard key={index} {...bet} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DayCard: React.FC<DayCardProps & { 
  showDetails: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ date, bets, showDetails, isExpanded, onToggle }) => {
  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.betAmount, 0);
  const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);
  const roi = totalBetAmount > 0 ? (totalProfit / totalBetAmount) * 100 : 0;
  
  // Extract just the day number (DD) from the date string (DD/MM/YYYY)
  const dayNumber = date.split('/')[0];
  const hasBets = bets.length > 0;

  if (!showDetails) {
    return null;
  }

  return (
    <div 
      onClick={onToggle}
      className={`
        cursor-pointer rounded border p-2 w-[130px] h-[50px]
        ${hasBets ? (totalProfit > 0 ? 'bg-green-50 hover:bg-green-100 border-green-200' : totalProfit < 0 ? 'bg-red-50 hover:bg-red-100 border-red-200' : 'bg-gray-50 hover:bg-gray-100 border-gray-200') : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}
        ${isExpanded ? 'ring-2 ring-blue-500' : ''}
        transition-all duration-200
      `}
      style={{ minWidth: '130px', minHeight: '50px', maxWidth: '130px', maxHeight: '50px' }}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="text-sm font-bold">{dayNumber}</div>
          {hasBets && (
            <span className="text-[10px] text-gray-600">
              {bets.length} {bets.length === 1 ? 'aposta' : 'apostas'}
            </span>
          )}
        </div>
        {hasBets && (
          <div className="flex-1 flex items-center justify-center">
            <span className={`text-xs font-semibold ${totalProfit > 0 ? 'text-green-600' : totalProfit < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {formatCurrency(totalProfit)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BetCard: React.FC<BetCardProps> = ({
  id,
  date,
  time,
  gameName,
  house1: initialHouse1,
  house2: initialHouse2,
  betAmount: initialBetAmount,
  result: initialResult,
  profit: initialProfit,
  status,
  promotion_id,
  observacoes: initialObservacoes
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [operationForms, setOperationForms] = useState<Record<string, OperationForm>>({});
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(promotion_id || null);
  const [observacoes, setObservacoes] = useState<string | undefined>(initialObservacoes);
  const [casaVencedora, setCasaVencedora] = useState('');
  const [cpfVencedor, setCpfVencedor] = useState('');
  const { accounts, loading: accountsLoading } = useAccounts();
  const { bettingHouses, loading: housesLoading } = useBettingHouses();
  const [currentHouse1, setCurrentHouse1] = useState(initialHouse1);
  const [currentHouse2, setCurrentHouse2] = useState(initialHouse2);

  const { promotions, loading: loadingPromotions } = usePromotions();
  const [selectedPromotion, setSelectedPromotion] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });

  const [profit, setProfit] = useState(initialProfit);
  const [betAmount, setBetAmount] = useState(initialBetAmount);
  const [result, setResult] = useState(initialResult);
  const [showAllFields, setShowAllFields] = useState(false);

  // Adicionar estado para controlar o modal de confirmação
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Efeito para atualizar os valores quando as props mudarem
  useEffect(() => {
    setProfit(initialProfit);
    setBetAmount(initialBetAmount);
    setResult(initialResult);
    setCurrentHouse1(initialHouse1);
    setCurrentHouse2(initialHouse2);
    setObservacoes(initialObservacoes);
  }, [initialProfit, initialBetAmount, initialResult, initialHouse1, initialHouse2, initialObservacoes]);

  // Efeito para carregar os detalhes da operação quando o componente for montado
  useEffect(() => {
    if (id) {
      loadOperationDetails();
    }
  }, [id]);

  // Efeito para carregar os detalhes quando o componente for expandido
  useEffect(() => {
    if (isExpanded && selectedAccounts.length === 0) {
      loadOperationDetails();
    }
  }, [isExpanded]);

  // Função para deletar o registro
  const handleDelete = async () => {
    if (!id) return;
    
    setIsUpdating(true);
    try {
      // Primeiro deleta os detalhes da operação
      const { error: detailsError } = await supabase
        .from('betting_operation_details')
        .delete()
        .eq('betting_operation_id', id);

      if (detailsError) throw detailsError;

      // Depois deleta a operação principal
      const { error: operationError } = await supabase
        .from('betting_operations')
        .delete()
        .eq('id', id);

      if (operationError) throw operationError;

      setUpdateStatus({
        show: true,
        success: true,
        message: 'Registro excluído com sucesso!'
      });

      // Aguarda 2 segundos antes de recarregar a página
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao deletar registro:', error);
      setUpdateStatus({
        show: true,
        success: false,
        message: 'Erro ao excluir registro: ' + (error?.message || 'Tente novamente')
      });
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  // Função para obter o nome da casa pelo ID
  const getHouseName = (houseId: string) => {
    if (!houseId) return '';
    const house = bettingHouses.find(h => h.id === houseId);
    return house ? house.name : houseId;
  };

  const toggleAllAccounts = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map(acc => acc.id));
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts((prev: string[]) => {
      if (prev.includes(accountId)) {
        return prev.filter((id: string) => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  useEffect(() => {
    if (id) {
      loadOperationDetails();
    }
  }, [id]); // This will run when the component mounts if an id exists
  

  // Add this new function to load existing operation details
  const loadOperationDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // First, fetch the main operation data including observacoes
      const { data: betData, error: betError } = await supabase
        .from('betting_operations')
        .select('promotion_id, observacoes')
        .eq('id', id)
        .single();
      
      if (betError) throw betError;
      
      if (betData?.promotion_id) {
        setSelectedPromotionId(betData.promotion_id);
      }

      // Update the observacoes state
      if (betData?.observacoes) {
        setObservacoes(betData.observacoes);
      }
      
      // Continue loading operation details
      const { data, error } = await supabase
        .from('betting_operation_details')
        .select('*')
        .eq('betting_operation_id', id);
      
      if (error) throw error;
      
      console.log('Loaded operation details:', data);
      
      if (data && data.length > 0) {
        const formData: Record<string, OperationForm> = {};
        const accountIds: string[] = [];
        
        data.forEach(operation => {
          const accountId = operation.account_id;
          if (accountId) { // Make sure accountId exists
            accountIds.push(accountId);
            
            formData[accountId] = {
              id: accountId,
              status: status || 'Em Operação',
              casa1: operation.casa1 || '',
              cpf1: operation.cpf1 || accountId,
              stake1: operation.stake1 || '',
              casa2: operation.casa2 || '',
              cpf2: operation.cpf2 || '',
              stake2: operation.stake2 || '',
              casaProt: operation.casaprot || '',
              cpfProt: operation.cpfprot || '',
              stakeProt: operation.stakeprot || '',
              // Add new protection fields
              casaProt2: operation.casaprot2 || '',
              cpfProt2: operation.cpfprot2 || '',
              stakeProt2: operation.stakeprot2 || '',
              casaProt3: operation.casaprot3 || '',
              cpfProt3: operation.cpfprot3 || '',
              stakeProt3: operation.stakeprot3 || '',
              casaVencedora: operation.casavencedora || '',
              cpfVencedor: operation.cpfvencedor || ''
            };
          }
        });
        
        // Only update if we found accounts
        if (accountIds.length > 0) {
          setOperationForms(formData);
          setSelectedAccounts(accountIds);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da operação:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // Load operations when component expands
  useEffect(() => {
    if (isExpanded && selectedAccounts.length === 0) {
      loadOperationDetails();
    }
  }, [isExpanded]);

  useEffect(() => {
    // Use selectedPromotionId em vez de promotion_id já que é esse que está definido
    if (!loadingPromotions && selectedPromotionId && promotions.length > 0) {
      // Encontre a promoção com o ID correspondente
      const promotion = promotions.find(p => String(p.id) === String(selectedPromotionId));
      
      // Se encontrou, use o nome; caso contrário, use um fallback
      if (promotion) {
        setSelectedPromotion(promotion.name);
      } else {
        setSelectedPromotion(`Promoção #${selectedPromotionId.substring(0, 6)}...`);
      }
    }
  }, [selectedPromotionId, promotions, loadingPromotions]);

  useEffect(() => {
    console.log("Estado atual:", {
      promotion_id,
      promotions,
      loadingPromotions,
      selectedPromotionId,
      selectedPromotion
    });
  }, [promotion_id, promotions, loadingPromotions, selectedPromotionId, selectedPromotion]);

  useEffect(() => {
    console.log("Promoções carregadas:", promotions);
  }, [promotions]);

  // Add function to calculate and update result
  const updateResult = async (newProfit: number, totalBetAmount: number) => {
    // Result is typically bet_amount + profit
    const newResult = totalBetAmount + newProfit;
    setResult(newResult);

    try {
      await supabase
        .from('betting_operations')
        .update({ 
          result: newResult,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (error) {
      console.error('Erro ao atualizar resultado:', error);
    }
  };

  const updateStakeAndTotal = async (accountId: string, field: string, value: string) => {
    try {
      updateOperationForm(accountId, field as keyof OperationForm, value);

      let totalStake = 0;
      Object.values(operationForms).forEach(form => {
        const stake1 = parseFloat(form.stake1?.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        const stake2 = parseFloat(form.stake2?.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        const stakeProt = parseFloat(form.stakeProt?.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        const stakeProt2 = parseFloat(form.stakeProt2?.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        const stakeProt3 = parseFloat(form.stakeProt3?.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        
        totalStake += stake1 + stake2 + stakeProt + stakeProt2 + stakeProt3;
      });

      setBetAmount(totalStake);
      updateResult(profit, totalStake); // Update result when bet amount changes

      await supabase
        .from('betting_operations')
        .update({ 
          bet_amount: totalStake,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      const numericValue = parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      const fieldMap: { [key: string]: string } = {
        stake1: 'stake1',
        stake2: 'stake2',
        stakeProt: 'stakeprot',
        stakeProt2: 'stakeprot2',
        stakeProt3: 'stakeprot3'
      };

      updateData[fieldMap[field]] = numericValue.toString();

      await supabase
        .from('betting_operation_details')
        .update(updateData)
        .eq('betting_operation_id', id)
        .eq('account_id', accountId);

    } catch (error) {
      console.error('Erro ao atualizar valores:', error);
    }
  };

  const saveBetData = async (data: Record<string, any>) => {
    setIsUpdating(true);
    try {
      // Ensure numeric fields are properly formatted
      if (data.bet_amount !== undefined) {
        data.bet_amount = parseFloat(String(data.bet_amount)) || 0;
      }
      if (data.profit !== undefined) {
        data.profit = parseFloat(String(data.profit).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
      }
      
      data.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('betting_operations')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      setUpdateStatus({
        show: true,
        success: true,
        message: 'Atualizado com sucesso!'
      });
      
      setTimeout(() => {
        setUpdateStatus(prev => ({ ...prev, show: false }));
      }, 3000);
      
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar aposta:', error);
      setUpdateStatus({
        show: true,
        success: false,
        message: 'Erro ao atualizar: ' + (error?.message || error?.toString() || 'Tente novamente')
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateOperationForm = async (accountId: string, field: keyof OperationForm, value: string) => {
    setOperationForms(prev => {
      const updatedForm = {
        ...prev[accountId],
        [field]: value
      };
      
      if (field === 'status') {
        const newForms = { ...prev };
        Object.keys(newForms).forEach(id => {
          newForms[id] = {
            ...newForms[id],
            status: value
          };
        });
        return newForms;
      }

      // Atualiza as casas no cabeçalho quando mudar nos selects internos
      if (field === 'casa1') {
        setCurrentHouse1(value);
        // Atualiza apenas no betting_operation_details
        updateOperationDetails(accountId, 'casa1', value);
      } else if (field === 'casa2') {
        setCurrentHouse2(value);
        // Atualiza apenas no betting_operation_details
        updateOperationDetails(accountId, 'casa2', value);
      } else if (field === 'casaVencedora' || field === 'cpfVencedor') {
        // Atualiza os campos de vencedor no banco de dados
        updateOperationDetails(accountId, field, value);
      }
      
      return {
        ...prev,
        [accountId]: updatedForm
      };
    });
    
    if (field === 'status') {
      await saveBetData({ status: value });
    }
    
    if (accountId) {
      clearTimeout(window.updateTimeout);
      window.updateTimeout = setTimeout(() => {
        updateStakeAndTotal(accountId, field, value);
      }, 500);
    }
  };

  // Nova função para atualizar os detalhes da operação
  const updateOperationDetails = async (accountId: string, field: string, value: string) => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Mapeia os campos do formulário para os nomes das colunas no banco
      const fieldMap: { [key: string]: string } = {
        'casa1': 'casa1',
        'casa2': 'casa2',
        'stake1': 'stake1',
        'stake2': 'stake2',
        'casaProt': 'casaprot',
        'stakeProt': 'stakeprot',
        'casaProt2': 'casaprot2',
        'stakeProt2': 'stakeprot2',
        'casaProt3': 'casaprot3',
        'stakeProt3': 'stakeprot3',
        'casaVencedora': 'casavencedora',
        'cpfVencedor': 'cpfvencedor'
      };

      updateData[fieldMap[field] || field] = value;

      // Atualiza apenas na tabela betting_operation_details
      const { error: detailsError } = await supabase
        .from('betting_operation_details')
        .update(updateData)
        .eq('betting_operation_id', id)
        .eq('account_id', accountId);

      if (detailsError) throw detailsError;

    } catch (error) {
      console.error('Erro ao atualizar detalhes da operação:', error);
    }
  };

  // Função para atualizar o cabeçalho com as casas atuais
  const updateHeaderHouses = () => {
    // Pega a primeira operação para mostrar no cabeçalho
    const firstOperation = Object.values(operationForms)[0];
    if (firstOperation) {
      setCurrentHouse1(firstOperation.casa1);
      setCurrentHouse2(firstOperation.casa2);
    }
  };

  // Atualiza o cabeçalho quando as operações mudarem
  useEffect(() => {
    updateHeaderHouses();
  }, [operationForms]);

  const handlePromotionChange = async (promotion: Promotion) => {
    try {
      console.log('Selecionando promoção:', promotion.name, promotion.id);
      
      setSelectedPromotion(promotion.name);
      setSelectedPromotionId(promotion.id);
      setIsPromotionOpen(false);
      
      const resultado = await saveBetData({ promotion_id: promotion.id });
      
      if (resultado) {
        console.log('Promoção salva com sucesso no banco de dados');
      }
    } catch (erro) {
      console.error('Erro ao selecionar promoção:', erro);
    }
  };

  const truncateName = (name: string) => {
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
  };

  const roi = (profit / betAmount) * 100;
  
  const renderPromotionDropdown = () => {
    console.log('Rendering dropdown with:', {
      selectedPromotion,
      selectedPromotionId,
      loadingPromotions,
      promotionsAvailable: promotions.length
    });
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsPromotionOpen(!isPromotionOpen)}
          className={`px-3 py-1 text-sm border rounded-lg ${selectedPromotionId ? 'bg-green-50 text-green-700' : 'text-gray-700'} hover:bg-gray-50 flex items-center gap-2`}
          disabled={isUpdating || loadingPromotions}
        >
          {loadingPromotions 
            ? 'Carregando...' 
            : (selectedPromotion 
              ? selectedPromotion 
              : `Selecione (ID: ${selectedPromotionId ? selectedPromotionId.substring(0,6)+'...' : 'nenhum'})`)}
          <ChevronDown className="w-4 h-4" />
        </button>
        {isPromotionOpen && !loadingPromotions && (
          <div className="absolute z-20 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="py-1">
              {promotions.length > 0 ? (
                promotions.map((promotion) => (
                  <button
                    key={promotion.id}
                    onClick={() => handlePromotionChange(promotion)}
                    className={`w-full px-4 py-2 text-left text-sm ${
                      selectedPromotionId === promotion.id ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {promotion.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Nenhuma promoção disponível
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

// Função modificada para permitir duplicar usando a mesma conta
const duplicateOperation = async (sourceAccountId: string) => {
  setIsUpdating(true);
  
  try {
    // Get source form data to duplicate
    const sourceForm = operationForms[sourceAccountId];
    
    // Find an unused account to use for the duplicate
    const usedAccountIds = selectedAccounts;
    const availableAccounts = accounts.filter(account => 
      !usedAccountIds.includes(account.id)
    );
    
    if (availableAccounts.length === 0) {
      throw new Error("Não há contas disponíveis para duplicação. Todas as contas já estão em uso.");
    }
    
    // Use the first available account
    const newAccountId = availableAccounts[0].id;
    
    // Create a copy of the form data
    const newFormData = {
      ...sourceForm,
      id: newAccountId,
      cpf1: newAccountId // Update the CPF1 field to match the new account
    };
    
    // Insert new record with the different account_id
    const { data, error } = await supabase
      .from('betting_operation_details')
      .insert({
        betting_operation_id: id,
        account_id: newAccountId,
        casa1: newFormData.casa1,
        cpf1: newFormData.cpf1,
        stake1: newFormData.stake1,
        casa2: newFormData.casa2,
        cpf2: newFormData.cpf2,
        stake2: newFormData.stake2,
        casaprot: newFormData.casaProt,
        cpfprot: newFormData.cpfProt,
        stakeprot: newFormData.stakeProt,
        casaprot2: newFormData.casaProt2,
        cpfprot2: newFormData.cpfProt2,
        stakeprot2: newFormData.stakeProt2,
        casaprot3: newFormData.casaProt3,
        cpfprot3: newFormData.cpfProt3,
        stakeprot3: newFormData.stakeProt3,
        casavencedora: newFormData.casaVencedora,
        cpfvencedor: newFormData.cpfVencedor,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Update local state
    setSelectedAccounts(prev => [...prev, newAccountId]);
    setOperationForms(prev => ({
      ...prev,
      [newAccountId]: newFormData
    }));
    
    // Reload operation details
    await loadOperationDetails();
    
    setUpdateStatus({
      show: true,
      success: true,
      message: 'Operação duplicada com sucesso!'
    });
    
    setTimeout(() => {
      setUpdateStatus(prev => ({ ...prev, show: false }));
    }, 3000);
    
  } catch (error: any) {
    console.error('Erro ao duplicar operação:', error);
    setUpdateStatus({
      show: true,
      success: false,
      message: 'Erro ao duplicar: ' + (error?.message || error?.toString() || 'Tente novamente')
    });
  } finally {
    setIsUpdating(false);
  }
};
  
// Função para verificar se uma proteção está vazia
const isProtectionEmpty = (form: OperationForm, index: number) => {
  if (index === 1) {
    return !form.casaProt && !form.cpfProt && !form.stakeProt;
  } else if (index === 2) {
    return !form.casaProt2 && !form.cpfProt2 && !form.stakeProt2;
  } else if (index === 3) {
    return !form.casaProt3 && !form.cpfProt3 && !form.stakeProt3;
  }
  return false;
};

// Função para verificar se há alguma proteção preenchida
const hasAnyProtection = (form: OperationForm) => {
  return (
    (form.casaProt || form.cpfProt || form.stakeProt) ||
    (form.casaProt2 || form.cpfProt2 || form.stakeProt2) ||
    (form.casaProt3 || form.cpfProt3 || form.stakeProt3)
  );
};

// Adicionar função para deletar uma linha específica
const deleteOperationLine = async (accountId: string) => {
  if (!id) return;
  
  setIsUpdating(true);
  try {
    // Deleta apenas a linha específica da operação
    const { error: detailsError } = await supabase
      .from('betting_operation_details')
      .delete()
      .eq('betting_operation_id', id)
      .eq('account_id', accountId);

    if (detailsError) throw detailsError;

    // Atualiza o estado local
    setSelectedAccounts(prev => prev.filter(acc => acc !== accountId));
    setOperationForms(prev => {
      const newForms = { ...prev };
      delete newForms[accountId];
      return newForms;
    });

    setUpdateStatus({
      show: true,
      success: true,
      message: 'Linha excluída com sucesso!'
    });

    setTimeout(() => {
      setUpdateStatus(prev => ({ ...prev, show: false }));
    }, 2000);

  } catch (error: any) {
    console.error('Erro ao deletar linha:', error);
    setUpdateStatus({
      show: true,
      success: false,
      message: 'Erro ao excluir linha: ' + (error?.message || 'Tente novamente')
    });
  } finally {
    setIsUpdating(false);
  }
};

const renderOperationForm = (accountId: string, index: number) => {
  const form = operationForms[accountId];

  // Verifica quais proteções estão vazias
  const protEmpty2 = isProtectionEmpty(form, 2);
  const protEmpty3 = isProtectionEmpty(form, 3);

  // Só mostra o botão se houver pelo menos uma proteção vazia
  const hasHiddenProtections = protEmpty2 || protEmpty3;

  // Mostra campos se: não estão vazios OU showAllFields está true
  const showProt2 = !protEmpty2 || showAllFields;
  const showProt3 = !protEmpty3 || showAllFields;

  // Monta dinamicamente os cabeçalhos e campos de proteção
  const protectionHeaders = [
    { label: 'Casa Prot. 1' },
    { label: 'CPF Prot. 1' },
    { label: 'Stake Prot. 1' },
    ...(showProt2 ? [
      { label: 'Casa Prot. 2' },
      { label: 'CPF Prot. 2' },
      { label: 'Stake Prot. 2' },
    ] : []),
    ...(showProt3 ? [
      { label: 'Casa Prot. 3' },
      { label: 'CPF Prot. 3' },
      { label: 'Stake Prot. 3' },
    ] : []),
  ];

  return (
    <div key={accountId} className={`mb-2 ${index > 0 ? 'mt-2 pt-2 border-t border-gray-200' : ''}`}>
      {/* Botões de ação */}
      <div className="flex justify-end items-center gap-2 mb-2">
        <button
          onClick={() => duplicateOperation(accountId)}
          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-sm flex items-center gap-1 hover:bg-blue-100 transition-colors"
          disabled={isUpdating}
          title="Duplicar esta operação para outra conta"
        >
          <Plus className="w-4 h-4" /> Duplicar
        </button>
        <button
          onClick={() => {
            if (selectedAccounts.length > 1) {
              // Se houver mais de uma linha, exclui direto
              deleteOperationLine(accountId);
            } else {
              // Se for a última linha, mostra confirmação
              setShowDeleteConfirm(true);
            }
          }}
          className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-sm flex items-center gap-1 hover:bg-red-100 transition-colors"
          disabled={isUpdating}
          title="Excluir esta linha"
        >
          <Trash2 className="w-4 h-4" /> Excluir
        </button>
      </div>
      
      {/* Initial fields - Activation + First Protection */}
      <div className="grid grid-cols-11 gap-4 mb-2">
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">Casa 1 Ativação</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">CPF 1 Ativação</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">Stake 1</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">Casa 2 Ativação</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">CPF 2 Ativação</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">Stake 2</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">Casa Proteção 1</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">CPF Proteção 1</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">Stake Prot. 1</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">Casa Vencedora</span>
        </div>
        <div className="col-span-1">
          <span className="text-sm font-medium text-gray-600">CPF Vencedor</span>
        </div>
      </div>

      {/* Row 1: Original fields */}
      <div className="grid grid-cols-11 gap-4 mb-4">
        <div className="col-span-1">
          <select 
            className="w-full p-2 border rounded-md bg-white"
            value={form.casa1}
            onChange={(e) => updateOperationForm(accountId, 'casa1', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {bettingHouses.map(house => (
              <option key={house.id} value={house.id}>{house.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <select 
            className="w-full p-2 border rounded-md bg-white"
            value={form.cpf1}
            onChange={(e) => updateOperationForm(accountId, 'cpf1', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id} title={account.name}>
                {truncateName(account.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <input
            type="text"
            className="w-full p-2 border rounded-md bg-white"
            placeholder="R$ 0,00"
            value={form.stake1}
            onChange={(e) => updateStakeAndTotal(accountId, 'stake1', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="col-span-1">
          <select 
            className="w-full p-2 border rounded-md bg-white"
            value={form.casa2}
            onChange={(e) => updateOperationForm(accountId, 'casa2', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {bettingHouses.map(house => (
              <option key={house.id} value={house.id}>{house.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <select 
            className="w-full p-2 border rounded-md bg-white"
            value={form.cpf2}
            onChange={(e) => updateOperationForm(accountId, 'cpf2', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id} title={account.name}>
                {truncateName(account.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <input
            type="text"
            className="w-full p-2 border rounded-md bg-white"
            placeholder="R$ 0,00"
            value={form.stake2}
            onChange={(e) => updateStakeAndTotal(accountId, 'stake2', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="col-span-1">
          <select 
            className="w-full p-2 border rounded-md bg-white"
            value={form.casaProt}
            onChange={(e) => updateOperationForm(accountId, 'casaProt', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {bettingHouses.map(house => (
              <option key={house.id} value={house.id}>{house.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <select 
            className="w-full p-2 border rounded-md bg-white"
            value={form.cpfProt}
            onChange={(e) => updateOperationForm(accountId, 'cpfProt', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id} title={account.name}>
                {truncateName(account.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <input
            type="text"
            className="w-full p-2 border rounded-md bg-white"
            placeholder="R$ 0,00"
            value={form.stakeProt}
            onChange={(e) => updateStakeAndTotal(accountId, 'stakeProt', e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="col-span-1">
          <select 
            className={`w-full p-2 border rounded-md ${
              form.casaVencedora ? 'bg-green-50' : 'bg-white'
            }`}
            value={form.casaVencedora || ''}
            onChange={(e) => updateOperationForm(accountId, 'casaVencedora', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {bettingHouses.map(house => (
              <option key={house.id} value={house.id}>{house.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <select 
            className={`w-full p-2 border rounded-md ${
              form.cpfVencedor ? 'bg-green-50' : 'bg-white'
            }`}
            value={form.cpfVencedor || ''}
            onChange={(e) => updateOperationForm(accountId, 'cpfVencedor', e.target.value)}
            disabled={isUpdating}
          >
            <option value="">Selecione</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id} title={account.name}>
                {truncateName(account.name)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Protection Fields */}
      <div className="w-full">
        <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Protection 1 */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">Casa Prot. 1</span>
            <select 
              className="w-full p-2 border rounded-md bg-white"
              value={form.casaProt}
              onChange={(e) => updateOperationForm(accountId, 'casaProt', e.target.value)}
              disabled={isUpdating}
            >
              <option value="">Selecione</option>
              {bettingHouses.map(house => (
                <option key={house.id} value={house.id}>{house.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">CPF Prot. 1</span>
            <select 
              className="w-full p-2 border rounded-md bg-white"
              value={form.cpfProt}
              onChange={(e) => updateOperationForm(accountId, 'cpfProt', e.target.value)}
              disabled={isUpdating}
            >
              <option value="">Selecione</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id} title={account.name}>
                  {truncateName(account.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">Stake Prot. 1</span>
            <input
              type="text"
              className="w-full p-2 border rounded-md bg-white"
              placeholder="R$ 0,00"
              value={form.stakeProt}
              onChange={(e) => updateStakeAndTotal(accountId, 'stakeProt', e.target.value)}
              disabled={isUpdating}
            />
          </div>

          {/* Protection 2 */}
          {showProt2 && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-600">Casa Prot. 2</span>
                <select 
                  className="w-full p-2 border rounded-md bg-white"
                  value={form.casaProt2}
                  onChange={(e) => updateOperationForm(accountId, 'casaProt2', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Selecione</option>
                  {bettingHouses.map(house => (
                    <option key={house.id} value={house.id}>{house.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-600">CPF Prot. 2</span>
                <select 
                  className="w-full p-2 border rounded-md bg-white"
                  value={form.cpfProt2}
                  onChange={(e) => updateOperationForm(accountId, 'cpfProt2', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Selecione</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id} title={account.name}>
                      {truncateName(account.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-600">Stake Prot. 2</span>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md bg-white"
                  placeholder="R$ 0,00"
                  value={form.stakeProt2}
                  onChange={(e) => updateStakeAndTotal(accountId, 'stakeProt2', e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </>
          )}

          {/* Protection 3 */}
          {showProt3 && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-600">Casa Prot. 3</span>
                <select 
                  className="w-full p-2 border rounded-md bg-white"
                  value={form.casaProt3}
                  onChange={(e) => updateOperationForm(accountId, 'casaProt3', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Selecione</option>
                  {bettingHouses.map(house => (
                    <option key={house.id} value={house.id}>{house.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-600">CPF Prot. 3</span>
                <select 
                  className="w-full p-2 border rounded-md bg-white"
                  value={form.cpfProt3}
                  onChange={(e) => updateOperationForm(accountId, 'cpfProt3', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Selecione</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id} title={account.name}>
                      {truncateName(account.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-600">Stake Prot. 3</span>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md bg-white"
                  placeholder="R$ 0,00"
                  value={form.stakeProt3}
                  onChange={(e) => updateStakeAndTotal(accountId, 'stakeProt3', e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {/* Toggle button for protection fields */}
      {hasHiddenProtections && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowAllFields(!showAllFields)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {showAllFields ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ocultar campos adicionais
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Mostrar campos adicionais
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-2 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center rounded-lg z-30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {updateStatus.show && (
        <div className={`absolute top-2 right-2 px-4 py-2 rounded-md text-white text-sm z-40 ${
          updateStatus.success ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {updateStatus.message}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        {/* Cabeçalho com botões de ação */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-green-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-green-600" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={operationForms[Object.keys(operationForms)[0]]?.status || status || 'Em Operação'}
              onChange={(e) => {
                const newStatus = e.target.value;
                Object.keys(operationForms).forEach(accountId => {
                  updateOperationForm(accountId, 'status', newStatus);
                });
                saveBetData({ status: newStatus });
              }}
              className={`px-3 py-1 rounded-lg text-sm ${
                statusOptions.find(opt => opt.value === (operationForms[Object.keys(operationForms)[0]]?.status || status))?.color || 'bg-blue-100 text-blue-800'
              }`}
              disabled={isUpdating}
            >
              {statusOptions.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                  className={option.color}
                >
                  {option.value}
                </option>
              ))}
            </select>
            {renderPromotionDropdown()}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Excluir registro"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informações do Jogo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs text-gray-500">{time}</div>
            <div className="text-lg font-medium text-gray-800">{gameName}</div>
            <div className="flex items-center gap-2 text-gray-700">
              <span>{getHouseName(currentHouse1)}</span>
              <span className="text-gray-400">vs</span>
              <span>{getHouseName(currentHouse2)}</span>
            </div>
            {observacoes && (
              <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
                {observacoes}
              </div>
            )}
          </div>

          {/* Valores e Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {formatCurrency(betAmount)}
              </div>
              <div className="text-sm text-gray-500">Apostado</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                {formatCurrency(result)}
              </div>
              <div className="text-sm text-gray-500">Resultado</div>
            </div>

            <div className="text-center">
              <div className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <input
                  type="text"
                  className={`w-24 text-center border border-gray-300 rounded-md py-1 bg-white ${
                    profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                  value={formatCurrency(profit)}
                  onChange={async (e) => {
                    const newValue = e.target.value.replace(/[R$\s.]/g, '').replace(',', '.');
                    const newProfit = parseFloat(newValue) || 0;
                    setProfit(newProfit);
                    updateResult(newProfit, betAmount);
                    
                    try {
                      await supabase
                        .from('betting_operations')
                        .update({ 
                          profit: newProfit,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', id);
                    } catch (error) {
                      console.error('Erro ao atualizar lucro:', error);
                    }
                  }}
                />
              </div>
              <div className="text-sm text-gray-500">Lucro</div>
            </div>

            <div className="text-center">
              <div className={`text-lg font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-500">ROI</div>
            </div>
          </div>
        </div>

        {/* Conteúdo expandido */}
        {isExpanded && (
          <div className="mt-4 pl-9 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {selectedAccounts.map((accountId, index) => renderOperationForm(accountId, index))}
              {selectedAccounts.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  Selecione CPFs para gerenciar operações
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Declare window interface
declare global {
  interface Window {
    updateTimeout: NodeJS.Timeout;
  }
}