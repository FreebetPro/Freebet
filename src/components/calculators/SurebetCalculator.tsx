import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, DollarSign, User, Bell, HelpCircle, Settings } from 'lucide-react';

interface Bet {
  odd: number;
  stake: number;
}

const SurebetCalculator: React.FC = () => {
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const [bets, setBets] = useState<Array<{ odd: string; stake: string }>>([
    { odd: '', stake: '' },
    { odd: '', stake: '' }
  ]);
  const [totalBet, setTotalBet] = useState('');
  const [result, setResult] = useState<{
    percentages: number[];
    totalStake: number;
    profit: number;
    finalResult: number;
    resultPercentage: number;
  } | null>(null);

  const addBet = () => {
    setBets([...bets, { odd: '', stake: '' }]);
  };

  const removeBet = (index: number) => {
    if (bets.length <= 2) return;
    const newBets = bets.filter((_, i) => i !== index);
    setBets(newBets);
    updateTotalBet(newBets);
  };

  const handleBetChange = (index: number, field: 'odd' | 'stake', value: string) => {
    const newBets = bets.map((bet, i) => {
      if (i === index) {
        return { ...bet, [field]: value };
      }
      return bet;
    });
    setBets(newBets);
    if (field === 'stake') {
      updateTotalBet(newBets);
    }
  };

  const updateTotalBet = (currentBets: Array<{ odd: string; stake: string }>) => {
    const total = currentBets.reduce((sum, bet) => sum + (parseFloat(bet.stake) || 0), 0);
    setTotalBet(total.toFixed(2));
  };

  const distributeTotalBet = () => {
    if (!totalBet || parseFloat(totalBet) <= 0) {
      alert('Por favor, insira um valor válido para a Aposta Total.');
      return;
    }

    const odds = bets.map(bet => parseFloat(bet.odd));
    if (odds.some(odd => isNaN(odd) || odd <= 1)) {
      alert('Por favor, insira odds válidas (maiores que 1) para todos os campos.');
      return;
    }

    const total = parseFloat(totalBet);
    const totalInverseOdds = odds.reduce((sum, odd) => sum + 1 / odd, 0);
    
    const newBets = bets.map((bet, index) => ({
      ...bet,
      stake: ((total * (1 / odds[index])) / totalInverseOdds).toFixed(2)
    }));
    
    setBets(newBets);
  };

  const calculateSurebet = () => {
    const validBets = bets.map(bet => ({
      odd: parseFloat(bet.odd),
      stake: parseFloat(bet.stake)
    })).filter(bet => !isNaN(bet.odd) && !isNaN(bet.stake) && bet.odd > 0 && bet.stake > 0);

    if (validBets.length < 2) {
      alert('Por favor, insira pelo menos duas apostas válidas.');
      return;
    }

    const totalStake = validBets.reduce((sum, bet) => sum + bet.stake, 0);
    const percentages = validBets.map(bet => (1 / bet.odd) * 100);
    const totalPercentage = percentages.reduce((sum, percentage) => sum + percentage, 0);
    const profit = validBets.reduce((sum, bet) => sum + (bet.stake * bet.odd), 0) - totalStake;
    const resultPercentage = (profit / totalStake) * 100;

    setResult({
      percentages,
      totalStake,
      profit,
      finalResult: totalPercentage,
      resultPercentage
    });
  };

  return (
    <div className="p-6 pt-20">
      {/* Header */}
      <div className="fixed top-0 right-0 left-64 h-16 bg-white shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center h-full px-8">
          <div className="text-xl font-bold text-gray-800">Calculadora Surebet</div>
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
        <div className="space-y-4">
          {bets.map((bet, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odd {index + 1}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={bet.odd}
                  onChange={(e) => handleBetChange(index, 'odd', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Digite a odd"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stake {index + 1}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bet.stake}
                  onChange={(e) => handleBetChange(index, 'stake', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Digite o valor"
                />
              </div>
              {index >= 2 && (
                <button
                  onClick={() => removeBet(index)}
                  className="mt-6 p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={addBet}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Aposta
            </button>

            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aposta Total
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalBet}
                    onChange={(e) => setTotalBet(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md pl-8"
                    placeholder="0.00"
                  />
                  <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                </div>
              </div>
              <button
                onClick={distributeTotalBet}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Distribuir
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={calculateSurebet}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calcular Surebet
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Resultados:</h3>
              <div className="space-y-2">
                <p>Stake Total: R$ {result.totalStake.toFixed(2)}</p>
                <p>Lucro: R$ {result.profit.toFixed(2)}</p>
                <p>Porcentagem Total: {result.finalResult.toFixed(2)}%</p>
                <p>ROI: {result.resultPercentage.toFixed(2)}%</p>
                <div>
                  <p className="font-medium mb-1">Porcentagens por aposta:</p>
                  <ul className="list-disc list-inside">
                    {result.percentages.map((percentage, index) => (
                      <li key={index}>Aposta {index + 1}: {percentage.toFixed(2)}%</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurebetCalculator;