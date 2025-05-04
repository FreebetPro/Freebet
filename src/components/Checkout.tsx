import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../services/supabaseService';
import { mercadoPagoService } from '../services/mercadoPagoService';

interface CheckoutProps {
  planId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface FormInputEvent extends ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement;
}

export const Checkout = ({ planId, amount, onSuccess, onError }: CheckoutProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [expiryMonth, setExpiryMonth] = useState<string>('');
  const [expiryYear, setExpiryYear] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Criar assinatura no Mercado Pago
      const subscriptionData = {
        reason: `Assinatura do plano ${planId}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'BRL',
        },
        back_url: `${window.location.origin}/subscription/status`,
        payer_email: user.email || '',
      };

      const subscription = await mercadoPagoService.createSubscription(subscriptionData);

      // Registrar pagamento pendente
      const { error: pendingError } = await supabase
        .from('pending_payments')
        .insert([{
          user_id: user.id,
          payment_id: subscription.id,
          plan_id: planId,
          status: subscription.status,
          amount: amount,
        }]);

      if (pendingError) throw pendingError;

      onSuccess();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      onError(error instanceof Error ? error.message : 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: (value: string) => void) => (e: FormInputEvent) => {
    setter(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Número do Cartão</label>
        <input
          type="text"
          value={cardNumber}
          onChange={handleInputChange(setCardNumber)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nome no Cartão</label>
        <input
          type="text"
          value={cardName}
          onChange={handleInputChange(setCardName)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mês</label>
          <input
            type="text"
            value={expiryMonth}
            onChange={handleInputChange(setExpiryMonth)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="MM"
            maxLength={2}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ano</label>
          <input
            type="text"
            value={expiryYear}
            onChange={handleInputChange(setExpiryYear)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="AA"
            maxLength={2}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={handleInputChange(setCvv)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="123"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">CPF</label>
        <input
          type="text"
          value={cpf}
          onChange={handleInputChange(setCpf)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="123.456.789-00"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Processando...' : 'Pagar'}
      </button>
    </form>
  );
};