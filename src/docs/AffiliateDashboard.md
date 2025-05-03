# Documentação do Componente Dashboard de Afiliado

## Visão Geral
O componente Dashboard de Afiliado fornece uma interface profissional para gerenciar e monitorar o programa de afiliados. Permite que os usuários visualizem suas estatísticas de vendas, comissões, saldo disponível e link de afiliado, além de acompanhar o desempenho através de gráficos interativos.

## Estrutura do Componente

### Gerenciamento de Estado
```typescript
interface DashboardProps {
  onOpenSaqueModal: () => void;
}

// Estado principal do componente
const [chartData, setChartData] = useState({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
  datasets: [{
    label: 'Ganhos Mensais',
    data: [1200, 1900, 2100, 2800, 2400, 3100, 3800],
    // Configurações visuais do gráfico
  }]
});
```

### Funcionalidades Principais

#### 1. Visualização de Métricas
- Exibe número total de vendas realizadas
- Mostra comissões pendentes
- Apresenta saldo disponível para saque
- Calcula e exibe taxa de conversão

#### 2. Gerenciamento de Link de Afiliado
- Exibe link personalizado de afiliado
- Permite copiar o link para a área de transferência
- Fornece instruções de uso do link
- Rastreia cliques e conversões

#### 3. Análise de Desempenho
- Gráfico interativo de ganhos mensais
- Visualização de tendências ao longo do tempo
- Dados históricos de vendas
- Métricas de crescimento

#### 4. Solicitação de Saque
- Interface para solicitar saques
- Validação de valores mínimos
- Cálculo de taxas
- Confirmação de transações

### Funções Principais

#### `copyLink()`
Copia o link de afiliado para a área de transferência do usuário.
```typescript
const copyLink = () => {
  // Copia o link para a área de transferência
  // Exibe feedback visual de sucesso
  // Registra evento de cópia
};
```

#### `handleChartOptions()`
Configura as opções de visualização do gráfico de desempenho.
```typescript
const chartOptions = {
  // Configurações responsivas
  // Escalas e formatação de eixos
  // Tooltips e legendas
  // Comportamento interativo
};
```

### Seções da Interface

1. **Cabeçalho**
   - Título do painel
   - Saudação personalizada
   - Gradiente visual de fundo
   
2. **Cards de Estatísticas**
   - Vendas Realizadas
   - Comissões Pendentes
   - Saldo Disponível (com botão de saque)
   - Taxa de Conversão
   
3. **Seção de Link de Afiliado**
   - Campo de texto com link
   - Botão de cópia
   - Instruções de uso
   
4. **Gráfico de Desempenho**
   - Visualização de ganhos mensais
   - Linha de tendência
   - Tooltips interativos
   - Escala dinâmica

### Integração com Chart.js

O componente utiliza a biblioteca Chart.js para renderizar o gráfico de desempenho, com as seguintes configurações:

```typescript
// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Configuração do gráfico
const chartData = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
  datasets: [{
    label: 'Ganhos Mensais',
    data: [1200, 1900, 2100, 2800, 2400, 3100, 3800],
    borderColor: '#2563eb',
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    pointBackgroundColor: '#2563eb',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6
  }]
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
   - Renderização condicional de componentes
   - Memoização de cálculos complexos
   - Carregamento otimizado do gráfico
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
   - Exibição parcial de informações sensíveis
   - Validação de permissões
   - Logs de atividades
   - Timeout de sessão

### Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Filtros avançados por período
   - Exportação de relatórios
   - Notificações em tempo real
   - Dashboard personalizado

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

2. **Ambiente**
   - Node.js
   - Configurações padrão
   - Variáveis de ambiente
   - Permissões básicas

## Manutenção

1. **Atualizações**
   - Verificar dados do gráfico
   - Atualizar taxas e comissões
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

2. **Gestão de Usuários**
   - Perfil de afiliado
   - Níveis de comissão
   - Histórico de atividades
   - Preferências

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

1. **Processo de Afiliação**
   - Registro como afiliado
   - Obtenção do link
   - Compartilhamento
   - Rastreamento de conversões

2. **Processo de Saque**
   - Verificação de saldo
   - Solicitação de saque
   - Confirmação
   - Acompanhamento

## Exemplos de Uso

1. **Compartilhamento de Link**
   ```typescript
   // Copiar link para área de transferência
   navigator.clipboard.writeText("https://www.freebet.pro.br/aff1234");
   
   // Exibir confirmação
   alert("Link copiado para a área de transferência!");
   ```

2. **Solicitação de Saque**
   ```typescript
   // Validar valor mínimo
   if (valorSaque < 50) {
     alert("O valor mínimo para saque é R$ 50,00");
     return;
   }
   
   // Processar solicitação
   processarSolicitacaoSaque(valorSaque);
   ```

## Considerações de Segurança

1. **Proteção de Dados**
   - Mascaramento parcial do link
   - Validação de origem
   - Proteção contra fraudes
   - Monitoramento de atividades suspeitas

2. **Validações Críticas**
   - Verificação de saldo antes do saque
   - Limites de transação
   - Proteção contra duplo clique
   - Confirmação de ações importantes

## Mensagens ao Usuário

1. **Confirmações**
   ```typescript
   // Cópia de link bem-sucedida
   "Link copiado para a área de transferência!"
   
   // Saque solicitado
   "Saque de R$ X,XX solicitado com sucesso!"
   ```

2. **Erros**
   ```typescript
   // Saldo insuficiente
   "Saldo insuficiente para realizar o saque."
   
   // Valor mínimo
   "O valor mínimo para saque é R$ 50,00."
   ```

## Configuração do Gráfico

O gráfico de desempenho utiliza as seguintes configurações:

```typescript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0,0,0,0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};
```

## Estrutura de Dados

1. **Dados de Afiliado**
   ```typescript
   interface AffiliateData {
     name: string;
     email: string;
     totalSales: number;
     pendingCommissions: number;
     availableBalance: number;
     conversionRate: number;
     affiliateLink: string;
   }
   ```

2. **Dados do Gráfico**
   ```typescript
   interface ChartData {
     labels: string[];
     datasets: {
       label: string;
       data: number[];
       borderColor: string;
       backgroundColor: string;
       // Outras propriedades visuais
     }[];
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