import React, { useState, useEffect } from 'react';
import { 
  Clipboard, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  User, 
  Bell, 
  HelpCircle, 
  Settings,
  Calendar,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LenderTaskModal from '../../components/LenderTaskModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface LenderTask {
  id: string;
  lender_id: string;
  title: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  emprestador?: {
    id: string;
    email: string;
    account_id: string;
    account?: {
      name: string;
      email: string;
    };
  };
}

const LenderTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<LenderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
  
      // First, fetch all tasks with emprestador data in a single query
      const { data: tasksData, error: tasksError } = await supabase
        .from('lender_tasks')
        .select(`
          *,
          emprestador:lender_id (
            id,
            email,
            account_id,
            account:fk_account (
              name,
              email1
            )
          )
        `)
        .order('created_at', { ascending: false });
  
      if (tasksError) throw tasksError;
  
      // Log the fetched data
      console.log('Fetched tasks data:', tasksData);
  
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível carregar as tarefas. Tente novamente mais tarde.'
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTasks();
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'completed' | 'failed') => {
    try {
      const { error } = await supabase
        .from('lender_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      MySwal.fire({
        icon: 'success',
        title: 'Status atualizado',
        text: 'O status da tarefa foi atualizado com sucesso!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível atualizar o status da tarefa. Tente novamente.'
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await MySwal.fire({
      title: 'Tem certeza?',
      text: "Esta ação não pode ser revertida!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('lender_tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;

        // Update local state
        setTasks(tasks.filter(task => task.id !== taskId));

        MySwal.fire({
          icon: 'success',
          title: 'Excluída!',
          text: 'A tarefa foi excluída com sucesso.',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível excluir a tarefa. Tente novamente.'
        });
      }
    }
  };

  const handleModalSuccess = (message: string) => {
    MySwal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: message,
      showConfirmButton: false,
      timer: 2000
    });
    fetchTasks();
  };

  const handleModalError = (message: string) => {
    MySwal.fire({
      icon: 'error',
      title: 'Erro',
      text: message
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Concluída
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Falhou
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return dateString;
    }
  };

  // Filter tasks based on search term and selected status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.emprestador?.account?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.emprestador?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus ? task.status === selectedStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Tarefas Emprestador</div>
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
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título ou emprestador..."
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
              <option value="pending">Pendente</option>
              <option value="completed">Concluída</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
          <div className="flex gap-2">

            <button
              onClick={() => {/* Implement export */}}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma tarefa encontrada</h3>
            <p className="mt-2 text-gray-500">
              Não há tarefas para exibir. Crie uma nova tarefa para começar.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emprestador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.emprestador ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.emprestador.account?.name || 'Nome não disponível'}
                          </div>
                          <div className="text-xs text-gray-500">{task.emprestador.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500" title={new Date(task.created_at).toLocaleString()}>
                        {formatDate(task.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {/* <div className="relative inline-block text-left">
                          <div>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                              id={`options-menu-${task.id}`}
                              aria-expanded="true"
                              aria-haspopup="true"
                              onClick={() => {
                                // Toggle dropdown menu
                              }}
                            >
                              Ações
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </button>
                          </div>
                          {/* Dropdown menu would go here */}
                       
                        
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'completed')}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Marcar como concluída"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Excluir tarefa"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredTasks.length)} de {filteredTasks.length} registros
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border rounded p-1 text-sm"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <div className="flex">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border ${
                        currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <LenderTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
      />
    </div>
  );
};

export default LenderTasksPage;