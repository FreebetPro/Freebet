# Documentação do Dashboard do Emprestador

## Visão Geral
O componente LenderDashboard fornece uma interface completa para emprestadores de contas monitorarem suas atividades, comissões, tarefas pendentes e desempenho financeiro. Este painel centraliza todas as informações relevantes para o emprestador gerenciar suas contas e acompanhar seus ganhos.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface LenderProfile {
  id: string;
  user_id: string;
  cpf: string;
  name: string;
  whatsapp: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface LenderTask {
  id: string;
  lender_id: string;
  title: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  status: string;
  house?: string;
}
```

### Funcionalidades Principais

#### 1. Gestão de Tarefas Pendentes
- Exibição de tarefas de verificação pendentes
- Marcação de tarefas como concluídas
- Filtragem por status
- Notificações de novas tarefas

#### 2. Monitoramento Financeiro
- Visualização de comissão atual
- Acompanhamento de operações
- Controle de depósitos e saques
- Solicitação de saques

#### 3. Acompanhamento de Imposto de Renda
- Cálculo de progresso para o limite de isenção
- Visualização de valor faltante
- Barra de progresso visual
- Informações sobre tributação

#### 4. Análise de Desempenho
- Gráfico interativo de lucros
- Visualização de tendências
- Exportação de relatórios
- Filtros por período

### Funções Principais

#### `handleSubmit()`
Processa a solicitação de saque do emprestador.
```typescript
const confirmarSaque = () => {
  // Valida valor mínimo
  // Verifica saldo disponível
  // Calcula taxa de saque
  // Processa a solicitação
  // Exibe confirmação
};
```

#### `aplicarFiltros()`
Atualiza os dados exibidos com base nos filtros selecionados.
```typescript
const aplicarFiltros = () => {
  // Obtém datas selecionadas
  // Filtra dados por período
  // Atualiza métricas e gráficos
  // Recalcula totais
};
```

#### `atualizarProgressoIR()`
Calcula e atualiza o progresso do imposto de renda.
```typescript
const atualizarProgressoIR = (lucroAtual: number, limiteIsencao: number) => {
  // Calcula percentual de progresso
  // Determina valor faltante
  // Atualiza barra de progresso
  // Exibe informações relevantes
};
```

#### `copyVideoLink()`
Copia o link do vídeo explicativo para a área de transferência.
```typescript
const copyVideoLink = () => {
  // Copia link para área de transferência
  // Exibe confirmação
  // Registra evento de cópia
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de modais
const [showSaqueModal, setShowSaqueModal] = useState(false);
const [showEarnMoreModal, setShowEarnMoreModal] = useState(false);

// Controle de valores
const [valorSaque, setValorSaque] = useState('');

// Controle de filtros
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

// Controle de dados
const [profile, setProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);

// Métricas financeiras
const [totalOperacoes, setTotalOperacoes] = useState(0);
const [totalDepositos, setTotalDepositos] = useState(0);
const [totalSaques, setTotalSaques] = useState(0);
const [irProgress, setIrProgress] = useState(0);
const [irFaltante, setIrFaltante] = useState(22110.40);
```

### Seções da Interface

1. **Navegação Superior**
   - Título do dashboard
   - Filtros de data
   - Botão de aplicar filtros
   - Link para tutorial de ganhos

2. **Tarefas Pendentes**
   - Lista de verificações pendentes
   - Status de cada tarefa
   - Botão para cumprir tarefa
   - Contador de pendências

3. **Cards de Estatísticas**
   - Comissão atual (com botão de saque)
   - Total de operações
   - Total de depósitos
   - Total de saques

4. **Progresso do Imposto de Renda**
   - Barra de progresso visual
   - Valor faltante para isenção
   - Informações sobre tributação
   - Limite anual de isenção

5. **Gráfico de Lucros**
   - Visualização de tendências
   - Dados históricos
   - Tooltips interativos
   - Escala dinâmica

6. **Tabelas de Transações**
   - Extrato bancário
   - Operações nas casas de apostas
   - Filtros e ordenação
   - Exportação de dados

### Modais e Popups

1. **Modal de Saque**
   - Campo para valor do saque
   - Informações sobre taxas
   - Valor mínimo
   - Botões de confirmação/cancelamento

2. **Modal de Ganhos Adicionais**
   - Tutorial passo a passo
   - Vídeo explicativo
   - Botão para copiar link
   - Instruções detalhadas

### Integração com Chart.js

O componente utiliza a biblioteca Chart.js para renderizar o gráfico de lucros, com as seguintes configurações:

```typescript
// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Configuração do gráfico
const chartData = {
  labels: ['01 Jan', '05 Jan', '10 Jan', '15 Jan', '20 Jan', '25 Jan', '30 Jan'],
  datasets: [{
    label: 'Lucro Diário',
    data: [200, 300, 500, 600, 700, 800, 900],
    borderColor: '#2563eb',
    borderWidth: 3,
    tension: 0.4,
    fill: true,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    pointBackgroundColor: '#2563eb',
    pointBorderColor: '#fff',
    pointRadius: 6,
    pointHoverRadius: 8
  }]
};

// Opções do gráfico
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#2563eb',
      titleColor: 'white',
      bodyColor: 'white'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return 'R$ ' + value;
        }
      }
    }
  }
};
```

### Tratamento de Erros

O componente implementa diversos mecanismos de segurança:
- Validação de dados antes da exibição
- Tratamento de estados de carregamento
- Feedback visual para ações do usuário
- Mensagens de erro amigáveis

### Considerações de Performance

1. **Otimizações**
   - Carregamento condicional de dados
   - Renderização eficiente de listas
   - Caching de dados filtrados
   - Estados bem gerenciados

2. **Boas Práticas**
   - Componentes modulares
   - Funções puras quando possível
   - Feedback imediato ao usuário
   - Design responsivo

### Segurança

1. **Validações**
   - Verificação de autenticação
   - Validação de dados de entrada
   - Proteção contra XSS
   - Sanitização de dados

2. **Proteção de Dados**
   - Mascaramento de informações sensíveis
   - Validação de permissões
   - Logs de atividades
   - Timeout de sessão

### Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Notificações em tempo real
   - Dashboard personalizado
   - Mais opções de filtros
   - Integração com WhatsApp

2. **Otimizações Previstas**
   - Cache de dados
   - Carregamento lazy de componentes
   - Mais opções de visualização
   - Integração com APIs adicionais

## Notas de Implementação

1. **Dependências**
   - React para interface
   - Chart.js para gráficos
   - Lucide para ícones
   - Tailwind para estilos
   - Supabase para dados

2. **Ambiente**
   - Node.js
   - Configurações padrão
   - Variáveis de ambiente
   - Permissões básicas

## Manutenção

1. **Atualizações**
   - Verificar dados do gráfico
   - Atualizar limites de IR
   - Testar fluxos de saque
   - Backup de configurações

2. **Monitoramento**
   - Logs de uso
   - Métricas de conversão
   - Performance
   - Erros e exceções

## Integração com Outros Módulos

1. **Sistema de Pagamentos**
   - Processamento de saques
   - Cálculo de comissões
   - Histórico de transações
   - Notificações de pagamento

2. **Gestão de Tarefas**
   - Criação de tarefas
   - Atribuição a emprestadores
   - Monitoramento de status
   - Notificações de conclusão

## Considerações de UX

1. **Feedback Visual**
   - Cores indicativas
   - Animações suaves
   - Estados de hover
   - Mensagens claras

2. **Acessibilidade**
   - Labels descritivos
   - Contraste adequado
   - Navegação lógica
   - Suporte a teclado

## Fluxos de Trabalho

1. **Processo de Verificação**
   - Recebimento de tarefa
   - Execução da verificação
   - Marcação como concluída
   - Recebimento de comissão

2. **Processo de Saque**
   - Verificação de saldo
   - Solicitação de saque
   - Confirmação
   - Acompanhamento

## Exemplos de Uso

1. **Solicitação de Saque**
   ```typescript
   // Validar valor mínimo
   if (isNaN(valorSaqueNum) || valorSaqueNum < saqueMinimo) {
     alert('O valor mínimo para saque é R$ 50,00.');
     return;
   }

   // Verificar saldo disponível
   if (valorSaqueNum + taxa > saldoDisponivel) {
     alert('Saldo insuficiente para realizar o saque.');
     return;
   }

   // Calcular valor líquido
   const valorLiquido = valorSaqueNum - taxa;
   
   // Exibir confirmação
   alert(`Saque de R$ ${valorSaqueNum.toFixed(2)} solicitado com sucesso!\nValor líquido: R$ ${valorLiquido.toFixed(2)}\nTaxa de saque: R$ ${taxa.toFixed(2)}`);
   ```

2. **Aplicação de Filtros**
   ```typescript
   // Aplicar filtros de data
   const aplicarFiltros = () => {
     // Validar datas
     if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
       alert('A data inicial não pode ser posterior à data final');
       return;
     }
     
     // Buscar dados filtrados
     fetchDadosFiltrados(startDate, endDate);
     
     // Atualizar métricas
     atualizarMetricas(dadosFiltrados);
   };
   ```

## Considerações de Segurança

1. **Proteção de Dados**
   - Validação de origem
   - Proteção contra fraudes
   - Monitoramento de atividades suspeitas
   - Logs de transações

2. **Validações Críticas**
   - Verificação de saldo antes do saque
   - Limites de transação
   - Proteção contra duplo clique
   - Confirmação de ações importantes

## Mensagens ao Usuário

1. **Confirmações**
   ```typescript
   // Saque solicitado
   `Saque de R$ ${valorSaqueNum.toFixed(2)} solicitado com sucesso!`
   
   // Link copiado
   "Link copiado para a área de transferência!"
   ```

2. **Erros**
   ```typescript
   // Saldo insuficiente
   "Saldo insuficiente para realizar o saque."
   
   // Valor mínimo
   "O valor mínimo para saque é R$ 50,00."
   ```

## Configuração do Gráfico

O gráfico de lucros utiliza as seguintes configurações:

```typescript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#2563eb',
      titleColor: 'white',
      bodyColor: 'white'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return 'R$ ' + value;
        }
      }
    }
  }
};
```

## Estrutura de Dados

1. **Perfil do Emprestador**
   ```typescript
   interface LenderProfile {
     id: string;
     user_id: string;
     name: string;
     cpf: string;
     whatsapp: string;
     email: string;
     created_at: string;
     updated_at: string;
   }
   ```

2. **Transação Financeira**
   ```typescript
   interface Transaction {
     id: number;
     date: string;
     description: string;
     bettingHouse?: string;
     amount: number;
     type: 'credit' | 'debit';
     status: 'completed' | 'pending' | 'failed';
   }
   ```

3. **Tarefa de Verificação**
   ```typescript
   interface VerificationTask {
     id: number;
     title: string;
     status: 'pending' | 'completed' | 'failed';
     createdAt: string;
     completedAt?: string;
   }
   ```

## Considerações de Design

1. **Elementos Visuais**
   - Gradientes para destaque
   - Ícones ilustrativos
   - Cards com sombras suaves
   - Cores temáticas consistentes

2. **Responsividade**
   - Layout adaptativo
   - Visualização em dispositivos móveis
   - Ajustes para tablets
   - Otimização para desktop

## Integração com Supabase

O componente utiliza o Supabase para gerenciar dados do emprestador:

```typescript
// Buscar perfil do emprestador
const fetchLenderProfile = async () => {
  const { data, error } = await supabase
    .from('lender_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
  
  return data;
};

// Buscar tarefas pendentes
const fetchPendingTasks = async () => {
  const { data, error } = await supabase
    .from('lender_tasks')
    .select('*')
    .eq('lender_id', profile.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar tarefas:', error);
    return [];
  }
  
  return data;
};
```

## Fluxo de Autenticação

O componente verifica a autenticação do usuário antes de exibir o dashboard:

```typescript
// Verificar autenticação
useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Redirecionar para login
      navigate('/lender/login');
      return;
    }
    
    // Buscar perfil do emprestador
    const profile = await fetchLenderProfile(session.user.id);
    
    if (!profile) {
      // Redirecionar para completar perfil
      navigate('/lender/complete-profile');
      return;
    }
    
    setProfile(profile);
    setLoading(false);
  };
  
  checkAuth();
}, []);
```

## Considerações Finais

O Dashboard do Emprestador é uma ferramenta essencial para o gerenciamento eficiente das contas emprestadas, permitindo o acompanhamento financeiro, a gestão de tarefas e a solicitação de saques. A interface intuitiva e as funcionalidades abrangentes garantem uma experiência completa para o emprestador monitorar suas atividades e maximizar seus ganhos.