import React, { useState } from 'react';
import { Calculator, Percent, User, Bell, HelpCircle, Settings } from 'lucide-react';

const OddsBoostCalculator = () => {
  const [numHouses, setNumHouses] = useState(2);
  const [houses, setHouses] = useState<Array<{
    odd: string;
    boost: string;
    stake: string;
    commission: boolean;
    commissionValue: string;
    freebet: boolean;
    fixedStake: boolean;
  }>>(Array(5).fill({
    odd: '',
    boost: '',
    stake: '',
    commission: false,
    commissionValue: '0',
    freebet: false,
    fixedStake: false
  }));
  const baseStake = 100; // Base stake for first house

  const calculateFinalOdd = (odd: string, boost: string) => {
    const oddValue = parseFloat(odd) || 0;
    const boostValue = parseFloat(boost) || 0;
    return oddValue + ((oddValue - 1) * boostValue / 100);
  };

  const applyCommission = (stake: number, commission: boolean, commissionValue: string) => {
    if (!commission) return stake;
    const commissionPercent = parseFloat(commissionValue) || 0;
    return stake * (1 - commissionPercent / 100);
  };

  const calculateStake = (odd: string, boost: string, index: number) => {
    if (!odd || !boost) return '0';
    if (index === 0) {
      // For first house, apply commission to base stake if enabled
      const house = houses[0];
      if (house.commission) {
        const commissionPercent = parseFloat(house.commissionValue) || 0;
        return (baseStake * (1 - commissionPercent / 100)).toFixed(2);
      }
      return baseStake.toString();
    }
    
    const finalOdd = calculateFinalOdd(odd, boost);
    if (finalOdd <= 0) return '0';
    
    // Calculate stake needed for equal profit
    const firstHouseFinalOdd = calculateFinalOdd(houses[0].odd, houses[0].boost);
    const firstHouseStake = parseFloat(houses[0].stake) || baseStake;
    let stake = (firstHouseStake / finalOdd) * firstHouseFinalOdd;
    
    // Apply commission if enabled
    if (houses[index].commission) {
      const commissionPercent = parseFloat(houses[index].commissionValue) || 0;
      stake *= (1 - commissionPercent / 100);
    }
    
    return stake.toFixed(2);
  };

  const calculateResults = () => {
    let totalStake = 0;
    houses.slice(0, numHouses).forEach(house => {
      const rawStake = parseFloat(house.stake) || 0;
      totalStake += rawStake;
    });

    const results = houses.slice(0, numHouses).map((house, index) => {
      const stake = parseFloat(house.stake) || 0;
      const finalOdd = calculateFinalOdd(house.odd, house.boost);
      let profit = (stake * finalOdd) - totalStake;
      
      // Apply commission to profit if enabled
      if (house.commission) {
        const commissionPercent = parseFloat(house.commissionValue) || 0;
        profit *= (1 - commissionPercent / 100);
      }

      return { stake, profit };
    });

    // Get the profit from any result since they should all be equal
    const profit = results[0]?.profit || 0;

    // Calculate ROI based on total stakes
    const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;
    return { results, totalStake, roi };
  };

  const handleInputChange = (index: number, field: keyof typeof houses[0], value: string) => {
    const newHouses = [...houses];
    newHouses[index] = { ...newHouses[index], [field]: value };

    // Recalculate stakes when odds, boost, or commission changes
    if (field === 'odd' || field === 'boost' || field === 'commission' || field === 'commissionValue') {
      // Set initial stake for first house
      newHouses[0].stake = calculateStake(newHouses[0].odd, newHouses[0].boost, 0);
      
      // Recalculate stakes for other houses
      for (let i = 1; i < numHouses; i++) {
        if (!newHouses[i].fixedStake) {
          newHouses[i].stake = calculateStake(newHouses[i].odd, newHouses[i].boost, i);
        }
      }
    }
    
    setHouses(newHouses);
  };

  const results = calculateResults();

  return (
    <div className="flex-1 p-8 pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Calculadora de Aumento 25%</div>
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
      
      

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Configurações</h2>
        
        <div className="mb-6">
          <label className="text-gray-700 font-medium mb-2 block">Número de Casas:</label>
          <div className="flex gap-4">
            {[2, 3, 4, 5].map(num => (
              <label key={num} className="flex items-center">
                <input
                  type="radio"
                  name="houses"
                  value={num}
                  checked={numHouses === num}
                  onChange={() => setNumHouses(num)}
                  className="mr-2 text-blue-600"
                />
                <span className="text-gray-700">{num} Casas</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {houses.slice(0, numHouses).map((house, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Casa {index + 1}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odd {index + 1}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={house.odd}
                  onChange={(e) => handleInputChange(index, 'odd', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aumento (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={house.boost}
                    onChange={(e) => handleInputChange(index, 'boost', e.target.value)}
                    className="w-full p-2 pr-8 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <div className="mt-1 text-sm text-blue-600">
                  Odd Final: {calculateFinalOdd(house.odd, house.boost).toFixed(2)}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stake {index + 1}
                </label>
                <div className="space-y-2">
                  <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={house.stake}
                    onChange={(e) => handleInputChange(index, 'stake', e.target.value)}
                    readOnly={index > 0 && !house.fixedStake}
                    className="w-full p-2 pl-8 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={house.commission}
                        onChange={(e) => handleInputChange(index, 'commission', e.target.checked.toString())}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Comissão</span>
                    </label>
                    
                    {house.commission && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={house.commissionValue}
                          onChange={(e) => handleInputChange(index, 'commissionValue', e.target.value)}
                          className="w-20 p-1 border rounded"
                          placeholder="%"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={house.freebet}
                        onChange={(e) => handleInputChange(index, 'freebet', e.target.checked.toString())}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Freebet</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={house.fixedStake}
                        onChange={(e) => handleInputChange(index, 'fixedStake', e.target.checked.toString())}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Stake Fixa</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Resultados
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Casa</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stake</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">Casa {index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {result.stake.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      result.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Stake Total (Risco):</span>
              <span className="font-semibold text-gray-900">
                {results.totalStake.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">ROI:</span>
              <span className={`font-semibold text-xl ${
                results.roi >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {results.roi.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OddsBoostCalculator;