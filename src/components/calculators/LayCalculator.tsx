import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, User, Bell, HelpCircle, Settings } from 'lucide-react';

const LayCalculator: React.FC = () => {
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const [formData, setFormData] = useState({
    backOdds: '',
    backStake: '',
    useFreebet: false,
    layOdds: '',
    exchange: '6.5'
  });

  const [result, setResult] = useState<{
    layStake: number | null;
    liability: number | null;
    backResult: number | null;
    layResult: number | null;
  } | null>(null);

  const exchanges = [
    { value: '6.5', label: 'Betfair (6.5%)' },
    { value: '5.6', label: 'Bolsa de Aposta (5.6%)' },
    { value: '3.25', label: 'Betbra (3.25%)' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const calculate = () => {
    const backOdds = parseFloat(formData.backOdds);
    const backStake = parseFloat(formData.backStake);
    const layOdds = parseFloat(formData.layOdds);
    const commission = parseFloat(formData.exchange) / 100;
    
    if (!backOdds || !backStake || !layOdds) return;

    let layStake, liability, backResult, layResult;

    if (formData.useFreebet) {
      layStake = (backStake * (backOdds - 1)) / (layOdds - commission);
      backResult = (backOdds - 1) * backStake - layStake * (layOdds - 1);
    } else {
      layStake = (backStake * backOdds) / (layOdds - commission);
      backResult = (backOdds * backStake) - backStake - layStake * (layOdds - 1);
    }

    liability = layStake * (layOdds - 1);
    layResult = backResult;

    setResult({
      layStake,
      liability,
      backResult,
      layResult
    });
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Calculadora Lay</div>
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
      
      

      <div className="bg-white rounded-lg shadow p-6">
        {/* Back Bet Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Aposta Back</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odd Back
              </label>
              <input
                type="number"
                name="backOdds"
                value={formData.backOdds}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="2.00"
                step="0.01"
                min="1"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="useFreebet"
                checked={formData.useFreebet}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Usar Freebet
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-600 mb-1">
                Valor da Aposta (BRL)
              </label>
              <input
                type="number"
                name="backStake"
                value={formData.backStake}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Lay Bet Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Aposta Lay</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odd Lay
              </label>
              <input
                type="number"
                name="layOdds"
                value={formData.layOdds}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="2.00"
                step="0.01"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exchange
              </label>
              <select
                name="exchange"
                value={formData.exchange}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {exchanges.map(exchange => (
                  <option key={exchange.value} value={exchange.value}>
                    {exchange.label}
                  </option>
                ))}
              </select>
            </div>

            {result && (
              <>
                <div>
                  <label className="block text-sm font-medium text-green-600 mb-1">
                    Valor de Aposta Lay (BRL)
                  </label>
                  <input
                    type="text"
                    value={result.layStake ? formatCurrency(result.layStake) : ''}
                    className="w-full p-2 border rounded-md bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saldo Necessário (BRL)
                  </label>
                  <input
                    type="text"
                    value={result.liability ? formatCurrency(result.liability) : ''}
                    className="w-full p-2 border rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Lucro / Prejuízo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado na Casa
                </label>
                <input
                  type="text"
                  value={result.backResult ? formatCurrency(result.backResult) : ''}
                  className="w-full p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado na Exchange
                </label>
                <input
                  type="text"
                  value={result.layResult ? formatCurrency(result.layResult) : ''}
                  className="w-full p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={calculate}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Calcular
        </button>
      </div>
    </div>
  );
};

export default LayCalculator;