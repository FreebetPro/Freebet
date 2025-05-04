import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  ShoppingCart, 
  Clock, 
  Wallet, 
  TrendingUp,
  Copy,
  BanknoteIcon
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface DashboardProps {
  onOpenSaqueModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onOpenSaqueModal }) => {
  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
    datasets: [{
      label: 'Ganhos Mensais',
      data: [1200, 1900, 2100, 2800, 2400, 3100, 3800],
      borderColor: '#2563eb',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://www.freebet.pro.br/aff1234");
    alert("Link copiado para a área de transferência!");
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel de Afiliado</h1>
          <p className="text-blue-100">Bem-vindo de volta, [Nome do Afiliado]</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Sales Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Vendas Realizadas</p>
                <p className="text-2xl font-bold text-gray-900">150</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Commissions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Comissões Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">R$ 2.500,00</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Available Balance */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Saldo Disponível</p>
                <p className="text-2xl font-bold text-gray-900">R$ 1.200,00</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <button 
              onClick={onOpenSaqueModal}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <BanknoteIcon className="w-4 h-4" />
              Solicitar Saque
            </button>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">18.5%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate Link Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Seu Link de Afiliado</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value="https://www.freebet.pro.br/aff1234"
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Link
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Use este link para compartilhar e ganhar comissões em todas as vendas.
          </p>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Desempenho de Vendas</h2>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;