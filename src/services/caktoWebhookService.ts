import { supabase } from './supabaseService';

interface CaktoWebhookPayload {
  event: string;
  data: {
    id: string;
    status: string;
    customer: {
      email: string;
      name: string;
    };
    plan: {
      id: string;
      name: string;
      price: number;
    };
    payment: {
      method: string;
      status: string;
      amount: number;
      test?: boolean;
    };
    created_at: string;
  };
}

// Mapeamento de planos e seus detalhes
const PLAN_MAPPING = {
  'ieFcYbH': {
    name: 'Freebet Pro - Mensal',
    price: 50.00,
    access_level: 'basic',
    features: ['Crie sua Banca', 'Registro Operação Profissional', 'Controle de CPF\'s profissional']
  },
  '4w9c257_340495': {
    name: 'Freebet Plano Base + QR Code',
    price: 119.90,
    access_level: 'pro',
    features: ['TODAS AS FUNÇÕES DO PLANO BÁSICO', 'DEPÓSITO QR CODE AUTOMÁTICO', 'ALERTA TAREFAS EMPRESTADOR WHATSAPP']
  },
  '6zmuxcz_340499': {
    name: 'Freebet Plano Base + QR Code + CopyTrade',
    price: 169.90,
    access_level: 'enterprise',
    features: ['TODAS AS FUNÇÕES DO PLANO BÁSICO E UPGRADE 1', 'COPYTRADE AUTOMÁTICO', 'CALENDÁRIO DE PROMOÇÕES']
  }
};

export const caktoWebhookService = {
  async handleWebhook(payload: CaktoWebhookPayload) {
    try {
      // Validar payload
      if (!payload.event || !payload.data) {
        throw new Error('Payload inválido');
      }

      // Verificar se é um pagamento de teste
      const isTestPayment = payload.data.payment.test === true;
      console.log(`Processando webhook ${isTestPayment ? 'de teste' : 'de produção'}`);

      // Processar baseado no tipo de evento
      switch (payload.event) {
        case 'payment.success':
          await this.handleSuccessfulPayment(payload.data);
          break;
        case 'payment.failed':
          await this.handleFailedPayment(payload.data);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancellation(payload.data);
          break;
        default:
          console.log(`Tipo de evento não tratado: ${payload.event}`);
      }

      return { success: true, test: isTestPayment };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao processar webhook'
      };
    }
  },

  async handleSuccessfulPayment(data: CaktoWebhookPayload['data']) {
    // Registrar transação
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert([{
        transaction_id: data.id,
        customer_email: data.customer.email,
        amount: data.payment.amount,
        status: data.payment.status,
        payment_method: data.payment.method,
        created_at: data.created_at,
        is_test: data.payment.test || false
      }]);

    if (transactionError) throw transactionError;

    // Buscar usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.customer.email)
      .single();

    if (userError) throw userError;

    // Calcular data de expiração (30 dias)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Obter informações do plano
    const planInfo = PLAN_MAPPING[data.plan.id];
    if (!planInfo) {
      throw new Error(`Plano não encontrado: ${data.plan.id}`);
    }

    // Atualizar ou criar assinatura
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        subscription_id: data.id,
        plan_id: data.plan.id,
        status: 'active',
        access_level: planInfo.access_level,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
        is_test: data.payment.test || false
      });

    if (subscriptionError) throw subscriptionError;

    // Registrar histórico de upsell/downsell
    await this.recordUpsellDownsellHistory(user.id, data.plan.id);
  },

  async handleFailedPayment(data: CaktoWebhookPayload['data']) {
    // Registrar pagamento falho
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert([{
        transaction_id: data.id,
        customer_email: data.customer.email,
        amount: data.payment.amount,
        status: 'failed',
        payment_method: data.payment.method,
        created_at: data.created_at,
        is_test: data.payment.test || false
      }]);

    if (transactionError) throw transactionError;

    // Atualizar status da assinatura se existir
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', data.id);

    if (subscriptionError) throw subscriptionError;
  },

  async handleSubscriptionCancellation(data: CaktoWebhookPayload['data']) {
    // Atualizar status da assinatura
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', data.id);

    if (subscriptionError) throw subscriptionError;
  },

  async recordUpsellDownsellHistory(userId: string, planId: string) {
    const { error } = await supabase
      .from('subscription_history')
      .insert([{
        user_id: userId,
        plan_id: planId,
        action: 'upgrade',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  }
}; 