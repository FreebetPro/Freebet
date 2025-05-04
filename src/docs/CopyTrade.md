# Documentação do Componente CopyTrade

## Visão Geral
O componente CopyTrade fornece uma interface profissional para gerenciar e replicar operações de apostas em múltiplas contas. Permite que os usuários executem trades em uma conta principal e repliquem automaticamente essas operações em contas secundárias com configurações personalizáveis.

## Estrutura do Componente

### Gerenciamento de Estado
```typescript
interface Account {
  id: string;          // Identificador único da conta
  balance: number;     // Saldo atual da conta
  lastBet: string;     // Última aposta realizada nesta conta
  status: 'success' | 'error' | 'pending';  // Status atual da conta
}

interface Promotion {
  title: string;       // Título da promoção
  platform: string;    // Plataforma que oferece a promoção
  odds: number;        // Odds da promoção
  value?: number;      // Valor opcional para promoções freebet
}
```

### Funcionalidades Principais

#### 1. Gerenciamento da Conta Principal
- Exibe saldo atual, apostas em aberto e lucro diário
- Fornece monitoramento em tempo real do status da conta
- Suporta tipos de apostas Back e Lay
- Inclui suporte a Freebet para ofertas promocionais

#### 2. Gerenciamento de Contas Secundárias
- Exibe lista de todas as contas gerenciadas com seus status atuais
- Mostra saldos individuais e informações da última aposta
- Fornece indicadores de status para cada conta:
  - ✅ Sucesso: Conta operando normalmente
  - ❌ Erro: Problemas como saldo baixo
  - ⏳ Pendente: Operação em andamento

#### 3. Configurações
- Configuração de stake por conta
- Configurações de delay entre apostas (0-5 segundos)
- Modo apenas freebet
- Logs de operações com atualizações em tempo real

### Funções Principais

#### `handleExecuteBet()`
Executa a operação principal de apostas e replica nas contas secundárias.
```typescript
const handleExecuteBet = () => {
  // Valida parâmetros da aposta
  // Executa aposta na conta principal
  // Replica aposta nas contas secundárias com delay configurado
};
```

#### `getStatusIcon(status: string)`
Retorna o ícone apropriado baseado no status da conta.
```typescript
const getStatusIcon = (status: string) => {
  // Retorna CheckCircle2 para sucesso
  // Retorna XCircle para erro
  // Retorna Clock para pendente
};
```

### Seções da Interface

1. **Seção de Cabeçalho**
   - Exibição do título
   - Controles de Atualização e Pausa/Retomada
   
2. **Seção da Conta Principal**
   - Exibição do saldo
   - Valor em apostas abertas
   - Acompanhamento do lucro diário
   - Controles de execução de apostas
   
3. **Seção de Contas Secundárias**
   - Lista de contas com status
   - Monitoramento de saldo
   - Acompanhamento da última aposta
   - Ações em massa (pausar todas)
   
4. **Seção de Configurações**
   - Configuração de stake
   - Configurações de delay
   - Modo freebet
   - Logs de operações

### Exemplo de Uso

```tsx
// Em um componente pai
import CopyTrade from './components/CopyTrade';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <CopyTrade />
      </div>
    </div>
  );
}
```

## Gerenciamento de Estado

### Estado da Conta Principal
```typescript
const [mainAccount, setMainAccount] = useState({
  balance: 5000,        // Saldo atual
  openBets: 1200,       // Valor em apostas abertas
  dailyProfit: 750,     // Lucro do dia
});
```

### Estado das Contas Secundárias
```typescript
const [childAccounts, setChildAccounts] = useState<Account[]>([
  // Array de objetos de contas secundárias
]);
```

### Estado das Configurações de Apostas
```typescript
const [stake, setStake] = useState<number>(10);           // Valor da aposta
const [useFreebet, setUseFreebet] = useState<boolean>(false); // Modo freebet
const [paused, setPaused] = useState<boolean>(false);     // Estado de pausa do sistema
const [betType, setBetType] = useState<'back' | 'lay'>('back'); // Tipo de aposta
const [delay, setDelay] = useState<number>(2);            // Delay entre apostas
```

## Tratamento de Erros

O componente implementa várias verificações de erro:
- Validação de saldo antes da execução da aposta
- Monitoramento de status para cada conta
- Exibição de estado de erro para operações falhas

## Considerações de Performance

1. **Otimizações**
   - Usa memoização para ícones de status
   - Implementa renderização eficiente de listas
   - Gerencia atualizações de estado cuidadosamente

2. **Boas Práticas**
   - Atualizações em lote para múltiplas contas
   - Implementação adequada de error boundary
   - Padrões de design responsivo

## Notas de Segurança

1. **Autenticação**
   - Componente assume que usuário está autenticado
   - Requer gerenciamento adequado de sessão
   
2. **Proteção de Dados**
   - Informações sensíveis da conta são mascaradas
   - Atualizações de saldo requerem verificação

## Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Opções avançadas de filtragem
   - Estratégias automatizadas de recuperação
   - Capacidades aprimoradas de relatórios
   
2. **Possíveis Melhorias**
   - Integração WebSocket em tempo real
   - Recuperação aprimorada de erros
   - Estratégias adicionais de apostas