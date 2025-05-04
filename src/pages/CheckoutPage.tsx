import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { mercadoPagoService } from '../services/mercadoPagoService';
import { Checkout } from '../components/Checkout';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const PLANS: Record<string, Plan> = {
  basic: {
    id: 'basic',
    name: 'Painel Iniciante',
    price: 79.90,
    features: [
      'Crie sua Banca',
      'Registro Operação Profissional',
      'Controle de CPF\'s profissional',
      'Balanço Financeiro de contas',
      'Cadastro Emprestador',
      'Criação Tarefas Emprestador',
      'Painel Kanban Organização',
      'Calculadoras (Aumento, Lay, Dutching, Surebet)',
      'Painel e Acesso a Afiliação',
      'Grupo Telegram de Notificações',
    ]
  },
  pro: {
    id: 'pro',
    name: 'Upgrade 1 - Intermediário',
    price: 119.90,
    features: [
      'TODAS AS FUNÇÕES DO PLANO BÁSICO',
      'DEPÓSITO QR CODE AUTOMÁTICO',
      'ALERTA TAREFAS EMPRESTADOR WHATSAPP',
      'Gestão de múltiplas casas',
      'Suporte prioritário',
      'Relatório Semanal de Operações',
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Upgrade 2 - Profissional',
    price: 169.90,
    features: [
      'TODAS AS FUNÇÕES DO PLANO BÁSICO E UPGRADE 1',
      'COPYTRADE AUTOMÁTICO',
      'CALENDÁRIO DE PROMOÇÕES',
    ]
  }
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login?redirect=/checkout/' + planId);
        return;
      }

      if (!planId || !PLANS[planId]) {
        navigate('/subscription');
        return;
      }

      setPlan(PLANS[planId]);
      setLoading(false);
    };

    checkAuth();
  }, [planId, navigate]);

  const handleSuccess = () => {
    navigate('/subscription/success');
  };

  const handleError = (error: string) => {
    // TODO: Implementar tratamento de erro
    console.error(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout - {plan.name}</h1>
              
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do Plano</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Valor Mensal</span>
                    <span className="text-xl font-bold text-gray-900">R$ {plan.price.toFixed(2)}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Dados do Cartão</h2>
                <Checkout
                  planId={plan.id}
                  amount={plan.price}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 