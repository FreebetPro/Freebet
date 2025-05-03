# Documentação da Página de Registro de Operações

## Visão Geral
O componente Dashboard fornece uma interface completa para registro e gerenciamento de operações de apostas, incluindo monitoramento de resultados, análise de desempenho e gestão de contas.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface BettingOperation {
  id: string;
  date: string;
  time: string;
  game_name: string;
  house1_id: string;
  house2_id: string;
  bet_amount: number;
  result: number;
  profit: number;
  status: string;
  promotion_type?: string;
  bank_id?: string;
}

interface OperationAccount {
  id: string;
  operation_id: string;
  account_id: string;
  betting_house_id: string;
  stake: number;
  role: string;
  is_winner: boolean;
}
```

### Funcionalidades Principais

#### 1. Gestão de Operações
- Registro de novas operações
- Acompanhamento de resultados
- Filtros por período
- Análise de desempenho

#### 2. Monitoramento Financeiro
- Cálculo de ROI
- Acompanhamento de lucros
- Análise por casa de apostas
- Gestão de bancas

#### 3. Gestão de Contas
- Vinculação de contas às operações
- Controle de stakes
- Monitoramento de resultados por conta
- Histórico de operações

### Funções Principais

#### `handleSubmit()`
Registra uma nova operação de aposta.
```typescript
const handleSubmit = async () => {
  // Valida dados da operação
  // Registra operação no banco
  // Vincula contas utilizadas
  // Atualiza métricas
};
```

#### `calculateResults()`
Calcula resultados e métricas da operação.
```typescript
const calculateResults = () => {
  // Calcula lucro/prejuízo
  // Atualiza ROI
  // Processa comissões
  // Atualiza estatísticas
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de operações
const [operations, setOperations] = useState<BettingOperation[]>([]);
const [selectedBank, setSelectedBank] = useState<string>('');

// Controle de UI
const [showFilters, setShowFilters] = useState(false);
const [showOperationForm, setShowOperationForm] = useState(false);

// Controle de filtros
const [filters, setFilters] = useState({
  startDate: '',
  endDate: '',
  status: '',
  bettingHouse: ''
});
```

### Seções da Interface

1. **Cabeçalho**
   - Título e descrição
   - Botões de ação principais
   - Filtros de período

2. **Cards de Métricas**
   - Total de apostas
   - Lucro/Prejuízo
   - ROI
   - Média por conta

3. **Gráfico de Desempenho**
   - Visualização de lucros
   - Tendências
   - Análise temporal

4. **Lista de Operações**
   - Detalhes por operação
   - Status e resultados
   - Ações disponíveis

### Modais e Formulários

1. **Modal de Nova Operação**
   - Dados básicos da operação
   - Seleção de contas
   - Configuração de stakes
   - Promoções disponíveis

2. **Modal de Filtros**
   - Período
   - Status
   - Casas de apostas
   - Tipos de operação

### Tratamento de Erros

O componente implementa diversos mecanismos de segurança:
- Validação de dados
- Confirmação de operações
- Feedback visual
- Tratamento de falhas

### Considerações de Performance

1. **Otimizações**
   - Paginação de resultados
   - Caching de dados
   - Atualizações seletivas
   - Debounce em filtros

2. **Boas Práticas**
   - Componentes modulares
   - Estados otimizados
   - Feedback em tempo real
   - Design responsivo

### Segurança

1. **Validações**
   - Verificação de dados
   - Confirmação de ações
   - Proteção contra erros
   - Validação de valores

2. **Proteção de Dados**
   - Mascaramento de informações
   - Controle de acesso
   - Logs de atividades
   - Backups automáticos

### Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Relatórios avançados
   - Exportação de dados
   - Filtros customizados
   - Automações

2. **Otimizações Previstas**
   - Performance melhorada
   - Interface aprimorada
   - Mais integrações
   - Análises avançadas

## Notas de Implementação

1. **Dependências**
   - Supabase para dados
   - Chart.js para gráficos
   - React para interface
   - Tailwind para estilos

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
   - Vinculação de contas
   - Status de verificação
   - Histórico de uso

3. **Bancas**
   - Gestão de capital
   - ROI por banca
   - Limites operacionais