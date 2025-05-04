import { mercadoPagoService } from '../services/mercadoPagoService';

async function checkPayments() {
  try {
    await mercadoPagoService.checkPendingPayments();
  } catch (error) {
    console.error('Erro ao verificar pagamentos:', error);
  }
}

// Executar a verificação a cada 5 segundos
setInterval(checkPayments, 5000);

// Executar imediatamente na primeira vez
checkPayments(); 