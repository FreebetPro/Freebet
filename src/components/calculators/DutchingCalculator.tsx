import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, AlertTriangle, User, Bell, HelpCircle, Settings } from 'lucide-react';

interface Bet {
  odd: number;
  stake: number;
}

const DutchingCalculator: React.FC = () => {
  const [totalStake, setTotalStake] = useState<string>('');
  const [commission, setCommission] = useState<string>('0');
  const [roundTo, setRoundTo] = useState<string>('0.01');
  const [odds, setOdds] = useState<string[]>(['', '']);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    percentages: number[];
    stakes: number[];
    profit: number;
    roi: number;
    bookmakerMargin?: number;
    outcomes?: number[];
  } | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const addOddField = () => {
    setOdds([...odds, '']);
  };

  const removeOddField = (index: number) => {
    if (odds.length <= 2) return;
    const newOdds = odds.filter((_, i) => i !== index);
    setOdds(newOdds);
  };

  const updateOdd = (index: number, value: string) => {
    const newOdds = [...odds];
    newOdds[index] = value;
    setOdds(newOdds);
  };

  const calculateDutching = () => {
    setError(null);
    setResult(null);

    const total = parseFloat(totalStake);
    const comm = parseFloat(commission) / 100;
    const round = parseFloat(roundTo);

    // Validate inputs
    if (!total || isNaN(total)) {
      setError('Por favor, insira um montante total válido.');
      return;
    }

    const oddValues = odds.map(odd => parseFloat(odd)).filter(odd => !isNaN(odd));
    if (oddValues.length < 2) {
      setError('Por favor, insira pelo menos duas odds válidas.');
      return;
    }

    // Calculate adjusted odds and probabilities
    const adjustedOdds = oddValues.map(odd => odd * (1 - comm));
    const inverses = adjustedOdds.map(odd => 1 / odd);
    const surebet = inverses.reduce((sum, inv) => sum + inv, 0);

    // Calculate bookmaker margin
    const bookmakerMargin = (1 - (1 / surebet)) * 100;

    // Calculate stakes and percentages
    const percentages = inverses.map(inv => (inv / surebet) * 100);
    const stakes = percentages.map(percentage => 
      Math.round((percentage / 100) * total / round) * round
    );
    const actualTotal = stakes.reduce((sum, stake) => sum + stake, 0);

    // Calculate outcomes
    const outcomes = adjustedOdds.map((odd, index) => 
      stakes[index] * odd - actualTotal
    );
    const worstOutcome = Math.min(...outcomes);

    // Check if profitable
    if (surebet >= 1) {
      setError(`
        <div class="space-y-2">
          <p>Atenção: Não é possível garantir lucro com essas odds e comissão.</p>
          <p>Margem do bookmaker: ${bookmakerMargin.toFixed(2)}%</p>
          <p>Prejuízo máximo potencial: ${formatCurrency(-worstOutcome)}</p>
          <p>A soma dos inversos das odds ajustadas é ${surebet.toFixed(4)}</p>
          
          <h6 class="font-semibold mt-4">Detalhes dos cenários:</h6>
          <ul class="list-disc pl-5 space-y-1">
            ${outcomes.map((outcome, index) => `
              <li>Casa ${index + 1}: 
                ${outcome >= 0 
                  ? `Lucro de ${formatCurrency(outcome)}` 
                  : `Prejuízo de ${formatCurrency(-outcome)}`}
              </li>
            `).join('')}
          </ul>

          <h6 class="font-semibold mt-4">Sugestões:</h6>
          <ul class="list-disc pl-5 space-y-1">
            <li>Procure odds melhores em outras casas de apostas</li>
            <li>Verifique se a comissão está correta</li>
            <li>Considere apostar em menos resultados</li>
          </ul>
        </div>
      `);
      return;
    }

    // Calculate profit and ROI
    const profit = (stakes[0] * adjustedOdds[0]) - actualTotal;
    const roi = (profit / actualTotal) * 100;

    setResult({
      percentages,
      stakes,
      profit,
      roi,
      bookmakerMargin,
      outcomes
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
          <div className="text-xl font-bold text-gray-800">Calculadora Dutching</div>
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
      
      <div className="mb-6">
        <p className="text-gray-600">Calcule apostas dutching para múltiplos resultados, considerando comissões e arredondamento.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* Odds Inputs */}
          <div className="space-y-4">
            {odds.map((odd, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Casa {index + 1}
                  </label>
                  <input
                    type="number"
                    value={odd}
                    onChange={(e) => updateOdd(index, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2.00"
                    step="0.01"
                    min="1"
                  />
                </div>
                {index >= 2 && (
                  <button
                    onClick={() => removeOddField(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Remover odd"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addOddField}
              className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar mais uma odd
            </button>
          </div>

          {/* Total Stake Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montante Total (BRL)
            </label>
            <input
              type="number"
              value={totalStake}
              onChange={(e) => setTotalStake(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Commission Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comissão do Bookmaker (%)
            </label>
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Round To Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arredondar apostas para (BRL)
            </label>
            <input
              type="number"
              value={roundTo}
              onChange={(e) => setRoundTo(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.01"
              step="0.01"
              min="0.01"
            />
          </div>

          <button
            onClick={calculateDutching}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Calcular
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Atenção</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: error }} />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Percentages */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Percentual de Aposta</h4>
                  <div className="space-y-2">
                    {result.percentages.map((percentage, index) => (
                      <div key={index} className="flex justify-between">
                        <span>Casa {index + 1}</span>
                        <span className="font-medium">{percentage.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stakes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Montantes Apostados</h4>
                  <div className="space-y-2">
                    {result.stakes.map((stake, index) => (
                      <div key={index} className="flex justify-between">
                        <span>Casa {index + 1}</span>
                        <span className="font-medium">{formatCurrency(stake)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profit and ROI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-600 mb-1">Lucro Garantido</h4>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(result.profit)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-600 mb-1">ROI</h4>
                  <p className="text-xl font-bold text-blue-600">{result.roi.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DutchingCalculator;