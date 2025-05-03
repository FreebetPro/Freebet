# Documentação da Página de Balanço Financeiro

## Visão Geral
O componente ControleGeral fornece uma interface completa para monitoramento financeiro e gestão de saldos em diferentes casas de apostas, permitindo uma visão consolidada do capital em operação.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface ChildAccount {
  id: string;
  status: 'Aprovado' | 'Pendente' | 'Reprovado';
  cpf: string;
  name: string;
  accountNumber: string;
  balance: number;
  pixKeys: {
    cpf: boolean;
    random: boolean;
    email: boolean;
  };
}

interface ManualBalances {
  protection: number;
  bankBalance: number;
  fintechBalance: number;
}
```

### Funcionalidades Principais

#### 1. Gestão de Saldos
- Monitoramento de saldo total
- Controle por casa de apostas
- Saldos manuais (proteção, banco, fintech)
- Atualização em tempo real

#### 2. Casas de Apostas
- Listagem de todas as casas
- Saldo por casa
- Links para abertura de contas
- Histórico de transações

#### 3. Controle Manual
- Saldo de proteção
- Saldo em banco
- Saldo fintech
- Atualização manual

### Funções Principais

#### `handleRefreshBalance()`
Atualiza saldos automaticamente.
```typescript
const handleRefreshBalance = async () => {
  // Atualiza saldos via API
  // Processa novos valores
  // Atualiza interface
  // Registra histórico
};
```

#### `handleManualBalanceChange()`
Processa alterações em saldos manuais.
```typescript
const handleManualBalanceChange = (type: keyof ManualBalances, value: string) => {
  // Valida novo valor
  // Atualiza estado
  // Persiste alterações
  // Atualiza totais
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de saldos
const [balances, setBalances] = useState<BettingHouseBalance[]>([]);
const [manualBalances, setManualBalances] = useState<ManualBalances>({
  protection: 0,
  bankBalance: 0,
  fintechBalance: 0
});

// Controle de UI
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
```

### Seções da Interface

1. **Cabeçalho**
   - Saldo total consolidado
   - Data da última atualização
   - Botões de ação

2. **Saldos Manuais**
   - Casa de proteção
   - Saldo em banco
   - Saldo fintech
   - Controles de atualização

3. **Grid de Casas**
   - Saldo por casa
   - Links de abertura
   - Status da casa
   - Ações disponíveis

### Tratamento de Erros

O componente implementa diversos mecanismos de segurança:
- Validação de valores
- Confirmação de alterações
- Feedback visual
- Logs de erros

### Considerações de Performance

1. **Otimizações**
   - Cache de saldos
   - Atualizações seletivas
   - Debounce em inputs
   - Estados eficientes

2. **Boas Práticas**
   - Componentes modulares
   - Estados otimizados
   - Feedback imediato
   - Design responsivo

### Segurança

1. **Validações**
   - Verificação de valores
   - Confirmação de alterações
   - Proteção contra erros
   - Validação de saldos

2. **Proteção de Dados**
   - Mascaramento de valores
   - Logs de alterações
   - Histórico de mudanças
   - Backups automáticos

### Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Relatórios detalhados
   - Exportação de dados
   - Gráficos de evolução
   - Alertas automáticos

2. **Otimizações Previstas**
   - Performance melhorada
   - Interface aprimorada
   - Mais integrações
   - Análises avançadas

## Notas de Implementação

1. **Dependências**
   - Supabase para dados
   - React para interface
   - Tailwind para estilos
   - Lucide para ícones

2. **Ambiente**
   - Node.js
   - Supabase configurado
   - Variáveis de ambiente
   - Permissões corretas

## Manutenção

1. **Atualizações**
   - Verificar dependências
   - Testar funcionalidades
   - Atualizar documentação
   - Backup de dados

2. **Monitoramento**
   - Logs do sistema
   - Métricas de uso
   - Performance
   - Erros e exceções

## Integração com Outros Módulos

1. **Fintech**
   - Controle de saldos
   - Depósitos automáticos
   - Gestão financeira

2. **Contas CPF**
   - Status de contas
   - Verificações
   - Histórico de uso

3. **Operações**
   - Impacto nos saldos
   - Controle de stakes
   - Histórico operacional

## Considerações de Segurança

1. **Proteção de Dados**
   - Criptografia em trânsito
   - Mascaramento de valores sensíveis
   - Controle de acesso
   - Logs de atividade

2. **Validações**
   - Verificação de valores
   - Confirmação de alterações
   - Proteção contra erros
   - Validação de saldos

## Fluxos de Atualização

1. **Atualização Automática**
   - Consulta periódica de saldos
   - Verificação de alterações
   - Atualização da interface
   - Registro de histórico

2. **Atualização Manual**
   - Validação de entrada
   - Confirmação de alterações
   - Atualização de totais
   - Registro de mudanças