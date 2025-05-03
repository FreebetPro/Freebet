import { caktoWebhookService } from '../services/caktoWebhookService';

// Dados de teste para simular diferentes cenários
const testData = {
  successfulPayment: {
    event: 'payment.success',
    data: {
      id: 'test_transaction_123',
      status: 'success',
      customer: {
        email: 'test@example.com',
        name: 'Usuário Teste'
      },
      plan: {
        id: 'freebet-pro',
        name: 'Freebet Pro',
        price: 79.90
      },
      payment: {
        method: 'credit_card',
        status: 'success',
        amount: 79.90
      },
      created_at: new Date().toISOString()
    }
  },
  failedPayment: {
    event: 'payment.failed',
    data: {
      id: 'test_transaction_456',
      status: 'failed',
      customer: {
        email: 'test@example.com',
        name: 'Usuário Teste'
      },
      plan: {
        id: 'freebet-pro',
        name: 'Freebet Pro',
        price: 79.90
      },
      payment: {
        method: 'credit_card',
        status: 'failed',
        amount: 79.90
      },
      created_at: new Date().toISOString()
    }
  },
  subscriptionCancelled: {
    event: 'subscription.cancelled',
    data: {
      id: 'test_subscription_789',
      status: 'cancelled',
      customer: {
        email: 'test@example.com',
        name: 'Usuário Teste'
      },
      plan: {
        id: 'freebet-pro',
        name: 'Freebet Pro',
        price: 79.90
      },
      payment: {
        method: 'credit_card',
        status: 'active',
        amount: 79.90
      },
      created_at: new Date().toISOString()
    }
  }
};

// Função para testar o webhook
export const testWebhook = async (scenario: 'successfulPayment' | 'failedPayment' | 'subscriptionCancelled') => {
  try {
    const payload = testData[scenario];
    const result = await caktoWebhookService.handleWebhook(payload);
    console.log(`Teste do cenário ${scenario}:`, result);
    return result;
  } catch (error) {
    console.error(`Erro no teste do cenário ${scenario}:`, error);
    throw error;
  }
};

// Função para testar todos os cenários
export const runAllTests = async () => {
  console.log('Iniciando testes do webhook...');
  
  try {
    // Teste de pagamento bem-sucedido
    await testWebhook('successfulPayment');
    
    // Teste de pagamento falho
    await testWebhook('failedPayment');
    
    // Teste de cancelamento de assinatura
    await testWebhook('subscriptionCancelled');
    
    console.log('Todos os testes foram concluídos com sucesso!');
  } catch (error) {
    console.error('Erro durante os testes:', error);
  }
}; 