import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, EyeOff, Settings, Check, X, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAccounts } from '../hooks/useAccounts';
import { useBettingHouses } from '../hooks/useBettingHouses';
import { ColumnSelector } from './ColumnSelector';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import { formatCPF, formatPhone } from '../utils/formatters';
import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Account {
  id: string;
  item: number;
  responsavel: string;
  status: string;
  name: string;
  cpf: string;
  birth_date: string;
  address: string | null;
  phone: string | null;
  email1: string | null;
  password1: string | null;
  chip: string | null;
  verification: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountBettingHouse {
  id: string;
  account_id: string;
  betting_house_id: string;
  status: string | null;
  verification: string | null;
  saldo: string | null;
  deposito: string | null;
  sacado: string | null;
  creditos: string | null;
  obs: string | null;
}

interface BettingHouse {
  id: string;
  name: string;
}

const CPFAccounts: React.FC = () => {
  const { accounts, loading: loadingAccounts, error, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { bettingHouses, loading: loadingBettingHouses } = useBettingHouses();
  
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountBettingHouses, setAccountBettingHouses] = useState<AccountBettingHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [selectedHousesForNewAccount, setSelectedHousesForNewAccount] = useState<string[]>([]);
  const [selectAllHouses, setSelectAllHouses] = useState(false);
  const [isEmprestador, setIsEmprestador] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [emprestadorData, setEmprestadorData] = useState({
    email: '',
    password: ''
  });
  const [newAccountData, setNewAccountData] = useState({
    name: '',
    cpf: '',
    birth_date: '',
    responsavel: '',
    status: 'ABRIR',
    phone: '',
    email1: '',
    password1: '',
    address: '',
    item: 0,
    saldo: '',
    deposito: '',
    sacado: '',
    creditos: '',
    obs: ''
  });
  const [editingStatus, setEditingStatus] = useState<{id: string, value: string} | null>(null);
  const [editingField, setEditingField] = useState<{id: string, field: string, value: string} | null>(null);
  
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ABRIR', label: 'ABRIR' },
    { value: 'Verificado', label: 'Verificado' },
    { value: 'Verificar', label: 'Verificar' },
    { value: 'Conta Aberta', label: 'Conta Aberta' },
    { value: 'Selfie', label: 'Selfie' },
    { value: 'DISPONIVEL', label: 'DISPONIVEL' },
    // { value: 'Em Operação', label: 'Em Operação' }
  ];
  
  useEffect(() => {
    if (showEditModal && selectedAccount) {
      const loadAccountData = async () => {
        try {
          // Load betting houses for this account
          const { data: accountHouses } = await supabase
            .from('account_betting_houses')
            .select('betting_house_id')
            .eq('account_id', selectedAccount.id);
            
          if (accountHouses) {
            const houseIds = accountHouses.map(h => h.betting_house_id);
            setSelectedHousesForNewAccount(houseIds);
            setSelectAllHouses(houseIds.length === bettingHouses.length);
          }
          
          // Load emprestador data if exists
          const { data: emprestador } = await supabase
            .from('emprestadores')
            .select('*')
            .eq('account_id', selectedAccount.id)
            .single();
            
          if (emprestador) {
            setIsEmprestador(true);
            setEmprestadorData({
              email: emprestador.email || '',
              password: emprestador.password || ''
            });
          } else {
            setIsEmprestador(false);
            setEmprestadorData({ email: '', password: '' });
          }
        } catch (error) {
          console.error('Error loading account data for edit:', error);
        }
      };
      
      loadAccountData();
    }
  }, [showEditModal, selectedAccount]);

  // Column visibility management
  const columns = [
    { id: 'item', label: 'Item', defaultVisible: true },
    { id: 'responsavel', label: 'Responsável', defaultVisible: true },
    { id: 'status', label: 'Status', defaultVisible: true },
    { id: 'verification', label: 'Verificação', defaultVisible: true },
    { id: 'name', label: 'Nome', defaultVisible: true },
    { id: 'cpf', label: 'CPF', defaultVisible: true },
    { id: 'birth_date', label: 'Data Nasc.', defaultVisible: true },
    { id: 'address', label: 'Endereço', defaultVisible: false },
    { id: 'phone', label: 'Telefone', defaultVisible: false },
    { id: 'email1', label: 'Email', defaultVisible: true },
    { id: 'password1', label: 'Senha', defaultVisible: true },
    { id: 'chip', label: 'Chip', defaultVisible: false },
    { id: 'actions', label: 'Ações', defaultVisible: true },
    { id: 'saldo', label: 'Saldo', defaultVisible: false },
    { id: 'deposito', label: 'Depósito', defaultVisible: false },
    { id: 'sacado', label: 'Sacado', defaultVisible: false },
    { id: 'creditos', label: 'Créditos', defaultVisible: false },
    { id: 'obs', label: 'Observações', defaultVisible: false },
  ];

  const { visibleColumns, toggleColumn, updateVisibleColumns } = useColumnVisibility(columns);

  useEffect(() => {
    if (!loadingAccounts && !loadingBettingHouses) {
      setLoading(false);
    }
  }, [loadingAccounts, loadingBettingHouses]);

  useEffect(() => {
    if (selectedHouse) {
      fetchAccountBettingHouses();
    }
  }, [selectedHouse]);

  const fetchAccountBettingHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('account_betting_houses')
        .select('*')
        .eq('betting_house_id', selectedHouse);

      if (error) throw error;
      setAccountBettingHouses(data || []);
    } catch (error) {
      console.error('Error fetching account betting houses:', error);
    }
  };

  const handleAddAccount = async () => {
    try {
      // Validações básicas
      if (!newAccountData.name || !newAccountData.cpf || !newAccountData.birth_date) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
  
      if (selectedHousesForNewAccount.length === 0) {
        alert("Por favor, selecione pelo menos uma casa de apostas.");
        return;
      }
  
      // Formatar data de nascimento para o formato correto
      const birthDate = new Date(newAccountData.birth_date);
      const formattedBirthDate = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
  
      // Buscar o maior item existente para incrementar
      const { data: accounts } = await supabase
        .from('accounts')
        .select('item')
        .order('item', { ascending: false })
        .limit(1);
  
      const maxItem = accounts && accounts.length > 0 ? accounts[0].item : 0;
  
      // Criar nova conta
      const newAccount = await addAccount({
        name: newAccountData.name,
        cpf: newAccountData.cpf.replace(/\D/g, ''),
        birth_date: formattedBirthDate,
        responsavel: newAccountData.responsavel,
        status: newAccountData.status,
        phone: newAccountData.phone,
        email1: newAccountData.email1,
        password1: newAccountData.password1,
        address: newAccountData.address,
        item: maxItem + 1,
        chip: null,
        verification: null
      });
      
      // Adicionar às casas de apostas selecionadas
      if (newAccount) {
        console.log("Valores a serem inseridos:", {
          saldo: newAccountData.saldo,
          deposito: newAccountData.deposito,
          sacado: newAccountData.sacado,
          creditos: newAccountData.creditos,
          obs: newAccountData.obs
        }); // Para debug
        
        const insertPromises = selectedHousesForNewAccount.map(houseId => {
          return supabase
            .from('account_betting_houses')
            .insert({
              account_id: newAccount.id,
              betting_house_id: houseId,
              status: 'ABRIR',
              verification: null,
              saldo: newAccountData.saldo || '',
              deposito: newAccountData.deposito || '',
              sacado: newAccountData.sacado || '',
              creditos: newAccountData.creditos || '',
              obs: newAccountData.obs || ''
            })
            .then(result => {
              console.log(`Inserção para casa ${houseId}:`, result);
              if (result.error) {
                console.error(`Erro ao inserir para casa ${houseId}:`, result.error);
              }
              return result;
            });
        });
        
        const results = await Promise.all(insertPromises);
        console.log("Resultados das inserções:", results);
        
        // Criar conta de emprestador se necessário
        if (isEmprestador && emprestadorData.email && emprestadorData.password) {
          const { data: emprestador, error: emprestadorError } = await supabase
            .from('emprestadores')
            .insert({
              name: newAccountData.name,
              cpf: newAccountData.cpf.replace(/\D/g, ''),
              email: emprestadorData.email,
              password: emprestadorData.password,
              status: 'Ativo'
            });
            
          if (emprestadorError) {
            console.error("Erro ao criar emprestador:", emprestadorError);
            alert("Conta criada, mas houve um erro ao criar o perfil de emprestador.");
          }
        }
        
        // Mostrar mensagem de sucesso
        alert("Conta criada com sucesso!");
        
        // Reset form e fechar modal
        setNewAccountData({
          name: '',
          cpf: '',
          birth_date: '',
          responsavel: '',
          status: 'ABRIR',
          phone: '',
          email1: '',
          password1: '',
          address: '',
          item: 0,
          saldo: '',
          deposito: '',
          sacado: '',
          creditos: '',
          obs: ''
        });
        setSelectedHousesForNewAccount([]);
        setSelectAllHouses(false);
        setIsEmprestador(false);
        setEmprestadorData({ email: '', password: '' });
        setShowNewAccountModal(false);
        
        // Recarregar dados
        fetchAccounts();
      }
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      alert("Ocorreu um erro ao adicionar a conta. Por favor, tente novamente.");
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      // Update the account
      await updateAccount(selectedAccount.id, {
        name: selectedAccount.name,
        cpf: selectedAccount.cpf,
        birth_date: selectedAccount.birth_date,
        responsavel: selectedAccount.responsavel,
        status: selectedAccount.status,
        phone: selectedAccount.phone,
        email1: selectedAccount.email1,
        password1: selectedAccount.password1,
        address: selectedAccount.address,
        chip: selectedAccount.chip,
        verification: selectedAccount.verification
      });
      
      // Handle betting houses if any selected
      if (selectedHousesForNewAccount.length > 0) {
        // First, get current account_betting_houses for this account
        const { data: currentHouses } = await supabase
          .from('account_betting_houses')
          .select('betting_house_id')
          .eq('account_id', selectedAccount.id);
        
        const currentHouseIds = currentHouses?.map(h => h.betting_house_id) || [];
        
        // Houses to add (selected but not current)
        const housesToAdd = selectedHousesForNewAccount.filter(id => !currentHouseIds.includes(id));
        
        // Houses to remove (current but not selected)
        const housesToRemove = currentHouseIds.filter(id => !selectedHousesForNewAccount.includes(id));
        
        // Add new houses
        if (housesToAdd.length > 0) {
          const insertData = housesToAdd.map(houseId => ({
            account_id: selectedAccount.id,
            betting_house_id: houseId,
            status: 'ABRIR',
            verification: null
          }));
          
          await supabase.from('account_betting_houses').insert(insertData);
        }
        
        // Remove houses that were unselected
        if (housesToRemove.length > 0) {
          await supabase
            .from('account_betting_houses')
            .delete()
            .eq('account_id', selectedAccount.id)
            .in('betting_house_id', housesToRemove);
        }
      }
      
      // Handle emprestador data
      if (isEmprestador) {
        // Check if an emprestador already exists for this account
        const { data: existingEmprestador } = await supabase
          .from('emprestadores')
          .select('*')
          .eq('account_id', selectedAccount.id)
          .single();
        
        if (existingEmprestador) {
          // Update existing emprestador
          await supabase
            .from('emprestadores')
            .update({
              email: emprestadorData.email,
              password: emprestadorData.password // Consider hash for production
            })
            .eq('id', existingEmprestador.id);
        } else {
          // Check if the email is already used
          const { data: emailExists } = await supabase
            .from('emprestadores')
            .select('id')
            .eq('email', emprestadorData.email)
            .single();
            
          if (emailExists) {
            alert('Este email já está em uso por outro emprestador');
            return;
          }
          
          // Create new emprestador
          await supabase.from('emprestadores').insert({
            account_id: selectedAccount.id,
            email: emprestadorData.email,
            password: emprestadorData.password // Consider hash for production
          });
        }
      }
      
      // Close modal and refresh data
      setShowEditModal(false);
      setSelectedAccount(null);
      setSelectedHousesForNewAccount([]);
      setSelectAllHouses(false);
      setIsEmprestador(false);
      setEmprestadorData({ email: '', password: '' });
      
      if (selectedHouse) {
        fetchAccountBettingHouses();
      }
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Erro ao atualizar conta: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta conta da casa de apostas?')) {
      try {
        // Se uma casa de apostas está selecionada, apenas remove a associação
        if (selectedHouse) {
          // Remover apenas a associação entre conta e casa de apostas
          const { error } = await supabase
            .from('account_betting_houses')
            .delete()
            .eq('account_id', id)
            .eq('betting_house_id', selectedHouse);
            
          if (error) throw error;
          
          // Atualizar a lista de associações após a exclusão
          fetchAccountBettingHouses();
          
          alert('Associação removida com sucesso');
        } else {
          // Se nenhuma casa estiver selecionada, exclui a conta completa
          await deleteAccount(id);
          alert('Conta excluída com sucesso');
        }
      } catch (error) {
        console.error('Error deleting account association:', error);
        alert('Erro ao excluir associação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      }
    }
  };

  const handleStatusChange = async (accountId: string, newStatus: string) => {
    try {
      await updateAccount(accountId, { status: newStatus });
      setEditingStatus(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAccountData({
      ...newAccountData,
      cpf: formatCPF(e.target.value)
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAccountData({
      ...newAccountData,
      phone: formatPhone(e.target.value)
    });
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.cpf.includes(searchTerm) ||
      (account.email1 && account.email1.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter ? account.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const accountsToDisplay = selectedHouse
    ? accounts.filter(account => 
        accountBettingHouses.some(abh => 
          abh.account_id === account.id && abh.betting_house_id === selectedHouse
        )
      )
    : filteredAccounts;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  const exportToExcel = () => {
    // Preparar os dados para exportação
    const dataToExport = accountsToDisplay.map(account => {
      // Encontrar as casas de apostas associadas a esta conta
      const accountHouses = accountBettingHouses
        .filter(abh => abh.account_id === account.id)
        .map(abh => {
          const house = bettingHouses.find(h => h.id === abh.betting_house_id);
          return house ? house.name : '';
        })
        .join(', ');
      
      return {
        Item: account.item,
        Responsável: account.responsavel,
        Status: account.status,
        Verificação: account.verification || '',
        Nome: account.name,
        CPF: account.cpf,
        'Data Nascimento': formatDate(account.birth_date),
        Endereço: account.address || '',
        Telefone: account.phone || '',
        Email: account.email1 || '',
        Senha: account.password1 || '',
        Chip: account.chip || '',
        'Casas de Apostas': accountHouses
      };
    });
  
    // Criar planilha e baixar
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contas CPF");
    
    // Gerar buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Salvar arquivo
    const fileName = `contas_cpf_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    saveAs(data, fileName);
  };
  
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Função para abrir o seletor de arquivos
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Função para processar o arquivo importado
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Array para armazenar erros
      const errors: string[] = [];
      
      // Processar cada linha do Excel
      for (const row of jsonData) {
        try {
          // Validar dados obrigatórios
          if (!row['Nome'] || !row['CPF'] || !row['Data Nascimento']) {
            errors.push(`Linha com dados incompletos: ${JSON.stringify(row)}`);
            continue;
          }
          
          // Formatar CPF
          const cpf = String(row['CPF']).replace(/\D/g, '');
          
          // Formatar data de nascimento
          let birthDate = String(row['Data Nascimento']);
          if (birthDate.includes('/')) {
            const [day, month, year] = birthDate.split('/');
            birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          
          // Preparar dados para inserção
          const accountData = {
            name: String(row['Nome']),
            cpf: cpf,
            birth_date: birthDate,
            responsavel: row['Responsável'] ? String(row['Responsável']) : 'Admin',
            status: row['Status'] ? String(row['Status']) : 'ABRIR',
            phone: row['Telefone'] ? String(row['Telefone']) : null,
            email1: row['Email'] ? String(row['Email']) : null,
            password1: row['Senha'] ? String(row['Senha']) : null,
            address: row['Endereço'] ? String(row['Endereço']) : null,
            item: accounts.length > 0 ? Math.max(...accounts.map(a => a.item)) + 1 : 1,
            chip: row['Chip'] ? String(row['Chip']) : null,
            verification: row['Verificação'] ? String(row['Verificação']) : null
          };
          
          // Adicionar conta
          const newAccount = await addAccount(accountData);
          
          // Adicionar às casas de apostas
          if (newAccount && row['Casas de Apostas']) {
            const housesNames = String(row['Casas de Apostas']).split(',').map(h => h.trim());
            
            for (const houseName of housesNames) {
              const house = bettingHouses.find(h => h.name.toLowerCase() === houseName.toLowerCase());
              if (house) {
                await supabase
                  .from('account_betting_houses')
                  .insert({
                    account_id: newAccount.id,
                    betting_house_id: house.id,
                    status: 'ABRIR',
                    verification: null
                  });
              } else {
                errors.push(`Casa de apostas não encontrada: ${houseName} para conta ${accountData.name}`);
              }
            }
          }
        } catch (error) {
          errors.push(`Erro ao processar linha: ${JSON.stringify(row)} - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
      
      // Limpar input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Mostrar resultado
      if (errors.length > 0) {
        alert(`Importação concluída com ${errors.length} erros. Verifique o console para detalhes.`);
        console.error('Erros de importação:', errors);
      } else {
        alert('Importação concluída com sucesso!');
      }
      
      // Atualizar dados
      if (selectedHouse) {
        fetchAccountBettingHouses();
      }
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      alert('Erro ao importar arquivo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  

  if (loading) {
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
// Atualizar a função handleFieldChange para lidar corretamente com os novos campos
const handleFieldChange = async (accountId: string, field: string, value: string) => {
  try {
    if (['saldo', 'deposito', 'sacado', 'creditos', 'obs'].includes(field)) {
      // Campos específicos da casa de apostas
      if (!selectedHouse) {
        alert('Por favor, selecione uma casa de apostas primeiro');
        setEditingField(null);
        return;
      }
      
      // Verificar se já existe um registro para esta conta e casa de apostas
      const existingRecord = accountBettingHouses.find(
        abh => abh.account_id === accountId && abh.betting_house_id === selectedHouse
      );
      
      if (existingRecord) {
        // Atualizar o registro existente
        const { error } = await supabase
          .from('account_betting_houses')
          .update({ [field]: value })
          .eq('account_id', accountId)
          .eq('betting_house_id', selectedHouse);
          
        if (error) throw error;
      } else {
        // Criar um novo registro
        const { error } = await supabase
          .from('account_betting_houses')
          .insert({
            account_id: accountId,
            betting_house_id: selectedHouse,
            [field]: value,
            status: 'ABRIR' // Valor padrão para status
          });
          
        if (error) throw error;
      }
      
      // Recarregar os dados da casa selecionada
      fetchAccountBettingHouses();
    } else {
      // Campos da conta principal
      const updates: Record<string, string | null> = {};
      
      // Tratar valor vazio como null para os campos da conta principal
      updates[field] = value.trim() === '' ? null : 
                     (field === 'cpf' ? value.replace(/\D/g, '') : value);
      
      await updateAccount(accountId, updates);
    }
    
    setEditingField(null);
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    alert(`Erro ao atualizar ${field}: ` + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
};

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Contas CPF</h1>
        <p className="text-gray-600">Gerencie suas contas CPF e suas verificações</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total de Contas</h3>
          <p className="text-2xl font-bold text-blue-900 mt-1">{accounts.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Documentos Finalizados</h3>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {accounts.filter(a => a.status === 'Verificado').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Selfies Pendentes</h3>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {accounts.filter(a => a.status === 'Selfie').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Abrir Casas</h3>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {accounts.filter(a => a.status === 'ABRIR').length}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800">Verificações Pendentes</h3>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {accounts.filter(a => a.verification === 'Verificar').length}
          </p>
        </div>
        <div className="bg-teal-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-teal-800">Contas 100%</h3>
          <p className="text-2xl font-bold text-teal-900 mt-1">
          {accounts.filter(a => a.status === 'Verificado').length}
          </p>
        </div>
        {/* <div className="bg-emerald-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-emerald-800">Em Operação</h3>
          <p className="text-2xl font-bold text-emerald-900 mt-1">
            {accounts.filter(a => a.status === 'Em Operação').length}
          </p>
        </div> */}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Contas CPF</h2>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma casa</option>
              {bettingHouses.map(house => (
                <option key={house.id} value={house.id}>{house.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <ColumnSelector
              columns={columns}
              visibleColumns={visibleColumns}
              onColumnToggle={toggleColumn}
              onSave={updateVisibleColumns}
            />
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPasswords ? 'Ocultar Senhas' : 'Mostrar Senhas'}
            </button>
            <button
              onClick={() => setShowNewAccountModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button 
              onClick={handleImportClick}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {/* <Upload className="w-4 h-4 mr-2" /> */}
              Importar Excel
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </button>
          </div>
        </div>
        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".xlsx, .xls"
        className="hidden"
      />
{showImportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Instruções para Importação</h3>
        <button onClick={() => setShowImportModal(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-4">
        <p className="mb-2">O arquivo Excel deve ter as seguintes colunas:</p>
        <ul className="list-disc pl-5 mb-4">
          <li><strong>Nome</strong> (obrigatório): Nome completo da conta</li>
          <li><strong>CPF</strong> (obrigatório): CPF sem formatação ou formatado (000.000.000-00)</li>
          <li><strong>Data Nascimento</strong> (obrigatório): Data no formato DD/MM/AAAA</li>
          <li><strong>Responsável</strong>: Nome do responsável pela conta</li>
          <li><strong>Status</strong>: Status da conta (ABRIR, Verificado, etc.)</li>
          <li><strong>Telefone</strong>: Número de telefone</li>
          <li><strong>Email</strong>: Email da conta</li>
          <li><strong>Senha</strong>: Senha da conta</li>
          <li><strong>Endereço</strong>: Endereço completo</li>
          <li><strong>Chip</strong>: Informação de chip</li>
          <li><strong>Verificação</strong>: Status de verificação</li>
          <li><strong>Casas de Apostas</strong>: Lista de casas separadas por vírgula</li>
        </ul>
        
        <a href="#" className="text-blue-600 hover:underline" onClick={(e) => {
          e.preventDefault();
          const ws = XLSX.utils.json_to_sheet([{
            Nome: 'João Silva',
            CPF: '123.456.789-00',
            'Data Nascimento': '01/01/1990',
            Responsável: 'Admin',
            Status: 'ABRIR',
            Telefone: '(11) 98765-4321',
            Email: 'joao@exemplo.com',
            Senha: 'senha123',
            Endereço: 'Rua Exemplo, 123',
            Chip: '',
            Verificação: '',
            'Casas de Apostas': 'Bet365, Sportingbet'
          }]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Modelo");
          XLSX.writeFile(wb, "modelo_importacao_contas.xlsx");
        }}>
          Baixar modelo de importação
        </a>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setShowImportModal(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Entendi
        </button>
      </div>
    </div>
  </div>
)}

        {/* Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.has('item') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                )}
                {visibleColumns.has('responsavel') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                )}
                {visibleColumns.has('status') && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verificação
                    </th>
                  </>
                )}
                {visibleColumns.has('name') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                )}
                {visibleColumns.has('cpf') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                )}
                {visibleColumns.has('birth_date') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Nasc.
                  </th>
                )}
                {visibleColumns.has('address') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="w-32 inline-block truncate">Endereço</span>
                  </th>
                )}
                {visibleColumns.has('phone') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                )}
                {visibleColumns.has('email1') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                )}
                {visibleColumns.has('password1') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Senha
                  </th>
                )}
                {visibleColumns.has('chip') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chip
                  </th>
                )}
                {/* No thead da tabela, adicione: */}
                  {visibleColumns.has('saldo') && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saldo
                      </th>
                    )}
                    {visibleColumns.has('deposito') && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Depósito
                      </th>
                    )}
                    {visibleColumns.has('sacado') && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sacado
                      </th>
                    )}
                    {visibleColumns.has('creditos') && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créditos
                      </th>
                    )}
                    {visibleColumns.has('obs') && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Observações
                      </th>
                    )}
                {visibleColumns.has('actions') && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accountsToDisplay.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  {visibleColumns.has('item') && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {account.item}
                    </td>
                  )}
                  {visibleColumns.has('responsavel') && (
  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'responsavel' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'responsavel', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => setEditingField({id: account.id, field: 'responsavel', value: account.responsavel || ''})}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
      >
        {account.responsavel}
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('status') && (
                    <td className="px-3 py-2 whitespace-nowrap">
                      {editingStatus && editingStatus.id === account.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingStatus.value}
                            onChange={(e) => setEditingStatus({...editingStatus, value: e.target.value})}
                            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleStatusChange(account.id, editingStatus.value)}
                            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingStatus(null)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setEditingStatus({id: account.id, value: account.status})}
                          className="cursor-pointer text-xs"
                        >
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            account.status === 'Verificado' ? 'bg-green-100 text-green-800' :
                            account.status === 'ABRIR' ? 'bg-purple-100 text-purple-800' :
                            account.status === 'Selfie' ? 'bg-yellow-100 text-yellow-800' :
                            // account.status === 'Em Operação' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {account.status}
                          </span>
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.has('verification') && (
  <td className="px-3 py-2 whitespace-nowrap">
    {editingField && editingField.id === account.id && editingField.field === 'verification' ? (
      <div className="flex items-center gap-2">
        <select
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        >
          <option value="">N/A</option>
          <option value="Verificar">Verificar</option>
          <option value="Verificado">Verificado</option>
          <option value="DISPONIVEL">DISPONIVEL</option>
          <option value="CONTA ABERTA">CONTA ABERTA</option>
        </select>
        <button 
          onClick={() => handleFieldChange(account.id, 'verification', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => setEditingField({id: account.id, field: 'verification', value: account.verification || ''})}
        className="cursor-pointer"
      >
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          account.verification === 'Verificado' ? 'bg-green-100 text-green-800' :
          account.verification === 'Verificar' ? 'bg-orange-100 text-orange-800' :
          account.verification === 'DISPONIVEL' ? 'bg-emerald-100 text-emerald-800' :
          account.verification === 'CONTA ABERTA' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {account.verification || 'N/A'}
        </span>
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('name') && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {editingField && editingField.id === account.id && editingField.field === 'name' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingField.value}
                            onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleFieldChange(account.id, 'name', editingField.value)}
                            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingField(null)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setEditingField({id: account.id, field: 'name', value: account.name})}
                          className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                        >
                          {account.name}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.has('cpf') && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {editingField && editingField.id === account.id && editingField.field === 'cpf' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingField.value}
                            onChange={(e) => setEditingField({...editingField, value: formatCPF(e.target.value)})}
                            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            autoFocus
                            maxLength={14}
                          />
                          <button 
                            onClick={() => handleFieldChange(account.id, 'cpf', editingField.value.replace(/\D/g, ''))}
                            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingField(null)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setEditingField({id: account.id, field: 'cpf', value: formatCPF(account.cpf)})}
                          className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                        >
                          {formatCPF(account.cpf)}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.has('birth_date') && (
  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'birth_date' ? (
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'birth_date', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => setEditingField({id: account.id, field: 'birth_date', value: account.birth_date})}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
      >
        {formatDate(account.birth_date)}
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('address') && (
  <td className="px-3 py-2 text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'address' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'address', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => setEditingField({id: account.id, field: 'address', value: account.address || ''})}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded w-32 truncate"
        title={account.address || ''}
      >
        {account.address || '-'}
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('phone') && (
  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'phone' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: formatPhone(e.target.value)})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'phone', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => setEditingField({id: account.id, field: 'phone', value: account.phone || ''})}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
      >
        {account.phone}
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('email1') && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {editingField && editingField.id === account.id && editingField.field === 'email1' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={editingField.value || ''}
                            onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleFieldChange(account.id, 'email1', editingField.value)}
                            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingField(null)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setEditingField({id: account.id, field: 'email1', value: account.email1 || ''})}
                          className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                        >
                          {account.email1}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.has('password1') && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {editingField && editingField.id === account.id && editingField.field === 'password1' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingField.value || ''}
                            onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleFieldChange(account.id, 'password1', editingField.value)}
                            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingField(null)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setEditingField({id: account.id, field: 'password1', value: account.password1 || ''})}
                          className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                        >
                          {showPasswords ? account.password1 : '••••••••'}
                        </div>
                      )}
                    </td>
                  )}
                  {visibleColumns.has('chip') && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {editingField && editingField.id === account.id && editingField.field === 'chip' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingField.value || ''}
                            onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                            className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleFieldChange(account.id, 'chip', editingField.value)}
                            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingField(null)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setEditingField({id: account.id, field: 'chip', value: account.chip || ''})}
                          className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                        >
                          {account.chip}
                        </div>
                      )}
                    </td>
                  )}
                  
                  {/* Dentro do mapeamento accountsToDisplay.map((account) => (...)), adicione: */}
                  {visibleColumns.has('saldo') && (
  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'saldo' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'saldo', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => {
          if (!selectedHouse) {
            alert('Selecione uma casa de apostas primeiro');
            return;
          }
          const accountHouse = accountBettingHouses.find(abh => 
            abh.account_id === account.id && abh.betting_house_id === selectedHouse
          );
          setEditingField({
            id: account.id, 
            field: 'saldo', 
            value: accountHouse?.saldo || ''
          });
        }}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
      >
        {accountBettingHouses.find(abh => 
          abh.account_id === account.id && abh.betting_house_id === selectedHouse
        )?.saldo || '-'}
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('deposito') && (
  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'deposito' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'deposito', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => {
          if (!selectedHouse) {
            alert('Selecione uma casa de apostas primeiro');
            return;
          }
          const accountHouse = accountBettingHouses.find(abh => 
            abh.account_id === account.id && abh.betting_house_id === selectedHouse
          );
          setEditingField({
            id: account.id, 
            field: 'deposito', 
            value: accountHouse?.deposito || ''
          });
        }}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
      >
        {accountBettingHouses.find(abh => 
          abh.account_id === account.id && abh.betting_house_id === selectedHouse
        )?.deposito || '-'}
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('sacado') && (
  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'sacado' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'sacado', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => {
          if (!selectedHouse) {
            alert('Selecione uma casa de apostas primeiro');
            return;
          }
          const accountHouse = accountBettingHouses.find(abh => 
            abh.account_id === account.id && abh.betting_house_id === selectedHouse
          );
          setEditingField({
            id: account.id, 
            field: 'sacado', 
            value: accountHouse?.sacado || ''
          });
        }}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
      >
        {accountBettingHouses.find(abh => 
          abh.account_id === account.id && abh.betting_house_id === selectedHouse
        )?.sacado || '-'}
      </div>
    )}
  </td>
)}
              {visibleColumns.has('creditos') && (
  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'creditos' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'creditos', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => {
          if (!selectedHouse) {
            alert('Selecione uma casa de apostas primeiro');
            return;
          }
          const accountHouse = accountBettingHouses.find(abh => 
            abh.account_id === account.id && abh.betting_house_id === selectedHouse
          );
          setEditingField({
            id: account.id, 
            field: 'creditos', 
            value: accountHouse?.creditos || ''
          });
        }}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
      >
        {accountBettingHouses.find(abh => 
          abh.account_id === account.id && abh.betting_house_id === selectedHouse
        )?.creditos || '-'}
      </div>
    )}
  </td>
)}
                 {visibleColumns.has('obs') && (
  <td className="px-3 py-2 text-xs text-gray-900">
    {editingField && editingField.id === account.id && editingField.field === 'obs' ? (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editingField.value || ''}
          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
          className="px-2 py-1 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          autoFocus
        />
        <button 
          onClick={() => handleFieldChange(account.id, 'obs', editingField.value)}
          className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setEditingField(null)}
          className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => {
          if (!selectedHouse) {
            alert('Selecione uma casa de apostas primeiro');
            return;
          }
          const accountHouse = accountBettingHouses.find(abh => 
            abh.account_id === account.id && abh.betting_house_id === selectedHouse
          );
          setEditingField({
            id: account.id, 
            field: 'obs', 
            value: accountHouse?.obs || ''
          });
        }}
        className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded w-32 truncate"
        title={accountBettingHouses.find(abh => 
          abh.account_id === account.id && abh.betting_house_id === selectedHouse
        )?.obs || ''}
      >
        {accountBettingHouses.find(abh => 
          abh.account_id === account.id && abh.betting_house_id === selectedHouse
        )?.obs || '-'}
      </div>
    )}
  </td>
)}
                  {visibleColumns.has('actions') && (
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
      </div>

      {/* New Account Modal */}
      {showNewAccountModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-1 pb-2 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Nova Conta</h3>
        <button
          onClick={() => setShowNewAccountModal(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            value={newAccountData.name}
            onChange={(e) => setNewAccountData({...newAccountData, name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <input
            type="text"
            value={newAccountData.cpf}
            onChange={handleCPFChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={14}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento
          </label>
          <input
            type="date"
            value={newAccountData.birth_date}
            onChange={(e) => setNewAccountData({...newAccountData, birth_date: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável
          </label>
          <input
            type="text"
            value={newAccountData.responsavel}
            onChange={(e) => setNewAccountData({...newAccountData, responsavel: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={newAccountData.status}
            onChange={(e) => setNewAccountData({...newAccountData, status: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="ABRIR">ABRIR</option>
            <option value="Verificado">Verificado</option>
            <option value="Verificar">Verificar</option>
            <option value="Conta Aberta">Conta Aberta</option>
            <option value="Selfie">Selfie</option>
            <option value="DISPONIVEL">DISPONIVEL</option>
            {/* <option value="Em Operação">Em Operação</option> */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="text"
            value={newAccountData.phone}
            onChange={handlePhoneChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={newAccountData.email1}
            onChange={(e) => setNewAccountData({...newAccountData, email1: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="text"
            value={newAccountData.password1}
            onChange={(e) => setNewAccountData({...newAccountData, password1: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            value={newAccountData.address}
            onChange={(e) => setNewAccountData({...newAccountData, address: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Casas de Apostas
        </label>
        <div className="mb-2 flex items-center">
          <input
            type="checkbox"
            id="selectAllHouses"
            checked={selectAllHouses}
            onChange={(e) => {
              setSelectAllHouses(e.target.checked);
              if (e.target.checked) {
                setSelectedHousesForNewAccount(bettingHouses.map(house => house.id));
              } else {
                setSelectedHousesForNewAccount([]);
              }
            }}
            className="mr-2"
          />
          <label htmlFor="selectAllHouses" className="text-sm text-gray-700">
            Selecionar todas as casas
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
          {bettingHouses.map(house => (
            <div key={house.id} className="flex items-center">
              <input
                type="checkbox"
                id={`house-${house.id}`}
                value={house.id}
                checked={selectedHousesForNewAccount.includes(house.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedHousesForNewAccount([...selectedHousesForNewAccount, house.id]);
                  } else {
                    setSelectedHousesForNewAccount(selectedHousesForNewAccount.filter(id => id !== house.id));
                    setSelectAllHouses(false);
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={`house-${house.id}`} className="text-sm text-gray-700 truncate">
                {house.name}
              </label>
            </div>
          ))}
        </div>
        {selectedHousesForNewAccount.length === 0 && (
          <p className="text-red-500 text-xs mt-1">Selecione pelo menos uma casa de apostas</p>
        )}
      </div>

      <div className="mb-4 border-t pt-4">
        <h4 className="text-md font-medium text-gray-800 mb-3">Informações Financeiras</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo Inicial
            </label>
            <input
              type="text"
              value={newAccountData.saldo || ''}
              onChange={(e) => setNewAccountData({...newAccountData, saldo: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depósito Inicial
            </label>
            <input
              type="text"
              value={newAccountData.deposito || ''}
              onChange={(e) => setNewAccountData({...newAccountData, deposito: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sacado
            </label>
            <input
              type="text"
              value={newAccountData.sacado || ''}
              onChange={(e) => setNewAccountData({...newAccountData, sacado: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Créditos
            </label>
            <input
              type="text"
              value={newAccountData.creditos || ''}
              onChange={(e) => setNewAccountData({...newAccountData, creditos: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0,00"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={newAccountData.obs || ''}
              onChange={(e) => setNewAccountData({...newAccountData, obs: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adicione observações relevantes aqui"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 mt-2 border-t pt-4">
  <div className="flex items-center mb-2">
    <input
      type="checkbox"
      id="isEmprestador"
      checked={isEmprestador}
      onChange={(e) => setIsEmprestador(e.target.checked)}
      className="mr-2"
    />
    <label htmlFor="isEmprestador" className="text-sm font-medium text-gray-700">
      Criar conta de emprestador para este CPF?
    </label>
  </div>
  
  {isEmprestador && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email do Emprestador
        </label>
        <input
          type="email"
          value={emprestadorData.email}
          onChange={(e) => setEmprestadorData({...emprestadorData, email: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={isEmprestador}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha do Emprestador
        </label>
        <input
          type="text"
          value={emprestadorData.password}
          onChange={(e) => setEmprestadorData({...emprestadorData, password: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={isEmprestador}
        />
      </div>
    </div>
  )}
</div>


      <div className="flex justify-end gap-3 sticky bottom-0 pt-2 pb-1 bg-white border-t">
        <button
          onClick={() => {
            setShowNewAccountModal(false);
            setSelectedHousesForNewAccount([]);
            setSelectAllHouses(false);
          }}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddAccount}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Adicionar Conta
        </button>
      </div>
    </div>
  </div>
)}

      {/* Edit Account Modal */}
   
{showEditModal && selectedAccount && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-1 pb-2 border-b">
        <h3 className="text-xl font-semibold text-gray-900">Editar Conta</h3>
        <button
          onClick={() => {
            setShowEditModal(false);
            setSelectedAccount(null);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            value={selectedAccount.name}
            onChange={(e) => setSelectedAccount({...selectedAccount, name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <input
            type="text"
            value={formatCPF(selectedAccount.cpf)}
            onChange={(e) => setSelectedAccount({...selectedAccount, cpf: e.target.value.replace(/\D/g, '')})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={14}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento
          </label>
          <input
            type="date"
            value={selectedAccount.birth_date}
            onChange={(e) => setSelectedAccount({...selectedAccount, birth_date: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável
          </label>
          <input
            type="text"
            value={selectedAccount.responsavel}
            onChange={(e) => setSelectedAccount({...selectedAccount, responsavel: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={selectedAccount.status}
            onChange={(e) => setSelectedAccount({...selectedAccount, status: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="ABRIR">ABRIR</option>
            <option value="Verificado">Verificado</option>
            <option value="Verificar">Verificar</option>
            <option value="Conta Aberta">Conta Aberta</option>
            <option value="Selfie">Selfie</option>
            <option value="DISPONIVEL">DISPONIVEL</option>
            {/* <option value="Em Operação">Em Operação</option> */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="text"
            value={selectedAccount.phone || ''}
            onChange={(e) => setSelectedAccount({...selectedAccount, phone: formatPhone(e.target.value)})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={selectedAccount.email1 || ''}
            onChange={(e) => setSelectedAccount({...selectedAccount, email1: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="text"
            value={selectedAccount.password1 || ''}
            onChange={(e) => setSelectedAccount({...selectedAccount, password1: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chip
          </label>
          <input
            type="text"
            value={selectedAccount.chip || ''}
            onChange={(e) => setSelectedAccount({...selectedAccount, chip: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verificação
          </label>
          <select
            value={selectedAccount.verification || ''}
            onChange={(e) => setSelectedAccount({...selectedAccount, verification: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            <option value="Verificado">Verificado</option>
            <option value="Verificar">Verificar</option>
          </select>
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            value={selectedAccount.address || ''}
            onChange={(e) => setSelectedAccount({...selectedAccount, address: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Casas de Apostas
        </label>
        <div className="mb-2 flex items-center">
          <input
            type="checkbox"
            id="editSelectAllHouses"
            checked={selectAllHouses}
            onChange={(e) => {
              setSelectAllHouses(e.target.checked);
              if (e.target.checked) {
                setSelectedHousesForNewAccount(bettingHouses.map(house => house.id));
              } else {
                setSelectedHousesForNewAccount([]);
              }
            }}
            className="mr-2"
          />
          <label htmlFor="editSelectAllHouses" className="text-sm text-gray-700">
            Selecionar todas as casas
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
          {bettingHouses.map(house => (
            <div key={`edit-house-${house.id}`} className="flex items-center">
              <input
                type="checkbox"
                id={`edit-house-${house.id}`}
                value={house.id}
                checked={selectedHousesForNewAccount.includes(house.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedHousesForNewAccount([...selectedHousesForNewAccount, house.id]);
                  } else {
                    setSelectedHousesForNewAccount(selectedHousesForNewAccount.filter(id => id !== house.id));
                    setSelectAllHouses(false);
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={`edit-house-${house.id}`} className="text-sm text-gray-700 truncate">
                {house.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 mt-2 border-t pt-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="editIsEmprestador"
            checked={isEmprestador}
            onChange={(e) => setIsEmprestador(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="editIsEmprestador" className="text-sm font-medium text-gray-700">
            Criar/Editar conta de emprestador para este CPF?
          </label>
        </div>
        
        {isEmprestador && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email do Emprestador
              </label>
              <input
                type="email"
                value={emprestadorData.email}
                onChange={(e) => setEmprestadorData({...emprestadorData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={isEmprestador}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha do Emprestador
              </label>
              <input
                type="text"
                value={emprestadorData.password}
                onChange={(e) => setEmprestadorData({...emprestadorData, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={isEmprestador}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 sticky bottom-0 pt-2 pb-1 bg-white border-t mt-4">
        <button
          onClick={() => {
            setShowEditModal(false);
            setSelectedAccount(null);
          }}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleEditAccount}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default CPFAccounts;