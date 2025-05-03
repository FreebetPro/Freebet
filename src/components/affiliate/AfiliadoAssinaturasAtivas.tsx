import React, { useState } from 'react';
import { Filter, Download, Search, ExternalLink, Phone } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface Subscription {
  id: string;
  date: string;
  time: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  plan: {
    name: string;
    price: number;
    commission: number;
  };
  expiresAt: string;
  status: 'active' | 'expiring-soon' | 'expired';
}

const AfiliadoAssinaturasAtivas: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions] = useState<Subscription[]>([
    {
      id: '1',
      date: '2025-03-22',
      time: '14:30:22',
      customer: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '5511999887766'
      },
      plan: {
        name: 'Plano Premium',
        price: 99.90,
        commission: 29.97
      },
      expiresAt: '2025-04-22',
      status: 'active'
    },
    {
      id: '2',
      date: '2025-03-21',
      time: '09:15:00',
      customer: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '5511988776655'
      },
      plan: {
        name: 'Plano Basic',
        price: 49.90,
        commission: 14.97
      },
      expiresAt: '2025-04-21',
      status: 'expiring-soon'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'expiring-soon':
        return 'Vencimento Próximo';
      case 'expired':
        return 'Vencido';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const handleWhatsApp = (phone: string) => {
    const message = encodeURIComponent('Olá! Vim pelo FreeBet Pro.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.customer.phone.includes(searchTerm)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Planos Ativos</h1>
        <p className="text-gray-600">Gerencie suas assinaturas ativas e acompanhe suas comissões</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar assinatura..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
          <button
            onClick={() => {/* Implement export logic */}}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total de Assinaturas</h3>
            <p className="text-2xl font-bold text-blue-900 mt-1">{subscriptions.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Comissões do Mês</h3>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {formatCurrency(subscriptions.reduce((sum, sub) => sum + sub.plan.commission, 0))}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Média por Assinatura</h3>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {formatCurrency(subscriptions.reduce((sum, sub) => sum + sub.plan.commission, 0) / subscriptions.length)}
            </p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(subscription.date)}</div>
                    <div className="text-xs text-gray-500">{subscription.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{subscription.customer.name}</div>
                    <div className="text-sm text-gray-500">{subscription.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subscription.plan.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(subscription.plan.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{formatCurrency(subscription.plan.commission)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(subscription.expiresAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                      {getStatusText(subscription.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleWhatsApp(subscription.customer.phone)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${subscription.customer.email}`, '_blank')}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Email"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AfiliadoAssinaturasAtivas;