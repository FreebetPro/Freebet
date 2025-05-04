import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Search, Plus, Copy, QrCode, X, Info, User, Bell, Settings, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/currency';
import Swal from 'sweetalert2';

interface BettingHouse {
  id: string;
  name: string;
  accounts: AccountBettingHouse[];
}

interface AccountBettingHouse {
  id: string;
  account_id: string;
  betting_house_id: string;
  status: string;
  verification: string;
  saldo: string;
  deposito: string;
  sacado: string;
  creditos: string;
  obs: string;
  account: {
    cpf: string;
    name: string;
    email1: string;
    password: string;
  };
}

const BettingHousesPage = () => {
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [bettingHouses, setBettingHouses] = useState<BettingHouse[]>([]);
  const [accounts, setAccounts] = useState<AccountBettingHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [generatedQRCodes, setGeneratedQRCodes] = useState<Record<string, string>>({});
  const [depositValues, setDepositValues] = useState<Record<string, string>>({});
  const [showAutoDepositModal, setShowAutoDepositModal] = useState(false);
  const [autoDepositStep, setAutoDepositStep] = useState(1);
  const [showMassQRModal, setShowMassQRModal] = useState(false);
  const [massDepositValue, setMassDepositValue] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [newAccount, setNewAccount] = useState({
    cpf: '',
    name: '',
    email1: '',
    password: '',
  });

  const [availableAccounts, setAvailableAccounts] = useState<{
    id: string;
    cpf: string;
    name: string;
  }[]>([]);

  useEffect(() => {
    fetchBettingHouses();
  }, []);

  useEffect(() => {
    if (selectedHouse) {
      fetchAccounts(selectedHouse);
    }
  }, [selectedHouse]);

  const fetchAvailableAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, cpf, name')
        .order('name');

      if (error) throw error;
      setAvailableAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => { fetchAvailableAccounts(); }, []);

  const fetchBettingHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('betting_houses')
        .select('*')
        .order('name');

      if (error) throw error;
      setBettingHouses(data || []);
    } catch (error) {
      console.error('Error fetching betting houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async (houseId: string) => {
    try {
      const { data, error } = await supabase
        .from('account_betting_houses')
        .select(`
          *,
          account:accounts(cpf, name, email1)
        `)
        .eq('betting_house_id', houseId);

      if (error) throw error;
      setAccounts(data || []);
      
      // Calculate total balance
      const total = data?.reduce((sum, acc) => sum + parseFloat(acc.saldo || '0'), 0) || 0;
      setTotalBalance(total);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSelectAccount = (id: string) => {
    setSelectedAccounts(prev => {
      const isSelected = prev.includes(id);
      const newSelection = isSelected ? prev.filter(x => x !== id) : [...prev, id];
      // Update selectAll state based on whether all filtered accounts are selected
      setSelectAll(newSelection.length === filteredAccounts.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // Select all filtered accounts
      setSelectedAccounts(filteredAccounts.map(account => account.id));
    } else {
      // Deselect all
      setSelectedAccounts([]);
    }
  };

  const handleRefreshBalance = async (accountId: string) => {
    try {
      await Swal.fire({
        title: 'Atualizando Saldo',
        html: 'O robô está entrando nas contas para captura do saldo. Por favor, aguarde alguns momentos...',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Aguardar',
        cancelButtonText: 'Fechar',
        allowOutsideClick: true,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Only continue if user didn't cancel
      if (!Swal.isVisible()) {
        return;
      }
      
      await fetchAccounts(selectedHouse);
      
      await Swal.fire({
        title: 'Concluído!',
        text: 'Saldo atualizado com sucesso',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error refreshing balance:', error);
      await Swal.fire({
        title: 'Erro',
        text: 'Não foi possível atualizar o saldo. Tente novamente.',
        icon: 'error'
      });
    }
  };

  const handleDepositValueChange = (accountId: string, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formatted = numericValue ? formatCurrency(parseInt(numericValue) / 100) : '';
    setDepositValues(prev => ({
      ...prev,
      [accountId]: formatted
    }));
  };

  const handleGenerateQRCode = async (accountId: string) => {
    const depositValue = depositValues[accountId];
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!depositValue) {
      await Swal.fire({
        title: 'Erro',
        text: 'Por favor, informe um valor para o depósito',
        icon: 'error'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Gerar QR Code',
      html: `
        <div class="text-left">
          <p><strong>Nome:</strong> ${account?.account?.name}</p>
          <p><strong>CPF:</strong> ${account?.account?.cpf}</p>
          <p><strong>Valor:</strong> ${depositValue}</p>
        </div>
        <p class="mt-4">Deseja gerar o QR Code para esta conta?</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, gerar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      // Simulate QR code generation - replace with actual API call
      const qrCode = `QR-${accountId}-${Date.now()}`;
      setGeneratedQRCodes(prev => ({
        ...prev,
        [accountId]: qrCode
      }));

      await Swal.fire(
        'Gerado!',
        'O QR Code foi gerado com sucesso.',
        'success'
      );
    }
  };

  const handleCopyQRCode = (qrCode: string) => {
    navigator.clipboard.writeText(qrCode);
    Swal.fire({
      title: 'Copiado!',
      text: 'QR Code copiado para a área de transferência',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleAddAccount = async () => {
    try {
      // Implement account creation logic here
      setShowAddModal(false);
      await fetchAccounts(selectedHouse);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleAutoDepositClick = () => {
    setAutoDepositStep(1);
    setShowAutoDepositModal(true);
  };

  const handleAutoDepositResponse = (response: boolean) => {
    if (response) {
      setAutoDepositStep(2);
    } else {
      setShowAutoDepositModal(false);
    }
  };

  const filteredAccounts = accounts.filter(account => 
    (
      account.account?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account?.cpf.includes(searchTerm)
    ) && (
      selectedStatus === '' || account.status === selectedStatus
    )
  );

  return (
    <div className="p-6 pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">QR Code Automático e Consulta de Saldos</div>
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

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">Gerencie suas contas em diferentes casas de apostas</p>
        </div>
        <button
          onClick={() => {/* Implement export */}}
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Lista
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Casa de Aposta
          </label>
          <select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma casa</option>
            {bettingHouses.map(house => (
              <option key={house.id} value={house.id}>{house.name}</option>
            ))}
          </select>
        </div>

        {selectedHouse && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-48 p-2 border rounded-lg bg-white"
                >
                  <option value="">Todos os Status</option>
                  <option value="Disponivel">Disponível</option>
                  <option value="Em Operação">Em Operação</option>
                  <option value="Limitado">Limitado</option>
                  <option value="Sem Acesso">Sem Acesso</option>
                  <option value="Abrir Casa">Abrir Casa</option>
                  <option value="Verificado">Verificado</option>
                  <option value="Verificar">Verificar</option>
                  <option value="Conta Aberta">Conta Aberta</option>
                  <option value="ABRIR">ABRIR</option>
                  <option value="Selfie">Selfie</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-blue-600">Total de Contas</p>
                  <p className="text-2xl font-bold text-blue-800">{accounts.length}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-600">Saldo Total</p>
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalBalance)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoDepositClick}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Depósito QR Automático
                  </button>
                  <button
                    onClick={() => {
                      if (selectedAccounts.length === 0) {
                        Swal.fire({
                          title: 'Atenção',
                          text: 'Selecione pelo menos uma conta para gerar QR Code em massa',
                          icon: 'warning'
                        });
                        return;
                      }
                      setShowMassQRModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Gerar QR em Massa
                  </button>
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Consultando Saldos',
                        html: 'O robô está entrando nas contas para captura do saldo geral. Por favor, aguarde alguns momentos...',
                        showCancelButton: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Aguardar',
                        cancelButtonText: 'Fechar',
                        allowOutsideClick: true,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Consultar Saldo Geral
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">Selecionar</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAccounts.map((account, index) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes(account.id)}
                          onChange={() => handleSelectAccount(account.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{account.account?.cpf}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{account.account?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={depositValues[account.id] || ''}
                          className="w-24 px-2 py-1 border rounded"
                          placeholder="R$ 0,00"
                          onChange={(e) => handleDepositValueChange(account.id, e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="flex items-center gap-1">
                          <span>{formatCurrency(parseFloat(account.saldo || '0'))}</span>
                          <button
                            onClick={() => handleRefreshBalance(account.id)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {generatedQRCodes[account.id] ? (
                          <div className="flex flex-col gap-2">
                            <span className="text-green-600 font-medium truncate max-w-[200px]" title={generatedQRCodes[account.id]}>
                              {generatedQRCodes[account.id].slice(0, 20)}...
                            </span>
                            <button
                              onClick={() => handleCopyQRCode(generatedQRCodes[account.id])}
                              className="p-1 text-gray-600 hover:text-gray-800 self-start flex items-center gap-1"
                            >
                              <Copy className="w-4 h-4" />
                              <span className="text-sm">Copiar código</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateQRCode(account.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                          >
                            <QrCode className="w-4 h-4" />
                            Gerar QR Code
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Mass QR Generation Modal */}
      {showMassQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Gerar QR Code em Massa</h3>
              <button
                onClick={() => setShowMassQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="w-5 h-5" />
                <p className="text-sm">
                  {selectedAccounts.length} {selectedAccounts.length === 1 ? 'conta selecionada' : 'contas selecionadas'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Depósito
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={massDepositValue}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    const formatted = numericValue ? formatCurrency(parseInt(numericValue) / 100) : '';
                    setMassDepositValue(formatted);
                  }}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMassQRModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!massDepositValue) {
                    Swal.fire({
                      title: 'Erro',
                      text: 'Por favor, informe um valor para o depósito',
                      icon: 'error'
                    });
                    return;
                  }

                  // Update deposit values for all selected accounts
                  const newDepositValues = { ...depositValues };
                  selectedAccounts.forEach(accountId => {
                    newDepositValues[accountId] = massDepositValue;
                  });
                  setDepositValues(newDepositValues);

                  // Generate QR codes for all selected accounts
                  selectedAccounts.forEach(accountId => {
                    const qrCode = `QR-${accountId}-${Date.now()}`;
                    setGeneratedQRCodes(prev => ({
                      ...prev,
                      [accountId]: qrCode
                    }));
                  });

                  setShowMassQRModal(false);
                  Swal.fire(
                    'Gerado!',
                    `QR Codes gerados com sucesso para ${selectedAccounts.length} contas com valor de ${massDepositValue}`,
                    'success'
                  );
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Gerar QR Codes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Auto Deposit Modal */}
      {showAutoDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {autoDepositStep === 1 ? 'Depósito QR Automático' : 'Acesso à Fintech'}
              </h3>
              <button
                onClick={() => setShowAutoDepositModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {autoDepositStep === 1 ? (
              <div className="space-y-6">
                <p className="text-gray-700">
                  Deseja ganhar ainda mais tempo disponível e deixar seus depósitos automáticos aqui da plataforma direto a casa de apostas?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleAutoDepositResponse(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Não
                  </button>
                  <button
                    onClick={() => handleAutoDepositResponse(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Sim
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-700">
                  Ótima escolha, porém esta função apenas é disponível para usuários com a função fintech disponível na plataforma.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowAutoDepositModal(false);
                      window.location.href = '/fintech';
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Acessar Menu Fintech
                  </button>
                  <button
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    QUERO SABER COMO FUNCIONA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingHousesPage;