import express, { Request, Response } from 'express';
import { testWebhook, runAllTests } from './testWebhook';

const router = express.Router();

// Rota para testar um cenário específico
router.post('/test/:scenario', async (req: Request, res: Response) => {
  try {
    const { scenario } = req.params;
    if (!['successfulPayment', 'failedPayment', 'subscriptionCancelled'].includes(scenario)) {
      return res.status(400).json({ error: 'Cenário inválido' });
    }

    const result = await testWebhook(scenario as any);
    res.json(result);
  } catch (error) {
    console.error('Erro ao testar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar teste' });
  }
});

// Rota para executar todos os testes
router.post('/test-all', async (req: Request, res: Response) => {
  try {
    await runAllTests();
    res.json({ message: 'Testes executados com sucesso' });
  } catch (error) {
    console.error('Erro ao executar testes:', error);
    res.status(500).json({ error: 'Erro ao executar testes' });
  }
});

export default router; 