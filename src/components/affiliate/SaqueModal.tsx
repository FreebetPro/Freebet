import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SaqueModalProps {
  onClose: () => void;
}

const SaqueModal: React.FC<SaqueModalProps> = ({ onClose }) => {
  const [valorSaque, setValorSaque] = useState('');

  const handleSaque = () => {
    const valor = parseFloat(valorSaque);
    const saldoDisponivel = 1200.00;
    const saqueMinimo = 50.00;
    const taxa = 2.00;

    if (isNaN(valor) || valor < saqueMinimo) {
      alert('O valor mínimo para saque é R$ 50,00.');
      return;
    }

    if (valor + taxa > saldoDisponivel) {
      alert('Saldo insuficiente para realizar o saque.');
      return;
    }

    alert(`Saque de R$ ${valor.toFixed(2)} solicitado com sucesso! Taxa de R$ ${taxa.toFixed(2)} aplicada.`);
    setValorSaque('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Solicitar Saque</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Saque (mínimo R$ 50,00)
            </label>
            <input
              type="number"
              value={valorSaque}
              onChange={(e) => setValorSaque(e.target.value)}
              placeholder="Digite o valor desejado"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Taxa de saque: R$ 2,00
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaque}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Confirmar Saque
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaqueModal;