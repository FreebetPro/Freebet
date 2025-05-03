import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { KeyRound, Copy, Search, ChevronLeft, ChevronRight, RefreshCw, Send, FileText, ChevronDown, Plus, Upload, X, QrCode, BanknoteIcon, Info, AlertTriangle, Building, CheckCircle, User, Bell, Settings, HelpCircle } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { formatCurrency, parseCurrency } from '../utils/currency';

const MySwal = withReactContent(Swal);

interface ChildAccount {
  id: string;
  status: 'Aprovado' | 'Pendente' | 'Reprovado';
  cpf: string;
  name: string;
  accountNumber: string;
  balance: number;
  pixKeys: {
    cpf: boolean;
    random: boolean;
    email: boolean;
  };
}

interface FormData {
  cpf: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  motherName: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  rg: string;
  rgDate: string;
  rgOrgan: string;
  rgState: string;
  frontDoc: File | null;
  backDoc: File | null;
  selfieDoc: File | null;
}

const Fintech: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, addAccount } = useAccounts();
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [balance, setBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChildAccount | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAccountForDeposit, setSelectedAccountForDeposit] = useState<ChildAccount | null>(null);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [showAutoDepositModal, setShowAutoDepositModal] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedBettingHouse, setSelectedBettingHouse] = useState('');
  const [depositStatuses, setDepositStatuses] = useState<{
    id: string;
    accountName: string;
    cpf: string;
    amount: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message: string;
    timestamp: string;
  }[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [massDepositValue, setMassDepositValue] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [motherAccountBalance, setMotherAccountBalance] = useState(5000.00);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [selectedAccountForStatement, setSelectedAccountForStatement] = useState<ChildAccount | null>(null);
  const [showMotherAccountWithdrawalModal, setShowMotherAccountWithdrawalModal] = useState(false);
  const [withdrawalCPF, setWithdrawalCPF] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  
  const banks = [
    "Banco do Brasil",
    "Caixa Econômica Federal",
    "Bradesco",
    "Itaú",
    "Santander",
    "Nubank",
    "Inter",
    "C6 Bank",
    "BTG Pactual",
    "Sicoob"
  ];
  
  const [transactions] = useState([
    { 
      id: 1,
      type: 'Pagamento QR Code',
      amount: 150.00,
      date: '2025-03-25 14:30',
      status: 'Concluído'
    },
    {
      id: 2,
      type: 'Saque Recebido',
      amount: 500.00,
      date: '2025-03-24 16:45',
      status: 'Concluído'
    },
    {
      id: 3,
      type: 'Saldo Enviado (Conta Mãe)',
      amount: -1000.00,
      date: '2025-03-23 09:15',
      status: 'Concluído'
    },
    {
      id: 4,
      type: 'Taxa P2P',
      amount: -2.50,
      date: '2025-03-23 09:15',
      status: 'Concluído'
    }
  ]);

  // Filter accounts based on search term
  const filteredAccounts = childAccounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.cpf.includes(searchTerm) ||
    account.accountNumber.includes(searchTerm)
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // Calculate paginated accounts
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    // Reset to first page when search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    // Mock data for demonstration
    const mockAccounts: ChildAccount[] = [
      {
        id: '1',
        status: 'Aprovado',
        cpf: '123.456.789-00',
        name: 'João Silva',
        accountNumber: '1234-5',
        balance: 1000.00,
        pixKeys: { cpf: true, random: false, email: true }
      },
      {
        id: '2',
        status: 'Pendente',
        cpf: '987.654.321-00',
        name: 'Maria Santos',
        accountNumber: '5432-1',
        balance: 2500.50,
        pixKeys: { cpf: false, random: true, email: false }
      }
    ];
    setChildAccounts(mockAccounts);
  }, []);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText('216aa381-db33-492f-9bcd-8f0eb3908629');
      await MySwal.fire({
        icon: 'success',
        title: 'Copiado!',
        text: 'Chave PIX copiada para a área de transferência',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível copiar a chave PIX',
        showConfirmButton: true
      });
    }
  };

  const handleMotherAccountWithdrawal = async () => {
    // Validar CPF
    if (!withdrawalCPF.trim()) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, informe o CPF do titular da conta'
      });
      return;
    }
    
    // Validar banco
    if (!selectedBank) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, selecione um banco'
      });
      return;
    }
    
    // Validar valor
    const amount = parseCurrency(withdrawalAmount);
    if (amount <= 0) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, informe um valor válido para o saque'
      });
      return;
    }
    
    // Validar saldo
    if (amount > motherAccountBalance) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Saldo insuficiente para realizar o saque'
      });
      return;
    }
    
    try {
      // Simular processamento
      await MySwal.fire({
        title: 'Processando saque...',
        text: 'Aguarde enquanto processamos sua solicitação',
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        }
      });
      
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar saldo
      setMotherAccountBalance(prev => prev - amount - 2); // Subtrair valor + taxa
      
      // Limpar campos
      setWithdrawalCPF('');
      setSelectedBank('');
      setWithdrawalAmount('');
      
      // Fechar modal
      setShowMotherAccountWithdrawalModal(false);
      
      // Mostrar sucesso
      await MySwal.fire({
        icon: 'success',
        title: 'Saque solicitado com sucesso',
        text: `O valor de ${formatCurrency(amount)} será transferido para sua conta em até 24 horas úteis.`
      });
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao processar o saque. Tente novamente.'
      });
    }
  };

  const handleRefreshMotherBalance = async () => {
    setIsRefreshingBalance(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update with new balance (this would be from API in production)
      setMotherAccountBalance(prev => prev + 100); // Example update
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      await MySwal.fire({
        icon: 'success',
        title: 'Saldo Atualizado',
        text: 'O saldo foi atualizado com sucesso!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error refreshing balance:', error);
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível atualizar o saldo. Tente novamente.',
        showConfirmButton: true
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendToMother = async () => {
    try {
      await MySwal.fire({
        title: 'Enviando saldo...',
        text: 'O saldo está sendo enviado para a conta mãe',
        icon: 'info',
        showConfirmButton: false,
        timer: 2000
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await MySwal.fire({
        icon: 'success',
        title: 'Saldo Enviado',
        text: 'O saldo foi enviado com sucesso para a conta mãe!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error sending balance:', error);
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível enviar o saldo. Tente novamente.',
        showConfirmButton: true
      });
    }
  };

  const handleAutoDepositClick = () => {
    setShowAutoDepositModal(true);
    setSelectedAccounts([]);
    setSelectedBettingHouse('');
    setMassDepositValue('');
  };

  const handleStartDeposit = async () => {
    if (!selectedBettingHouse) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, selecione uma casa de apostas'
      });
      return;
    }

    if (selectedAccounts.length === 0) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, selecione pelo menos uma conta'
      });
      return;
    }

    if (!massDepositValue) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, informe um valor para o depósito'
      });
      return;
    }

    try {
      // Create status entries for each selected account
      const newStatuses = selectedAccounts.map(accountId => {
        const account = childAccounts.find(acc => acc.id === accountId);
        return {
          id: `${Date.now()}-${accountId}`,
          accountName: account?.name || '',
          cpf: account?.cpf || '',
          amount: massDepositValue,
          status: 'pending' as const,
          message: 'Aguardando início do depósito',
          timestamp: new Date().toISOString()
        };
      });
      
      setDepositStatuses(prev => [...prev, ...newStatuses]);
      setShowStatusModal(true);
      setShowAutoDepositModal(false);

      // Simulate API call
      for (const status of newStatuses) {
        // Update status to processing
        setDepositStatuses(prev => prev.map(s => 
          s.id === status.id 
            ? { ...s, status: 'processing', message: 'Processando depósito...' }
            : s
        ));
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update to completed or failed randomly for demo
        const success = Math.random() > 0.3;
        setDepositStatuses(prev => prev.map(s => 
          s.id === status.id 
            ? { 
                ...s, 
                status: success ? 'completed' : 'failed',
                message: success ? 'Depósito realizado com sucesso' : 'Falha ao processar depósito'
              }
            : s
        ));
      }

    } catch (error) {
      console.error('Error starting deposits:', error);
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao iniciar os depósitos. Tente novamente.'
      });
    }
  };

  const handleDeposit = (account: ChildAccount) => {
    setSelectedAccountForDeposit(account);
    setShowDepositModal(true);
    setQrCodeValue('');
    setDepositAmount('');
  };

  const handleQrCodeSubmit = async () => {
    if (!qrCodeValue.trim()) {
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, insira o código QR do depósito'
      });
      return;
    }

    try {
      // Here you would make an API call to process the deposit
      await MySwal.fire({
        icon: 'success',
        title: 'Depósito Registrado',
        text: 'O depósito foi registrado com sucesso!'
      });
      setShowDepositModal(false);
      setQrCodeValue('');
      setSelectedAccountForDeposit(null);
    } catch (error) {
      console.error('Error processing deposit:', error);
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível processar o depósito. Tente novamente.'
      });
    }
  };

  const handlePixKeyAction = async (accountId: string, keyType: 'cpf' | 'random' | 'email', currentStatus: boolean) => {
    try {
      // This would be an API call in production
      setChildAccounts(accounts => 
        accounts.map(account => 
          account.id === accountId 
            ? {
                ...account,
                pixKeys: {
                  ...account.pixKeys,
                  [keyType]: !currentStatus
                }
              }
            : account
        )
      );
      
      await MySwal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: `Chave PIX ${currentStatus ? 'desativada' : 'ativada'} com sucesso`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error toggling PIX key:', error);
      await MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível alterar a chave PIX',
        showConfirmButton: true
      });
    }
  };

  const handleShowCasasLiberadas = () => {
    MySwal.fire({
      title: 'Casas Liberadas',
      html: `
        <div class="text-left">
          <p class="mb-4">Somente será permitido quaisquer tipos de transações PIX In e Out provenientes de casas de apostas, qualquer outra transação será cancelada e reembolsada a origem, caso possua origem duvidosa e ilícita, este usuário terá seu acesso banido conforme termos e condições aceitos na criação da conta.</p>
          
          <div class="flex items-center gap-2 text-green-600 font-bold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            TODAS CASAS DE APOSTAS REGULADAS ESTÃO LIBERADAS!
          </div>
          
          <p class="text-red-600">Sistema bloqueado para: China, Golpes, Empréstimos de qualquer natureza, Silver Bullet e outros.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendi',
      confirmButtonColor: '#10B981'
    });
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Fintech</div>
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
            <Link to="/perfil" className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors" onClick={(e) => navigate('/perfil')}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Meu Perfil</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content with padding to account for header */}
      <div className="pt-16">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Gerencie suas contas e transações financeiras</p>
            <button
              onClick={handleShowCasasLiberadas}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Casas Liberadas
            </button>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <div>
              <span className="text-sm text-blue-600 font-medium">Saldo Conta Mãe:</span>
              <span className="ml-2 text-lg font-bold text-blue-700">{formatCurrency(motherAccountBalance)}</span>              
            </div>
            <button
              onClick={handleRefreshMotherBalance}
              disabled={isRefreshingBalance}
              className="p-2 hover:bg-blue-100 rounded-full transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-blue-600 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowMotherAccountWithdrawalModal(true)}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <BanknoteIcon className="w-4 h-4" />
              Saque Conta Mãe
            </button>
            <button
              onClick={handleAutoDepositClick}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Depósito QR Automático
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 mb-6">
        <div>
          <p className="text-sm text-gray-600"><strong>Depósito Conta Mãe:</strong></p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-gray-800">216aa381-db33-492f-9bcd-8f0eb3908629</p>
            <button
              onClick={handleCopyKey}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div>
            <p className="text-sm text-gray-600">Banco</p>
            <p className="font-medium text-gray-800">324</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Agência</p>
            <p className="font-medium text-gray-800">0001</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Conta</p>
            <p className="font-medium text-gray-800">06600000015-3</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Contas Filhas</h2>
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
              <option value={7}>7 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº Conta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depósito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ativar Pix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extrato</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      account.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                      account.status === 'Reprovado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{account.cpf}</td>
                  <td className="px-6 py-4">{account.name}</td>
                  <td className="px-6 py-4">{account.accountNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(account.balance)}</span>
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => handleRefreshBalance()}
                        title="Atualizar saldo"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={handleSendToMother}
                        title="Enviar saldo para conta mãe"
                      >
                        <Send className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeposit(account)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Fazer Depósito
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        className="px-3 py-1 border rounded flex items-center gap-2"
                        onClick={() => setOpenDropdownId(openDropdownId === account.id ? null : account.id)}
                      >
                        Chave PIX
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      
                      {openDropdownId === account.id && (
                        <div className="absolute z-10 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
                          <div className="py-1">
                            <div className="px-4 py-2 flex justify-between items-center hover:bg-gray-50">
                              <span>CHAVE CPF</span>
                              <button
                                onClick={() => handlePixKeyAction(account.id, 'cpf', account.pixKeys.cpf)}
                                className={`px-3 py-1 rounded text-sm ${
                                  account.pixKeys.cpf
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {account.pixKeys.cpf ? 'Desativar chave' : 'Ativar'}
                              </button>
                            </div>
                            
                            <div className="px-4 py-2 flex justify-between items-center hover:bg-gray-50">
                              <span>CHAVE ALEATÓRIA</span>
                              <button
                                onClick={() => handlePixKeyAction(account.id, 'random', account.pixKeys.random)}
                                className={`px-3 py-1 rounded text-sm ${
                                  account.pixKeys.random
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {account.pixKeys.random ? 'Desativar chave' : 'Ativar'}
                              </button>
                            </div>
                            
                            <div className="px-4 py-2 flex justify-between items-center hover:bg-gray-50">
                              <span>CHAVE Email</span>
                              <button
                                onClick={() => handlePixKeyAction(account.id, 'email', account.pixKeys.email)}
                                className={`px-3 py-1 rounded text-sm ${
                                  account.pixKeys.email
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {account.pixKeys.email ? 'Desativar chave' : 'Ativar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedAccountForStatement(account);
                        setShowStatement(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      <FileText className="w-4 h-4" />
                      Extrato
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} de {filteredAccounts.length} registros
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

      {/* Statement Modal */}
      {showStatement && selectedAccountForStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Extrato da Conta</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAccountForStatement.name} - CPF: {selectedAccountForStatement.cpf}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStatement(false);
                  setSelectedAccountForStatement(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowStatement(false);
                  setSelectedAccountForStatement(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedAccountForDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Fazer Depósito</h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium text-gray-900">{selectedAccountForDeposit.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPF</p>
                    <p className="font-medium text-gray-900">{selectedAccountForDeposit.cpf}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código QR do Depósito
                </label>
                <div className="mt-1">
                  <textarea
                    value={qrCodeValue}
                    onChange={(e) => setQrCodeValue(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cole aqui o código QR do depósito..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleQrCodeSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Confirmar Depósito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Tracking Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Status dos Depósitos</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {depositStatuses.map((status) => (
                <div 
                  key={status.id} 
                  className={`p-4 rounded-lg border ${
                    status.status === 'completed' ? 'bg-green-50 border-green-200' :
                    status.status === 'failed' ? 'bg-red-50 border-red-200' :
                    status.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{status.accountName}</h4>
                      <p className="text-sm text-gray-600">CPF: {status.cpf}</p>
                      <p className="text-sm text-gray-600">Valor: {status.amount}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status.status === 'completed' ? 'bg-green-100 text-green-800' :
                        status.status === 'failed' ? 'bg-red-100 text-red-800' :
                        status.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status.status === 'completed' ? 'Concluído' :
                         status.status === 'failed' ? 'Falhou' :
                         status.status === 'processing' ? 'Processando' :
                         'Pendente'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(status.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{status.message}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fechar
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
              <h3 className="text-xl font-semibold text-gray-900">Depósito QR Automático</h3>
              <button
                onClick={() => setShowAutoDepositModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Casa de Apostas
                </label>
                <select
                  value={selectedBettingHouse}
                  onChange={(e) => setSelectedBettingHouse(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma casa</option>
                  <option value="bet365">Bet365</option>
                  <option value="betano">Betano</option>
                  <option value="sportingbet">Sportingbet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione os CPFs
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                  {childAccounts.map(account => (
                    <label key={account.id} className="flex items-center p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccounts([...selectedAccounts, account.id]);
                          } else {
                            setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{account.name} - {account.cpf}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
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
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAutoDepositModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStartDeposit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Iniciar Depósito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mother Account Withdrawal Modal */}
      {showMotherAccountWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Saque Conta Mãe</h3>
              <button
                onClick={() => setShowMotherAccountWithdrawalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 text-yellow-700">
                <Info className="w-5 h-5" />
                <p className="text-sm">
                  O saque da conta mãe só poderá ser realizado para contas da mesma titularidade.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF do Titular
                </label>
                <input
                  type="text"
                  value={withdrawalCPF}
                  onChange={(e) => setWithdrawalCPF(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banco
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um banco</option>
                  {banks.map((bank, index) => (
                    <option key={index} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Saque
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={withdrawalAmount}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      const formatted = numericValue ? formatCurrency(parseInt(numericValue) / 100) : '';
                      setWithdrawalAmount(formatted);
                    }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                  Taxa de saque: R$ 2,00
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowMotherAccountWithdrawalModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleMotherAccountWithdrawal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <BanknoteIcon className="w-4 h-4" />
                Confirmar Saque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Fintech;