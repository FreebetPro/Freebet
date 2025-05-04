import { supabase } from './supabaseService';

interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  webhookSecret?: string;
}

interface PaymentData {
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

interface PaymentResponse {
  id: string;
  status: string;
  [key: string]: any;
}

interface SubscriptionData {
  reason: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
  back_url: string;
  payer_email: string;
}

class MercadoPagoService {
  private accessToken: string;
  private publicKey: string;
  private webhookSecret?: string;
  private baseUrl = 'https://api.mercadopago.com/v1';

  constructor(config: MercadoPagoConfig) {
    this.accessToken = config.accessToken;
    this.publicKey = config.publicKey;
    this.webhookSecret = config.webhookSecret;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erro na requisição: ${response.statusText}`);
    }

    return response.json();
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      return await this.request<PaymentResponse>('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  async createSubscription(subscriptionData: SubscriptionData): Promise<PaymentResponse> {
    try {
      return await this.request<PaymentResponse>('/preapproval', {
        method: 'POST',
        body: JSON.stringify(subscriptionData),
      });
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      return await this.request<PaymentResponse>(`/payments/${paymentId}`);
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<PaymentResponse> {
    try {
      return await this.request<PaymentResponse>(`/preapproval/${subscriptionId}`);
    } catch (error) {
      console.error('Erro ao buscar status da assinatura:', error);
      throw error;
    }
  }

  async checkPendingPayments(): Promise<void> {
    try {
      // Buscar pagamentos pendentes que não foram verificados nos últimos 5 segundos
      const { data: pendingPayments, error } = await supabase
        .from('pending_payments')
        .select('*')
        .lt('last_check_at', new Date(Date.now() - 5000).toISOString())
        .or('last_check_at.is.null')
        .limit(10);

      if (error) throw error;

      for (const payment of pendingPayments) {
        try {
          const status = await this.getPaymentStatus(payment.payment_id);
          
          // Atualizar status do pagamento
          const { error: updateError } = await supabase
            .from('pending_payments')
            .update({
              status: status.status,
              last_check_at: new Date().toISOString(),
              check_attempts: payment.check_attempts + 1,
            })
            .eq('id', payment.id);

          if (updateError) throw updateError;

          // Se o pagamento foi aprovado, ativar a assinatura
          if (status.status === 'approved') {
            await this.activateSubscription(payment.user_id, payment.plan_id);
          }
        } catch (error) {
          console.error(`Erro ao verificar pagamento ${payment.payment_id}:`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar pagamentos pendentes:', error);
      throw error;
    }
  }

  private async activateSubscription(userId: string, planId: string): Promise<void> {
    try {
      // Calcular data de expiração (30 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Atualizar ou criar assinatura
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (subscriptionError) throw subscriptionError;

      // Registrar transação
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert([{
          user_id: userId,
          plan_id: planId,
          status: 'success',
          amount: 0, // TODO: Adicionar valor do plano
          created_at: new Date().toISOString(),
        }]);

      if (transactionError) throw transactionError;
    } catch (error) {
      console.error('Erro ao ativar assinatura:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    
    // TODO: Implementar verificação da assinatura do webhook
    // https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/security/webhooks
    return true;
  }
}

// Usar variáveis de ambiente do Vite
const accessToken = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || '';
const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || '';
const webhookSecret = import.meta.env.VITE_MERCADO_PAGO_WEBHOOK_SECRET;

export const mercadoPagoService = new MercadoPagoService({
  accessToken,
  publicKey,
  webhookSecret,
}); 