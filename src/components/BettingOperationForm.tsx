import React, { useState, useEffect } from 'react';
import { X, Plus, Trash, Calendar, Clock, DollarSign, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBanks } from '../hooks/useBanks';

interface BettingHouse {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
  cpf: string;
}

interface Activation {
  house_id: string;
  cpf_id: string;
  stake: string;
  odd: string;
  tipo: string;
}

interface Protection {
  house_id: string;
  cpf_id: string;
  stake: string;
  odd: string;
  tipo: string;
}

interface BettingOperationFormProps {
  onClose: () => void;
  onSuccess: () => void;
  selectedBank: string | null;
  banks?: any[];
}

export const BettingOperationForm: React.FC<BettingOperationFormProps> = ({ onClose, onSuccess, selectedBank, banks: propBanks }) => {
  const { banks: hookBanks, loading: loadingBanks } = propBanks ? { banks: propBanks, loading: false } : useBanks();
  const banks = propBanks || hookBanks;
  const [bettingHouses, setBettingHouses] = useState<BettingHouse[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [userBanks, setUserBanks] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [modoRegistro, setModoRegistro] = useState('padrao');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    game_name: '',
    bank_id: selectedBank || '',
    status: 'Em Operação',
    procedimento: 'Aumento 25%',
    promotion_id: '',
    activations: [
      { house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Back' }
    ],
    protections: [
      { house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Lay' }
    ],
    total_apostado: '',
    resultado_total: '',
    lucro: '',
    roi: '',
    casa_vencedora: '',
    cpf_vencedor: '',
    quem_ganhou: 'Ativação #01',
    aplicar_todas_linhas: false,
    observacoes: ''
  });

  const [formDataPadrao, setFormDataPadrao] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    game_name: '',
    bank_id: selectedBank || '',
    status: 'Em Operação',
    promotion_id: '',
    activations: [{ house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Back' }],
    protections: [{ house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Lay' }],
    total_apostado: '',
    resultado_total: '',
    lucro: '',
    roi: '',
    casa_vencedora: '',
    cpf_vencedor: '',
    observacoes: ''
  });

  useEffect(() => {
    getCurrentUser();
    fetchBettingHouses();
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserAccounts();
      fetchUserBanks();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedBank) {
      setFormData(prev => ({ ...prev, bank_id: selectedBank }));
    }
  }, [selectedBank]);

  const getCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    } catch (err) {
      console.error("Falha ao obter usuário atual:", err);
    }
  };

  const fetchUserBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setUserBanks(data || []);
    } catch (error) {
      console.error('Erro ao buscar bancos do usuário:', error);
    }
  };

  const fetchBettingHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('betting_houses')
        .select('*')
        .order('name');

      if (error) throw error;
      setBettingHouses(data || []);
    } catch (error) {
      console.error('Erro ao buscar casas de apostas:', error);
    }
  };

  const fetchUserAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Erro ao buscar contas do usuário:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('name');

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (modoRegistro === 'padrao') {
      setFormDataPadrao({ ...formDataPadrao, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (modoRegistro === 'padrao') {
      setFormDataPadrao({ ...formDataPadrao, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: checked });
    }
  };

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) rawValue = "0";

    const number = parseFloat(rawValue) / 100;
    const formattedValue = number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    if (modoRegistro === 'padrao') {
      setFormDataPadrao(prev => {
        const updatedData = { ...prev, [field]: formattedValue };

        if (field === 'total_apostado' || field === 'lucro') {
          const totalApostado = parseCurrencyValue(field === 'total_apostado' ? formattedValue : prev.total_apostado);
          const lucro = parseCurrencyValue(field === 'lucro' ? formattedValue : prev.lucro);

          if (!isNaN(totalApostado) && !isNaN(lucro)) {
            const resultadoTotal = totalApostado + lucro;
            updatedData.resultado_total = resultadoTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });

            if (totalApostado > 0) {
              const roiValue = (lucro / totalApostado) * 100;
              updatedData.roi = roiValue.toFixed(2);
            }
          }
        }

        return updatedData;
      });
    } else {
      setFormData(prev => {
        const updatedData = { ...prev, [field]: formattedValue };

        if (field === 'total_apostado' || field === 'lucro') {
          const totalApostado = parseCurrencyValue(field === 'total_apostado' ? formattedValue : prev.total_apostado);
          const lucro = parseCurrencyValue(field === 'lucro' ? formattedValue : prev.lucro);

          if (!isNaN(totalApostado) && !isNaN(lucro)) {
            const resultadoTotal = totalApostado + lucro;
            updatedData.resultado_total = resultadoTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });

            if (totalApostado > 0) {
              const roiValue = (lucro / totalApostado) * 100;
              updatedData.roi = roiValue.toFixed(2);
            }
          }
        }

        return updatedData;
      });
    }
  };

  const handleActivationChange = (index: number, field: string, value: string) => {
    const updatedActivations = [...formData.activations];
    updatedActivations[index] = { ...updatedActivations[index], [field]: value };

    setFormData({ ...formData, activations: updatedActivations });

    if (field === 'stake') {
      updateTotalApostado();
    }
  };

  const handleProtectionChange = (index: number, field: string, value: string) => {
    const updatedProtections = [...formData.protections];
    updatedProtections[index] = { ...updatedProtections[index], [field]: value };

    setFormData({ ...formData, protections: updatedProtections });

    if (field === 'stake') {
      updateTotalApostado();
    }
  };

  const addActivation = () => {
    if (formData.activations.length < 2) {
      setFormData({
        ...formData,
        activations: [...formData.activations, { house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Back' }]
      });
    }
  };

  const removeActivation = (index: number) => {
    const updatedActivations = formData.activations.filter((_, i) => i !== index);
    setFormData({ ...formData, activations: updatedActivations });
    updateTotalApostado();
  };

  const addProtection = () => {
    if (formData.protections.length < 3) {
      setFormData({
        ...formData,
        protections: [...formData.protections, { house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Lay' }]
      });
    }
  };

  const removeProtection = (index: number) => {
    const updatedProtections = formData.protections.filter((_, i) => i !== index);
    setFormData({ ...formData, protections: updatedProtections });
    updateTotalApostado();
  };

  const updateTotalApostado = () => {
    let total = 0;

    formData.activations.forEach(activation => {
      total += parseCurrencyValue(activation.stake);
    });

    formData.protections.forEach(protection => {
      total += parseCurrencyValue(protection.stake);
    });

    const formattedValue = total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setFormData(prev => {
      const updatedData = { ...prev, total_apostado: formattedValue };

      const lucro = parseCurrencyValue(prev.lucro);
      if (!isNaN(lucro)) {
        const resultadoTotal = total + lucro;
        updatedData.resultado_total = resultadoTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        // Calcular ROI
        if (total > 0) {
          const roiValue = (lucro / total) * 100;
          updatedData.roi = roiValue.toFixed(2);
        }
      }

      return updatedData;
    });
  };

  const parseCurrencyValue = (value: string): number => {
    if (!value) return 0;
    // Remover formatação e converter para número
    const normalized = value.replace(/[R$\s.]/g, '').replace(',', '.');
    const numValue = parseFloat(normalized) || 0;
    return numValue;
  };

  const validate = () => {
    try {
      if (modoRegistro === 'padrao') {
        if (!formDataPadrao.date) { setError('Data da operação é obrigatória'); return false; }
        if (!formDataPadrao.game_name) { setError('Nome do jogo é obrigatório'); return false; }
        if (!formDataPadrao.bank_id) { setError('Banca é obrigatória'); return false; }
        if (!formDataPadrao.activations[0].house_id) { setError('Casa de apostas é obrigatória'); return false; }
        if (!formDataPadrao.activations[0].cpf_id) { setError('CPF é obrigatório'); return false; }
        if (!formDataPadrao.activations[0].stake) { setError('Stake é obrigatório'); return false; }
        if (!userId) { setError('Usuário não identificado'); return false; }
      } else {
        if (!formData.date) { setError('Data da operação é obrigatória'); return false; }
        if (!formData.game_name) { setError('Nome do jogo é obrigatório'); return false; }
        if (!formData.bank_id) { setError('Banca é obrigatória'); return false; }
        if (!formData.activations[0].house_id) { setError('Casa de apostas é obrigatória'); return false; }
        if (!formData.activations[0].cpf_id) { setError('CPF é obrigatório'); return false; }
        if (!formData.activations[0].stake) { setError('Stake é obrigatório'); return false; }
        if (!userId) { setError('Usuário não identificado'); return false; }
      }

      setError('');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const formatDateForDB = (dateString: string) => {
    if (!dateString) return null;
    return dateString; // PostgreSQL aceita formato ISO YYYY-MM-DD
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validação inicial
      if (!validate()) {
        setIsSubmitting(false);
        return;
      }

      // Prepara os dados da operação
      const operation = {
        date: formData.date,
        time: formData.time,
        game_name: formData.game_name,
        house1_id: formData.activations[0]?.house_id,
        house2_id: formData.activations[1]?.house_id || null,
        bet_amount: parseCurrencyValue(formData.total_apostado),
        result: parseCurrencyValue(formData.resultado_total),
        profit: parseCurrencyValue(formData.lucro),
        status: 'Em Operação',
        bank_id: formData.bank_id,
        promotion_id: formData.promotion_id || null,
        observacoes: formData.observacoes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Dados da operação preparados:', operation);

      // Insere a operação e retorna os dados inseridos
      const { data: insertedOperation, error: insertError } = await supabase
        .from('betting_operations')
        .insert([operation])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Operação inserida com sucesso:', insertedOperation);

      // Prepara os detalhes da operação
      const operationDetails = formData.activations
        .filter((activation): activation is Activation => activation !== null && typeof activation === 'object')
        .map(activation => ({
          betting_operation_id: insertedOperation.id,
          account_id: activation.cpf_id || null,
          casa1: activation.house_id || null,
          cpf1: activation.cpf_id || null,
          stake1: activation.stake || null,
          casa2: formData.activations[1]?.house_id || null,
          cpf2: formData.activations[1]?.cpf_id || null,
          stake2: formData.activations[1]?.stake || null,
          casaprot: formData.protections[0]?.house_id || null,
          cpfprot: formData.protections[0]?.cpf_id || null,
          stakeprot: formData.protections[0]?.stake || null,
          casaprot2: formData.protections[1]?.house_id || null,
          cpfprot2: formData.protections[1]?.cpf_id || null,
          stakeprot2: formData.protections[1]?.stake || null,
          casaprot3: formData.protections[2]?.house_id || null,
          cpfprot3: formData.protections[2]?.cpf_id || null,
          stakeprot3: formData.protections[2]?.stake || null,
          casavencedora: formData.casa_vencedora || null,
          cpfvencedor: formData.cpf_vencedor || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      console.log('Detalhes da operação preparados:', operationDetails);

      // Insere os detalhes da operação
      const { error: detailsError } = await supabase
        .from('betting_operation_details')
        .insert(operationDetails);

      if (detailsError) throw detailsError;

      console.log('Detalhes da operação inseridos com sucesso');

      // Notifica sucesso e recarrega a página
      onSuccess();
      window.location.reload();
    } catch (err) {
      console.error('Erro ao salvar operação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar operação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPadrao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validação inicial
      if (!validate()) {
        setIsSubmitting(false);
        return;
      }

      // Prepara os dados da operação
      const operation = {
        date: formDataPadrao.date,
        time: formDataPadrao.time,
        game_name: formDataPadrao.game_name,
        house1_id: formDataPadrao.activations[0]?.house_id,
        house2_id: formDataPadrao.activations[1]?.house_id || null,
        bet_amount: parseCurrencyValue(formDataPadrao.total_apostado),
        result: parseCurrencyValue(formDataPadrao.resultado_total),
        profit: parseCurrencyValue(formDataPadrao.lucro),
        status: 'Em Operação',
        bank_id: formDataPadrao.bank_id,
        promotion_id: formDataPadrao.promotion_id || null,
        observacoes: formDataPadrao.observacoes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Dados da operação preparados:', operation);

      // Insere a operação e retorna os dados inseridos
      const { data: insertedOperation, error: insertError } = await supabase
        .from('betting_operations')
        .insert([operation])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Operação inserida com sucesso:', insertedOperation);

      // Prepara os detalhes da operação
      const operationDetails = formDataPadrao.activations
        .filter((activation): activation is Activation => activation !== null && typeof activation === 'object')
        .map(activation => ({
          betting_operation_id: insertedOperation.id,
          account_id: activation.cpf_id || null,
          casa1: activation.house_id || null,
          cpf1: activation.cpf_id || null,
          stake1: activation.stake || null,
          casa2: formDataPadrao.activations[1]?.house_id || null,
          cpf2: formDataPadrao.activations[1]?.cpf_id || null,
          stake2: formDataPadrao.activations[1]?.stake || null,
          casaprot: formDataPadrao.protections[0]?.house_id || null,
          cpfprot: formDataPadrao.protections[0]?.cpf_id || null,
          stakeprot: formDataPadrao.protections[0]?.stake || null,
          casaprot2: formDataPadrao.protections[1]?.house_id || null,
          cpfprot2: formDataPadrao.protections[1]?.cpf_id || null,
          stakeprot2: formDataPadrao.protections[1]?.stake || null,
          casaprot3: formDataPadrao.protections[2]?.house_id || null,
          cpfprot3: formDataPadrao.protections[2]?.cpf_id || null,
          stakeprot3: formDataPadrao.protections[2]?.stake || null,
          casavencedora: formDataPadrao.casa_vencedora || null,
          cpfvencedor: formDataPadrao.cpf_vencedor || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      console.log('Detalhes da operação preparados:', operationDetails);

      // Insere os detalhes da operação
      const { error: detailsError } = await supabase
        .from('betting_operation_details')
        .insert(operationDetails);

      if (detailsError) throw detailsError;

      console.log('Detalhes da operação inseridos com sucesso');

      // Notifica sucesso e recarrega a página
      onSuccess();
      window.location.reload();
    } catch (err) {
      console.error('Erro ao salvar operação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar operação');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções auxiliares para mostrar nomes no UI
  const getHouseName = (houseId: string) => {
    if (!houseId) return null;
    const house = bettingHouses.find(h => h.id === houseId);
    return house?.name || null;
  };

  const getAccountCPF = (accountId: string) => {
    if (!accountId) return null;
    const account = accounts.find(a => a.id === accountId);
    return account?.cpf || null;
  };

  const handleActivationChangePadrao = (index: number, field: string, value: string) => {
    setFormDataPadrao(prev => {
      const updatedActivations = [...prev.activations];
      updatedActivations[index] = { ...updatedActivations[index], [field]: value };

      const updatedData = {
        ...prev,
        activations: updatedActivations
      };

      if (field === 'stake') {
        updateTotalApostadoPadrao(updatedData);
      }

      return updatedData;
    });
  };

  const handleProtectionChangePadrao = (index: number, field: string, value: string) => {
    setFormDataPadrao(prev => {
      const updatedProtections = [...prev.protections];
      updatedProtections[index] = { ...updatedProtections[index], [field]: value };

      const updatedData = {
        ...prev,
        protections: updatedProtections
      };

      if (field === 'stake') {
        updateTotalApostadoPadrao(updatedData);
      }

      return updatedData;
    });
  };

  const addActivationPadrao = () => {
    if (formDataPadrao.activations.length < 2) {
      setFormDataPadrao(prev => ({
        ...prev,
        activations: [...prev.activations, { house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Back' }]
      }));
    }
  };

  const removeActivationPadrao = (index: number) => {
    setFormDataPadrao(prev => {
      const updatedActivations = prev.activations.filter((_, i) => i !== index);
      const updatedData = { ...prev, activations: updatedActivations };
      updateTotalApostadoPadrao(updatedData);
      return updatedData;
    });
  };

  const addProtectionPadrao = () => {
    if (formDataPadrao.protections.length < 3) {
      setFormDataPadrao(prev => ({
        ...prev,
        protections: [...prev.protections, { house_id: '', cpf_id: '', stake: '', odd: '', tipo: 'Lay' }]
      }));
    }
  };

  const removeProtectionPadrao = (index: number) => {
    setFormDataPadrao(prev => {
      const updatedProtections = prev.protections.filter((_, i) => i !== index);
      const updatedData = { ...prev, protections: updatedProtections };
      updateTotalApostadoPadrao(updatedData);
      return updatedData;
    });
  };

  const updateTotalApostadoPadrao = (data: typeof formDataPadrao) => {
    let total = 0;

    data.activations.forEach(activation => {
      total += parseCurrencyValue(activation.stake);
    });

    data.protections.forEach(protection => {
      total += parseCurrencyValue(protection.stake);
    });

    const formattedValue = total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setFormDataPadrao(prev => {
      const updatedData = { ...prev, total_apostado: formattedValue };

      const lucro = parseCurrencyValue(prev.lucro);
      if (!isNaN(lucro)) {
        const resultadoTotal = total + lucro;
        updatedData.resultado_total = resultadoTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        if (total > 0) {
          const roiValue = (lucro / total) * 100;
          updatedData.roi = roiValue.toFixed(2);
        }
      }

      return updatedData;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 relative">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📋 REGISTRAR NOVA OPERAÇÃO</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">{error}</div>
        )}

        <div className="flex items-center p-6 pb-0">
          <span className="text-sm font-medium text-gray-700 mr-4">MODO DE REGISTRO:</span>
          <div className="flex space-x-2">
            <button
              type="button"
              className={`px-3 py-1 text-xs rounded-md flex items-center ${modoRegistro === 'avancado' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setModoRegistro('avancado')}
            >
              <span className={`mr-1 ${modoRegistro === 'avancado' ? 'text-white' : 'text-blue-600'}`}>⭐</span>
              Avançado
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs rounded-md flex items-center ${modoRegistro === 'padrao' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setModoRegistro('padrao')}
            >
              <span className={`mr-1 ${modoRegistro === 'padrao' ? 'text-white' : 'text-gray-500'}`}>✓</span>
              Padrão
            </button>
          </div>
        </div>

        {modoRegistro === 'padrao' ? (
          <form onSubmit={handleSubmitPadrao} className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="date" name="date" value={formDataPadrao.date} onChange={handleChange} 
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="time" name="time" value={formDataPadrao.time} onChange={handleChange}
                      className="pl-10 w-full p-2 border border-gray-300 rounded-md" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jogo/Aposta</label>
                <input type="text" name="game_name" value={formDataPadrao.game_name} onChange={handleChange}
                  placeholder="Ex: Barcelona vs Real Madrid" className="w-full p-2 border border-gray-300 rounded-md" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banca</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="bank_id" 
                    value={formDataPadrao.bank_id} 
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md" 
                    required
                  >
                    <option value="">Selecione uma banca</option>
                    {userBanks.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Ativação</h4>
                
                {formDataPadrao.activations.map((activation, i) => (
                  <div key={`activation-${i}`} className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Ativação {i + 1}</span>
                      {i > 0 && (
                        <button type="button" onClick={() => removeActivationPadrao(i)} className="text-red-500 hover:text-red-700">
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Casa:</label>
                        <select
                          value={activation.house_id || ''}
                          onChange={(e) => handleActivationChangePadrao(i, 'house_id', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          required={i === 0}
                        >
                          <option value="">Selecione</option>
                          {bettingHouses.map(house => (
                            <option key={house.id} value={house.id}>{house.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CPF:</label>
                        <select
                          value={activation.cpf_id || ''}
                          onChange={(e) => handleActivationChangePadrao(i, 'cpf_id', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          required={i === 0}
                        >
                          <option value="">Selecione</option>
                          {accounts.map(account => (
                            <option key={account.id} value={account.id}>{account.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Stake (R$):</label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={activation.stake || ''}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, "");
                              if (!rawValue) {
                                handleActivationChangePadrao(i, 'stake', "");
                                return;
                              }

                              const number = parseFloat(rawValue) / 100;
                              const formattedValue = number.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              });

                              handleActivationChangePadrao(i, 'stake', formattedValue);
                            }}
                            placeholder="R$ 0,00"
                            className="pl-8 w-full p-2 border border-gray-300 rounded-md text-sm"
                            required={i === 0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formDataPadrao.activations.length < 2 && (
                  <button type="button" onClick={addActivationPadrao} 
                    className="flex items-center text-sm text-blue-600 font-medium hover:text-blue-800">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar mais ativação
                  </button>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Proteção</h4>
                
                {formDataPadrao.protections.map((protection, i) => (
                  <div key={`protection-${i}`} className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Proteção {i + 1}</span>
                      <button type="button" onClick={() => removeProtectionPadrao(i)} className="text-red-500 hover:text-red-700">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Casa:</label>
                        <select
                          value={protection.house_id || ''}
                          onChange={(e) => handleProtectionChangePadrao(i, 'house_id', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Selecione</option>
                          {bettingHouses.map(house => (
                            <option key={house.id} value={house.id}>{house.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">CPF:</label>
                        <select
                          value={protection.cpf_id || ''}
                          onChange={(e) => handleProtectionChangePadrao(i, 'cpf_id', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Selecione</option>
                          {accounts.map(account => (
                            <option key={account.id} value={account.id}>{account.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Stake (R$):</label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={protection.stake || ''}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, "");
                              if (!rawValue) {
                                handleProtectionChangePadrao(i, 'stake', "");
                                return;
                              }

                              const number = parseFloat(rawValue) / 100;
                              const formattedValue = number.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              });

                              handleProtectionChangePadrao(i, 'stake', formattedValue);
                            }}
                            placeholder="R$ 0,00"
                            className="pl-8 w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formDataPadrao.protections.length < 3 && (
                  <button type="button" onClick={addProtectionPadrao} 
                    className="flex items-center text-sm text-blue-600 font-medium hover:text-blue-800">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar mais proteção
                  </button>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Financeiro</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lucro</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={formDataPadrao.lucro} 
                        onChange={(e) => handleCurrencyInput(e, 'lucro')}
                        placeholder="R$ 0,00" 
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Apostado</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={formDataPadrao.total_apostado} 
                        readOnly
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resultado Total</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={formDataPadrao.resultado_total} 
                        readOnly
                        className="pl-10 w-full p-2 border border-gray-300 rounded-md bg-gray-50" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-3">Resultado</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Casa Vencedora (opcional)</label>
                    <select 
                      name="casa_vencedora" 
                      value={formDataPadrao.casa_vencedora} 
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Selecione</option>
                      {bettingHouses.map(house => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF Vencedor (opcional)</label>
                    <select 
                      name="cpf_vencedor" 
                      value={formDataPadrao.cpf_vencedor} 
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Selecione</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea 
                  name="observacoes" 
                  value={formDataPadrao.observacoes} 
                  onChange={handleChange}
                  rows={3} 
                  className="w-full p-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar aposta'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <label className="block text-xs text-gray-700">DATA:</label>
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <label className="block text-xs text-gray-700">HORA:</label>
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <label className="block text-xs text-gray-700">STATUS:</label>
                  </div>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                    required
                  >
                    <option value="Em Operação">Em Operação</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">🎮</span>
                    <label className="block text-xs text-gray-700">JOGO/APOSTA:</label>
                  </div>
                  <input
                    type="text"
                    name="game_name"
                    value={formData.game_name}
                    onChange={handleChange}
                    placeholder="Ex: Barcelona vs Real Madrid"
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <label className="block text-xs text-gray-700">PROCEDIMENTO:</label>
                </div>
                <select
                  name="procedimento"
                  value={formData.procedimento}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Aumento 25%">Aumento 25%</option>
                  <option value="Aumento 50%">Aumento 50%</option>
                  <option value="Surebets">Surebets</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* ATIVAÇÃO 01 */}
              <div>
                <h4 className="text-sm font-medium text-blue-600 mb-2">📌 ATIVAÇÃO 01</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Casa:</label>
                    <select
                      value={formData.activations[0]?.house_id || ''}
                      onChange={(e) => handleActivationChange(0, 'house_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      required
                    >
                      <option value="">Selecione</option>
                      {bettingHouses.map(house => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CPF:</label>
                    <select
                      value={formData.activations[0]?.cpf_id || ''}
                      onChange={(e) => handleActivationChange(0, 'cpf_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      required
                    >
                      <option value="">Selecione</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stake (R$):</label>
                    <input
                      type="text"
                      value={formData.activations[0]?.stake || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        if (!rawValue) {
                          handleActivationChange(0, 'stake', "");
                          return;
                        }

                        const number = parseFloat(rawValue) / 100;
                        const formattedValue = number.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        });

                        handleActivationChange(0, 'stake', formattedValue);
                      }}
                      placeholder="R$ 0,00"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Odd:</label>
                    <input
                      type="text"
                      value={formData.activations[0]?.odd || ''}
                      onChange={(e) => handleActivationChange(0, 'odd', e.target.value)}
                      placeholder="Ex: 3.80"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tipo:</label>
                    <select
                      value={formData.activations[0]?.tipo || 'Back'}
                      onChange={(e) => handleActivationChange(0, 'tipo', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="Back">Back</option>
                      <option value="Lay">Lay</option>
                      <option value="Freebet">Freebet</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ATIVAÇÃO 02 */}
              {formData.activations.length > 1 && (
                <div>
                  <h4 className="text-sm font-medium text-blue-600 mb-2">📌 ATIVAÇÃO 02</h4>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Casa:</label>
                      <select
                        value={formData.activations[1]?.house_id || ''}
                        onChange={(e) => handleActivationChange(1, 'house_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Selecione</option>
                        {bettingHouses.map(house => (
                          <option key={house.id} value={house.id}>{house.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CPF:</label>
                      <select
                        value={formData.activations[1]?.cpf_id || ''}
                        onChange={(e) => handleActivationChange(1, 'cpf_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        required
                      >
                        <option value="">Selecione</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Stake (R$):</label>
                      <input
                        type="text"
                        value={formData.activations[1]?.stake || ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          if (!rawValue) {
                            handleActivationChange(1, 'stake', "");
                            return;
                          }

                          const number = parseFloat(rawValue) / 100;
                          const formattedValue = number.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          });

                          handleActivationChange(1, 'stake', formattedValue);
                        }}
                        placeholder="R$ 0,00"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Odd:</label>
                      <input
                        type="text"
                        value={formData.activations[1]?.odd || ''}
                        onChange={(e) => handleActivationChange(1, 'odd', e.target.value)}
                        placeholder="Ex: 4.10"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tipo:</label>
                      <select
                        value={formData.activations[1]?.tipo || 'Freebet'}
                        onChange={(e) => handleActivationChange(1, 'tipo', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        required
                      >
                        <option value="Back">Back</option>
                        <option value="Lay">Lay</option>
                        <option value="Freebet">Freebet</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {/* CONTROLE DE ATIVAÇÕES */}
              <div className="flex space-x-2 mt-2">
                {formData.activations.length < 2 && (
                  <button
                    type="button"
                    onClick={addActivation}
                    className="flex items-center text-xs bg-blue-600 text-white px-3 py-1 rounded-md"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Ativação
                  </button>
                )}
                {formData.activations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivation(1)}
                    className="flex items-center text-xs bg-gray-600 text-white px-3 py-1 rounded-md"
                  >
                    <X className="w-3 h-3 mr-1" /> Remover Ativação
                  </button>
                )}
              </div>

              {/* PROTEÇÃO 01 */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">🛡️ PROTEÇÃO 01</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Casa:</label>
                    <select
                      value={formData.protections[0]?.house_id || ''}
                      onChange={(e) => handleProtectionChange(0, 'house_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Selecione</option>
                      {bettingHouses.map(house => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CPF:</label>
                    <select
                      value={formData.protections[0]?.cpf_id || ''}
                      onChange={(e) => handleProtectionChange(0, 'cpf_id', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Selecione</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stake (R$):</label>
                    <input
                      type="text"
                      value={formData.protections[0]?.stake || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        if (!rawValue) {
                          handleProtectionChange(0, 'stake', "");
                          return;
                        }

                        const number = parseFloat(rawValue) / 100;
                        const formattedValue = number.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        });

                        handleProtectionChange(0, 'stake', formattedValue);
                      }}
                      placeholder="R$ 0,00"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Odd:</label>
                    <input
                      type="text"
                      value={formData.protections[0]?.odd || ''}
                      onChange={(e) => handleProtectionChange(0, 'odd', e.target.value)}
                      placeholder="Ex: 4.60"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tipo:</label>
                    <select
                      value={formData.protections[0]?.tipo || 'Lay'}
                      onChange={(e) => handleProtectionChange(0, 'tipo', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Back">Back</option>
                      <option value="Lay">Lay</option>
                      <option value="Freebet">Freebet</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PROTEÇÃO 02 */}
              {formData.protections.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🛡️ PROTEÇÃO 02</h4>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Casa:</label>
                      <select
                        value={formData.protections[1]?.house_id || ''}
                        onChange={(e) => handleProtectionChange(1, 'house_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Selecione</option>
                        {bettingHouses.map(house => (
                          <option key={house.id} value={house.id}>{house.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CPF:</label>
                      <select
                        value={formData.protections[1]?.cpf_id || ''}
                        onChange={(e) => handleProtectionChange(1, 'cpf_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Selecione</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Stake (R$):</label>
                      <input
                        type="text"
                        value={formData.protections[1]?.stake || ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          if (!rawValue) {
                            handleProtectionChange(1, 'stake', "");
                            return;
                          }

                          const number = parseFloat(rawValue) / 100;
                          const formattedValue = number.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          });

                          handleProtectionChange(1, 'stake', formattedValue);
                        }}
                        placeholder="R$ 0,00"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Odd:</label>
                      <input
                        type="text"
                        value={formData.protections[1]?.odd || ''}
                        onChange={(e) => handleProtectionChange(1, 'odd', e.target.value)}
                        placeholder="Ex: 3.90"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tipo:</label>
                      <select
                        value={formData.protections[1]?.tipo || 'Lay'}
                        onChange={(e) => handleProtectionChange(1, 'tipo', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="Back">Back</option>
                        <option value="Lay">Lay</option>
                        <option value="Freebet">Freebet</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PROTEÇÃO 03 */}
              {formData.protections.length > 2 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🛡️ PROTEÇÃO 03</h4>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Casa:</label>
                      <select
                        value={formData.protections[2]?.house_id || ''}
                        onChange={(e) => handleProtectionChange(2, 'house_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Selecione</option>
                        {bettingHouses.map(house => (
                          <option key={house.id} value={house.id}>{house.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CPF:</label>
                      <select
                        value={formData.protections[2]?.cpf_id || ''}
                        onChange={(e) => handleProtectionChange(2, 'cpf_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Selecione</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>{account.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Stake (R$):</label>
                      <input
                        type="text"
                        value={formData.protections[2]?.stake || ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          if (!rawValue) {
                            handleProtectionChange(2, 'stake', "");
                            return;
                          }

                          const number = parseFloat(rawValue) / 100;
                          const formattedValue = number.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          });

                          handleProtectionChange(2, 'stake', formattedValue);
                        }}
                        placeholder="R$ 0,00"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Odd:</label>
                      <input
                        type="text"
                        value={formData.protections[2]?.odd || ''}
                        onChange={(e) => handleProtectionChange(2, 'odd', e.target.value)}
                        placeholder="Ex: 3.20"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tipo:</label>
                      <select
                        value={formData.protections[2]?.tipo || 'Lay'}
                        onChange={(e) => handleProtectionChange(2, 'tipo', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="Back">Back</option>
                        <option value="Lay">Lay</option>
                        <option value="Freebet">Freebet</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROLE DE PROTEÇÕES */}
              <div className="flex space-x-2 mt-2">
                {formData.protections.length < 3 && (
                  <button
                    type="button"
                    onClick={addProtection}
                    className="flex items-center text-xs bg-blue-600 text-white px-3 py-1 rounded-md"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Proteção
                  </button>
                )}
                {formData.protections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProtection(formData.protections.length - 1)}
                    className="flex items-center text-xs bg-gray-600 text-white px-3 py-1 rounded-md"
                  >
                    <X className="w-3 h-3 mr-1" /> Remover Proteção
                  </button>
                )}
              </div>

              {/* INFORMAÇÕES FINANCEIRAS */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-green-600 mb-2">
                  <span className="mr-2">💰</span>
                  FINANCEIRO
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Total Apostado (R$):</label>
                    <input
                      type="text"
                      value={formData.total_apostado || ''}
                      onChange={(e) => handleCurrencyInput(e, 'total_apostado')}
                      placeholder="R$ 0,00"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Resultado Total (R$):</label>
                    <input
                      type="text"
                      value={formData.resultado_total || ''}
                      onChange={(e) => handleCurrencyInput(e, 'resultado_total')}
                      placeholder="R$ 0,00"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Lucro (R$):</label>
                    <input
                      type="text"
                      value={formData.lucro || ''}
                      onChange={(e) => handleCurrencyInput(e, 'lucro')}
                      placeholder="R$ 0,00"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">ROI (%):</label>
                    <input
                      type="text"
                      value={formData.roi || ''}
                      onChange={(e) => handleChange(e)}
                      name="roi"
                      placeholder="0.00"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* RESULTADO FINAL */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">🏁</span>
                  RESULTADO FINAL
                </h4>

                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Quem Ganhou?</label>
                  <select
                    name="quem_ganhou"
                    value={formData.quem_ganhou}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Ativação #01">Ativação #01</option>
                    {formData.activations.length > 1 && <option value="Ativação #02">Ativação #02</option>}
                    <option value="Proteção #01">Proteção #01</option>
                    {formData.protections.length > 1 && <option value="Proteção #02">Proteção #02</option>}
                    {formData.protections.length > 2 && <option value="Proteção #03">Proteção #03</option>}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Casa Vencedora:</label>
                    <select
                      name="casa_vencedora"
                      value={formData.casa_vencedora || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Selecione</option>
                      {bettingHouses.map(house => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">CPF Vencedor:</label>
                    <select
                      name="cpf_vencedor"
                      value={formData.cpf_vencedor || ''}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Selecione</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="aplicar_todas_linhas"
                    name="aplicar_todas_linhas"
                    checked={formData.aplicar_todas_linhas}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="aplicar_todas_linhas" className="text-xs text-gray-700">
                    Aplicar esse resultado para todas as linhas duplicadas dessa operação
                  </label>
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">📝</span>
                  OBSERVAÇÕES
                </h4>

                <textarea
                  name="observacoes"
                  value={formData.observacoes || ''}
                  onChange={handleChange}
                  placeholder="Adicione observações sobre esta operação..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm min-h-[80px]"
                />
              </div>

              {/* BANCA */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500 inline mr-2" />
                  BANCA
                </h4>

                <select
                  name="bank_id"
                  value={formData.bank_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  required
                >
                  <option value="">Selecione uma banca</option>
                  {userBanks.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.name}</option>
                  ))}
                </select>
              </div>

              {/* PROMOÇÃO */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">🎁</span>
                  PROMOÇÃO
                </h4>

                <select
                  name="promotion_id"
                  value={formData.promotion_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Nenhuma</option>
                  {promotions.map(promotion => (
                    <option key={promotion.id} value={promotion.id}>{promotion.name}</option>
                  ))}
                </select>
              </div>

              {/* AÇÕES */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  <span className="mr-2">🔧</span>
                  AÇÕES DISPONÍVEIS
                </h4>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};