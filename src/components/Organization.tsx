import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Bell, HelpCircle, Settings, Plus, Edit, Trash2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../utils/themecontext';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const verifyToken = (token: string) => {
  try {
    // Certifique-se de que o token é uma string válida antes de decodificar
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // O token JWT tem 3 partes separadas por ponto
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Decodifique apenas a parte do payload (segunda parte)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verifique se o token não está expirado
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
};

// Interfaces alinhadas com as tabelas do Supabase
interface Column {
  id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Card {
  id: string;
  column_id: string;
  content: string;
  description: string;
  color: string; // Vamos usar para prioridade: "red" (alta), "orange" (média), "green" (baixa)
  position: number;
  attachments: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface User {
  id: string;
  email?: string;
}

// Interface para o modal
interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<Card>) => void;
  card?: Card;
  isEditing: boolean;
  columnId?: string;
}
interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (column: Partial<Column>) => void;
  column?: Column;
  isEditing: boolean;
}

const ColumnModal = ({ isOpen, onClose, onSave, column, isEditing }: ColumnModalProps) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (column) {
      setTitle(column.title);
    } else {
      // Valor padrão para nova coluna
      setTitle('');
    }
  }, [column, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedColumn: Partial<Column> = {
      title: title.trim() || 'Nova Coluna',
    };

    if (isEditing && column) {
      // Se estiver editando, mantenha o id original
      updatedColumn.id = column.id;
    }

    onSave(updatedColumn);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {isEditing ? 'Editar Coluna' : 'Nova Coluna'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Coluna</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome da coluna"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Coluna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CardModal = ({ isOpen, onClose, onSave, card, isEditing, columnId }: CardModalProps) => {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('orange'); // média prioridade por padrão

  useEffect(() => {
    if (card) {
      setContent(card.content);
      setDescription(card.description);
      setColor(card.color);
    } else {
      // Valores padrão para novo card
      setContent('');
      setDescription('');
      setColor('orange');
    }
  }, [card, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCard: Partial<Card> = {
      content,
      description,
      color,
    };

    if (!isEditing) {
      // Se estiver criando um novo card, adicione o columnId
      updatedCard.column_id = columnId;
    } else if (card) {
      // Se estiver editando, mantenha o id e column_id originais
      updatedCard.id = card.id;
      updatedCard.column_id = card.column_id;
    }

    onSave(updatedCard);
    onClose();
  };



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Tarefa</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título da tarefa"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Vencimento</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite uma descrição ou data de vencimento"
              rows={3}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="green"
                  checked={color === 'green'}
                  onChange={() => setColor('green')}
                  className="mr-2"
                />
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Baixa</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="orange"
                  checked={color === 'orange'}
                  onChange={() => setColor('orange')}
                  className="mr-2"
                />
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Média</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="red"
                  checked={color === 'red'}
                  onChange={() => setColor('red')}
                  className="mr-2"
                />
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Alta</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Organization = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('todas-prioridades');
 
  // Estado para o modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<Card | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [currentColumnId, setCurrentColumnId] = useState<string | undefined>(undefined);
  // No componente Organization, adicione os estados para gerenciar o modal de coluna
const [columnModalOpen, setColumnModalOpen] = useState(false);
const [currentColumn, setCurrentColumn] = useState<Column | undefined>(undefined);
const [isEditingColumn, setIsEditingColumn] = useState(false);


  // Métricas calculadas
  const totalPendentes = columns.length > 0 ? 
    cards.filter(card => card.column_id === columns.find(col => col.title === 'A Fazer')?.id).length : 0;
  
  const tarefasAtrasadas = cards.filter(card => card.color === 'red').length; // Como placeholder para tarefas atrasadas
  
  const tarefasConcluidas = columns.length > 0 ? 
    cards.filter(card => card.column_id === columns.find(col => col.title === 'Concluído')?.id).length : 0;
  
  const tarefasEmprestadores = 3; // Valor fixo para exemplo, substituir por lógica real

  useEffect(() => {
    // Check for current user session
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      
      if (user) {
        setCurrentUser({ id: user.id, email: user.email || undefined });
        fetchUserData(user.id);
      } else {
        setIsLoading(false);
      }
    };
    
    getUser();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser({ id: session.user.id, email: session.user.email || undefined });
          fetchUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setColumns([]);
          setCards([]);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    
    // Fetch columns
    const { data: columnsData, error: columnsError } = await supabase
      .from('organization_columns')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });
    
    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
    } else if (columnsData.length === 0) {
      // Create default columns for new users
      const defaultColumns = [
        { 
          id: crypto.randomUUID(),
          title: 'A Fazer', 
          position: 0,
          user_id: userId 
        },
        { 
          id: crypto.randomUUID(),
          title: 'Em Andamento', 
          position: 1,
          user_id: userId 
        },
        { 
          id: crypto.randomUUID(),
          title: 'Concluído', 
          position: 2,
          user_id: userId 
        }
      ];
      
      for (const column of defaultColumns) {
        await supabase.from('organization_columns').insert(column);
      }
      
      setColumns(defaultColumns);
      
      // Create default cards for new users
      const defaultCards = [
        { 
          id: crypto.randomUUID(),
          column_id: defaultColumns[0].id, // A Fazer
          content: 'Verificar Documentos do CPF 114.577.219-96',
          description: 'Vencimento: 10/04/2025',
          color: 'red', // alta prioridade
          position: 0,
          attachments: [],
          user_id: userId 
        },
        { 
          id: crypto.randomUUID(),
          column_id: defaultColumns[0].id, // A Fazer
          content: 'Revisar Operações da Banca João - BET365',
          description: 'Vencimento: 15/04/2025',
          color: 'orange', // média prioridade
          position: 1,
          attachments: [],
          user_id: userId 
        },
        { 
          id: crypto.randomUUID(),
          column_id: defaultColumns[1].id, // Em Andamento
          content: 'Planejar Estratégia para Betano',
          description: 'Vencimento: 20/04/2025',
          color: 'green', // baixa prioridade
          position: 0,
          attachments: [],
          user_id: userId 
        },
        { 
          id: crypto.randomUUID(),
          column_id: defaultColumns[2].id, // Concluído
          content: 'Atualizar Saldo da Banca Maria - Betano',
          description: 'Vencimento: 05/04/2025',
          color: 'orange', // média prioridade
          position: 0,
          attachments: [],
          user_id: userId 
        }
      ];
      
      for (const card of defaultCards) {
        await supabase.from('organization_cards').insert(card);
      }
      
      setCards(defaultCards);
    } else {
      setColumns(columnsData);
      
      // Fetch cards for this user
      const { data: cardsData, error: cardsError } = await supabase
        .from('organization_cards')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });
      
      if (cardsError) {
        console.error('Error fetching cards:', cardsError);
      } else {
        setCards(cardsData);
      }
    }
    
    setIsLoading(false);
  };

  const handleAddCard = (columnId: string) => {
    // Abrir o modal de criação de card
    setCurrentCard(undefined);
    setIsEditing(false);
    setCurrentColumnId(columnId);
    setModalOpen(true);
  };

  const handleSaveCard = async (cardData: Partial<Card>) => {
    if (!currentUser) return;
    
    if (isEditing && cardData.id) {
      // Atualizando um card existente
      const updatedCard = { ...cardData, updated_at: new Date().toISOString() };
      
      // Otimista: Atualizar na UI primeiro
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === cardData.id ? { ...card, ...updatedCard } : card
        )
      );
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('organization_cards')
        .update(updatedCard)
        .eq('id', cardData.id)
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        // Se houver erro, recarregar os dados
        if (currentUser) {
          fetchUserData(currentUser.id);
        }
      }
    } else {
      // Criando um novo card
      const columnId = cardData.column_id || '';
      
      // Encontre a posição máxima na coluna
      const maxPosition = Math.max(
        0,
        ...cards
          .filter(card => card.column_id === columnId)
          .map(card => card.position + 1)
      );
      
      const timestamp = new Date().toISOString();
      const newCard: Card = {
        id: crypto.randomUUID(),
        column_id: columnId,
        content: cardData.content || 'Nova Tarefa',
        description: cardData.description || '',
        color: cardData.color || 'orange',
        position: maxPosition,
        attachments: [],
        created_at: timestamp,
        updated_at: timestamp,
        user_id: currentUser.id
      };
      
      // Otimista: Adicionar na UI primeiro
      setCards(prevCards => [...prevCards, newCard]);
      
      // Adicionar no banco de dados
      const { error } = await supabase.from('organization_cards').insert(newCard);
      
      if (error) {
        console.error('Erro ao adicionar tarefa:', error);
        // Se houver erro, recarregar os dados
        setCards(prevCards => prevCards.filter(card => card.id !== newCard.id));
        if (currentUser) {
          fetchUserData(currentUser.id);
        }
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentUser) return;
    
    // Primeiro atualize o estado local (otimista)
    setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    
    const { error } = await supabase
      .from('organization_cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', currentUser.id);
      
    if (error) {
      console.error('Erro ao deletar tarefa:', error);
      // Se houver erro, retorne o estado anterior
      if (currentUser) {
        fetchUserData(currentUser.id);
      }
    }
  };

  const handleEditCard = (cardId: string) => {
    const cardToEdit = cards.find(card => card.id === cardId);
    if (cardToEdit) {
      setCurrentCard(cardToEdit);
      setIsEditing(true);
      setModalOpen(true);
    }
  };

  const moveCard = async (cardId: string, targetColumnId: string) => {
    if (!currentUser) return;
    
    // Encontre o card que será movido
    const cardToMove = cards.find(card => card.id === cardId);
    if (!cardToMove) return;
    
    // Calcule a nova posição (final da coluna alvo)
    const maxPosition = Math.max(
      0,
      ...cards
        .filter(card => card.column_id === targetColumnId)
        .map(card => card.position + 1)
    );
    
    // Atualize localmente primeiro
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, column_id: targetColumnId, position: maxPosition } 
          : card
      )
    );
    
    // Atualize no banco de dados
    const { error } = await supabase
      .from('organization_cards')
      .update({ column_id: targetColumnId, position: maxPosition })
      .eq('id', cardId)
      .eq('user_id', currentUser.id);
    
    if (error) {
      console.error('Erro ao mover cartão:', error);
      // Se houver erro, recarregue os dados
      if (currentUser) {
        fetchUserData(currentUser.id);
      }
    }
  };

  // Função para formatar os dados em um formato adequado para exportação
  const prepareDataForExport = () => {
    return cards.map(card => {
      // Encontre a coluna para obter o título
      const column = columns.find(col => col.id === card.column_id);
      const columnTitle = column ? column.title : 'Desconhecido';
      
      // Determina a prioridade com base na cor
      let priority = '';
      switch (card.color) {
        case 'red': priority = 'Alta'; break;
        case 'orange': priority = 'Média'; break;
        case 'green': priority = 'Baixa'; break;
        default: priority = 'Normal';
      }
      
      // Retorna um objeto formatado para exportação
      return {
        'Título': card.content,
        'Descrição': card.description,
        'Status': columnTitle,
        'Prioridade': priority,
        'Data de Criação': new Date(card.created_at).toLocaleDateString(),
        'Última Atualização': new Date(card.updated_at).toLocaleDateString()
      };
    });
  };

  const handleAddColumn = async () => {
    if (!currentUser) return;
    
    console.log("Adding new column..."); // Debug log
    setCurrentColumn(undefined);
    setIsEditingColumn(false);
    setColumnModalOpen(true);

    // Encontre a posição máxima das colunas existentes
    const maxPosition = Math.max(
      0,
      ...columns.map(column => column.position + 1)
    );
    
    // const timestamp = new Date().toISOString();
    // const newColumn: Column = {
    //   id: crypto.randomUUID(),
    //   title: `Nova Coluna`,
    //   position: maxPosition,
    //   created_at: timestamp,
    //   updated_at: timestamp,
    //   user_id: currentUser.id
    // };
    
    // // Otimista: Adicionar na UI primeiro
    // setColumns(prevColumns => [...prevColumns, newColumn]);
    
      // Adicionar no banco de dados
    // const { error } = await supabase.from('organization_columns').insert(newColumn);
    
    // if (error) {
    //   console.error('Erro ao adicionar coluna:', error);
    //   // Se houver erro, recarregar os dados
    //   setColumns(prevColumns => prevColumns.filter(column => column.id !== newColumn.id));
    //   if (currentUser) {
    //     fetchUserData(currentUser.id);
    //   }
    // }
  };

  const handleSaveColumn = async (columnData: Partial<Column>) => {
    if (!currentUser) return;
    
    if (isEditingColumn && columnData.id) {
      // Atualizando uma coluna existente
      const updatedColumn = { ...columnData, updated_at: new Date().toISOString() };
      
      // Otimista: Atualizar na UI primeiro
      setColumns(prevColumns => 
        prevColumns.map(column => 
          column.id === columnData.id ? { ...column, ...updatedColumn } : column
        )
      );
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('organization_columns')
        .update(updatedColumn)
        .eq('id', columnData.id)
        .eq('user_id', currentUser.id);
      
      if (error) {
        console.error('Erro ao atualizar coluna:', error);
        // Se houver erro, recarregar os dados
        if (currentUser) {
          fetchUserData(currentUser.id);
        }
      }
    } else {
      // Criando uma nova coluna
      // Encontre a posição máxima das colunas existentes
      const maxPosition = Math.max(
        0,
        ...columns.map(column => column.position + 1)
      );
      
      const timestamp = new Date().toISOString();
      const newColumn: Column = {
        id: crypto.randomUUID(),
        title: columnData.title || 'Nova Coluna',
        position: maxPosition,
        created_at: timestamp,
        updated_at: timestamp,
        user_id: currentUser.id
      };
      
      // Otimista: Adicionar na UI primeiro
      setColumns(prevColumns => [...prevColumns, newColumn]);
      
      // Adicionar no banco de dados
      const { error } = await supabase.from('organization_columns').insert(newColumn);
      
      if (error) {
        console.error('Erro ao adicionar coluna:', error);
        // Se houver erro, recarregar os dados
        setColumns(prevColumns => prevColumns.filter(column => column.id !== newColumn.id));
        if (currentUser) {
          fetchUserData(currentUser.id);
        }
      }
    }
  };

  const handleEditColumn = (columnId: string) => {
    const columnToEdit = columns.find(column => column.id === columnId);
    if (columnToEdit) {
      setCurrentColumn(columnToEdit);
      setIsEditingColumn(true);
      setColumnModalOpen(true);
    }
  };
  
  const handleDeleteColumn = async (columnId: string) => {
    if (!currentUser) return;
    
    // Verificar se há cartões nesta coluna
    const cardsInColumn = cards.filter(card => card.column_id === columnId);
  
    if (cardsInColumn.length > 0) {
      // Mostrar alerta de confirmação (você pode implementar um modal para isso)
      if (!window.confirm(`Esta coluna contém ${cardsInColumn.length} tarefa(s). Deseja excluir a coluna e todas as suas tarefas?`)) {
        return;
      }
      
      // Excluir cartões primeiro (otimista)
      setCards(prevCards => prevCards.filter(card => card.column_id !== columnId));
      
      // Excluir cartões no banco de dados
      const { error: cardsError } = await supabase
        .from('organization_cards')
        .delete()
        .eq('column_id', columnId)
        .eq('user_id', currentUser.id);
        
      if (cardsError) {
        console.error('Erro ao excluir cartões da coluna:', cardsError);
        if (currentUser) {
          fetchUserData(currentUser.id);
        }
        return;
      }
    }
    
    // Primeiro atualize o estado local (otimista)
    setColumns(prevColumns => prevColumns.filter(column => column.id !== columnId));
    
    const { error } = await supabase
      .from('organization_columns')
      .delete()
      .eq('id', columnId)
      .eq('user_id', currentUser.id);
      
    if (error) {
      console.error('Erro ao excluir coluna:', error);
      // Se houver erro, retorne o estado anterior
      if (currentUser) {
        fetchUserData(currentUser.id);
      }
    }
  };

  // Função para exportar para Excel
  const exportToExcel = () => {
    // Prepara os dados para exportação
    const data = prepareDataForExport();
    
    // Cria uma nova planilha
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tarefas");
    
    // Ajusta largura das colunas
    const colWidths = [
      { wch: 30 }, // Título
      { wch: 40 }, // Descrição
      { wch: 15 }, // Status
      { wch: 10 }, // Prioridade
      { wch: 15 }, // Data de Criação
      { wch: 15 }, // Última Atualização
    ];
    worksheet['!cols'] = colWidths;
    
    // Gera o arquivo e faz o download
    const hoje = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `tarefas_${hoje}.xlsx`);
    
    console.log('Exportação para Excel concluída');
  };

  // Função para exportar para PDF
  const exportToPDF = () => {
    // Prepara os dados para exportação
    const data = prepareDataForExport();
    
    // Cria um novo documento PDF
    const doc = new jsPDF();
    
    // Adiciona título
    doc.setFontSize(18);
    doc.text("Relatório de Tarefas", 14, 22);
    
    // Adiciona data de geração
    doc.setFontSize(11);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Adiciona dados do usuário
    if (currentUser && currentUser.email) {
      doc.text(`Usuário: ${currentUser.email}`, 14, 38);
    }
    
    // Adiciona métricas em um box
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 44, 182, 25, 'F');
    doc.setFontSize(12);
    doc.text("Resumo:", 16, 52);
    doc.setFontSize(10);
    doc.text(`Tarefas Pendentes: ${totalPendentes}`, 16, 58);
    doc.text(`Tarefas Atrasadas: ${tarefasAtrasadas}`, 80, 58);
    doc.text(`Tarefas Concluídas: ${tarefasConcluidas}`, 144, 58);
    doc.text(`Tarefas de Emprestadores: ${tarefasEmprestadores}`, 16, 64);
    
    // Prepara cabeçalhos e dados para a tabela
    const tableColumn = ["Título", "Descrição", "Status", "Prioridade", "Criação", "Atualização"];
    const tableRows = data.map(item => [
      item['Título'],
      item['Descrição'],
      item['Status'],
      item['Prioridade'],
      item['Data de Criação'],
      item['Última Atualização']
    ]);
    
    // Adiciona a tabela
    doc.autoTable({
      startY: 72,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 70 }
    });
    
    // Salva o arquivo PDF
    const hoje = new Date().toISOString().split('T')[0];
    doc.save(`tarefas_${hoje}.pdf`);
    
    console.log('Exportação para PDF concluída');
  };

  const getCardsByColumnId = (columnId: string) => {
    return cards
      .filter(card => card.column_id === columnId)
      .sort((a, b) => a.position - b.position);
  };

  const getPriorityClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-600';
      case 'orange': return 'border-orange-400';
      case 'green': return 'border-green-600';
      default: return 'border-gray-400';
    }
  };

  const getPriorityText = (color: string) => {
    switch (color) {
      case 'red': return 'Alta';
      case 'orange': return 'Média';
      case 'green': return 'Baixa';
      default: return 'Normal';
    }
  };
  const { darkMode } = useTheme();

  if (!currentUser) {
    return (
      <div className={`flex-1 p-8 flex justify-center items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Você precisa estar logado para acessar suas tarefas</h2>
          <p>Faça login para visualizar e gerenciar suas tarefas</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className={`flex-1 p-8 flex justify-center items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>Carregando...</div>;
  }
  
  return (
    <div className={`flex-1 p-8 pt-20 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Adicione o modal de coluna aqui */}
      <ColumnModal 
        isOpen={columnModalOpen}
        onClose={() => setColumnModalOpen(false)}
        onSave={handleSaveColumn}
        column={currentColumn}
        isEditing={isEditingColumn}
        darkMode={darkMode}
      />
      
      {/* Modal para edição/criação de cards (já existente) */}
      <CardModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCard}
        card={currentCard}
        isEditing={isEditing}
        columnId={currentColumnId}
        darkMode={darkMode}
      />
  
      {/* Header */}
      <div className={`fixed top-0 right-0 left-64 h-16 ${darkMode ? 'bg-gray-800 shadow-lg' : 'bg-white shadow-sm'} z-40 transition-all duration-300`}>
        <div className="flex justify-between items-center h-full px-8">
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Gerenciamento de Tarefas</div>
          <div className="flex items-center gap-4">
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors`}>
              <Bell className="w-5 h-5" />
            </button>
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors`}>
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded-full transition-colors`}>
              <Settings className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-2 ml-2 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} p-2 rounded-lg transition-colors`}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Meu perfil</span>
            </div>
          </div>
        </div>
      </div>
  
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 0v12h12V3H5z" clipRule="evenodd" />
              <path d="M6 6h2v2H6V6zm0 4h8v1H6v-1zm0 3h8v1H6v-1zm8-6h-4v1h4V7z" />
            </svg>
            Exportar para Excel
          </button>
        </div>
  
        <h2 className="text-xl font-bold mb-4">Indicadores Gerais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Indicadores */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg shadow-sm`}>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Total de Tarefas Pendentes</div>
            <div className="text-center text-2xl font-bold">{totalPendentes}</div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg shadow-sm`}>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Tarefas Atrasadas</div>
            <div className="text-center text-2xl font-bold text-orange-500">{tarefasAtrasadas}</div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg shadow-sm`}>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Tarefas Concluídas (Últimos 30 Dias)</div>
            <div className="text-center text-2xl font-bold">{tarefasConcluidas}</div>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg shadow-sm`}>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Tarefas de Emprestadores Pendentes</div>
            <div className="text-center text-2xl font-bold">{tarefasEmprestadores}</div>
          </div>
        </div>
      </div>
  
      <h2 className="text-xl font-bold mb-4">Minhas Tarefas</h2>
  
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${activeFilter === 'todas-prioridades' 
              ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') 
              : (darkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
            onClick={() => setActiveFilter('todas-prioridades')}
          >
            Todas as Prioridades
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${activeFilter === 'todos-status' 
              ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') 
              : (darkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
            onClick={() => setActiveFilter('todos-status')}
          >
            Todos os Status
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${activeFilter === 'todas-datas' 
              ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') 
              : (darkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
            onClick={() => setActiveFilter('todas-datas')}
          >
            Todas as Datas
          </button>
        </div>
        
        {tarefasAtrasadas > 0 && (
          <div className="bg-orange-500 text-white p-4 rounded-lg mb-4">
            Alerta: {tarefasAtrasadas} tarefas atrasadas
          </div>
        )}
      </div>
  
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Minhas Tarefas</h2>
        <button 
          onClick={handleAddColumn}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Coluna
        </button>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(column => (
          <div key={column.id} className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg shadow`}>
            <div className="flex items-center justify-between mb-4 p-4">
              <h3 className="font-bold text-lg">{column.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditColumn(column.id)}
                  className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAddCard(column.id)}
                  className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteColumn(column.id)}
                  className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="">
              {getCardsByColumnId(column.id).map(card => (
                <div 
                  key={card.id} 
                  className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow-sm border-l-4 ${getPriorityClass(card.color)}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('cardId', card.id)}
                >
                  <h4 className="font-bold">{card.content}</h4>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                    {card.description}
                  </div>
                  <div className="text-sm mt-1">
                    Prioridade: <span className="font-medium">{getPriorityText(card.color)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleEditCard(card.id)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Drop Zone */}
              <div 
                className={`h-20 border-2 border-dashed ${darkMode ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400'} rounded-lg flex items-center justify-center`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const cardId = e.dataTransfer.getData('cardId');
                  moveCard(cardId, column.id);
                }}
              >
                Arraste tarefas para aqui
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };
  
  export default Organization;