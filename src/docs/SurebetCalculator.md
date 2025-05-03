# Documentação da Calculadora Surebet

## Visão Geral
O componente SurebetCalculator fornece uma interface para calcular apostas seguras (surebets) entre múltiplas casas de apostas, permitindo identificar oportunidades de lucro garantido através de arbitragem.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface Bet {
  odd: number;
  stake: number;
}

interface SurebetResult {
  percentages: number[];
  totalStake: number;
  profit: number;
  finalResult: number;
  resultPercentage: number;
}
```

### Funcionalidades Principais

#### 1. Gestão de Apostas
- Adição dinâmica de apostas
- Configuração de odds
- Distribuição de stakes
- Cálculo de lucro garantido

#### 2. Cálculos Automáticos
- Verificação de viabilidade
- Distribuição proporcional
- Cálculo de lucro
- Análise de ROI

#### 3. Configurações Avançadas
- Valor total da operação
- Distribuição automática
- Análise de resultados
- Validações de segurança

### Funções Principais

#### `calculateSurebet()`
Calcula a viabilidade e resultados da surebet.
```typescript
const calculateSurebet = () => {
  // Valida odds e valores
  // Calcula probabilidades
  // Distribui stakes
  // Retorna resultados
};
```

#### `distributeTotalBet()`
Distribui o valor total entre as apostas.
```typescript
const distributeTotalBet = () => {
  // Valida valor total
  // Calcula proporções
  // Distribui valores
  // Atualiza interface
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de apostas
const [bets, setBets] = useState<Array<{ odd: string; stake: string }>>([]);
const [totalBet, setTotalBet] = useState('');

// Controle de resultados
const [result, setResult] = useState<SurebetResult | null>(null);
```

### Seções da Interface

1. **Configuração de Apostas**
   - Input de odds
   - Valores de stake
   - Adição/remoção de apostas
   - Distribuição automática

2. **Resultados**
   - Viabilidade da operação
   - Lucro esperado
   - ROI calculado
   - Distribuição percentual

### Cálculos e Fórmulas

1. **Verificação de Surebet**
   ```
   surebet = soma(1/odd) < 1
   ```

2. **Distribuição de Stakes**
   ```
   stake = (totalStake * (1/odd)) / soma(1/odds)
   ```

3. **Cálculo de ROI**
   ```
   roi = (profit / totalStake) * 100
   ```

### Tratamento de Erros

O componente implementa diversos mecanismos de segurança:
- Validação de odds
- Verificação de valores
- Feedback visual
- Prevenção de erros

### Considerações de Performance

1. **Otimizações**
   - Cálculos eficientes
   - Estados otimizados
   - Atualizações seletivas
   - Cache de resultados

2. **Boas Práticas**
   - Componentes modulares
   - Estados bem gerenciados
   - Feedback imediato
   - Design responsivo

### Segurança

1. **Validações**
   - Verificação de odds
   - Validação de stakes
   - Proteção contra erros
   - Limites de valores

2. **Proteção de Dados**
   - Formatação correta
   - Arredondamentos seguros
   - Prevenção de overflow
   - Validações numéricas

### Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Histórico de cálculos
   - Templates salvos
   - Exportação de dados
   - Análises avançadas

2. **Otimizações Previstas**
   - Interface aprimorada
   - Mais configurações
   - Integrações
   - Automações

## Notas de Implementação

1. **Dependências**
   - React para interface
   - Tailwind para estilos
   - Lucide para ícones
   - Formatação de moeda

2. **Ambiente**
   - Node.js
   - Configurações padrão
   - Variáveis de ambiente
   - Permissões básicas

## Manutenção

1. **Atualizações**
   - Verificar fórmulas
   - Testar cálculos
   - Validar resultados
   - Backup de configurações

2. **Monitoramento**
   - Logs de uso
   - Métricas de acesso
   - Performance
   - Erros e exceções

## Integração com Outros Módulos

1. **Registro de Operações**
   - Uso em operações
   - Histórico de cálculos
   - Análise de resultados

2. **Casas de Apostas**
   - Odds atuais
   - Limites de stake
   - Restrições operacionais

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

## Fluxos de Cálculo

1. **Processo Principal**
   - Input de odds
   - Verificação de viabilidade
   - Distribuição de stakes
   - Exibição de resultados

2. **Validações**
   - Verificação de inputs
   - Análise de viabilidade
   - Cálculo de lucro
   - Confirmação de valores

## Exemplos de Uso

1. **Surebet Simples**
   ```
   Casa 1: Odd 2.00, Stake R$ 100,00
   Casa 2: Odd 2.10, Stake R$ 95,24
   Total: R$ 195,24
   Lucro: R$ 4,76
   ROI: 2,44%
   ```

2. **Surebet Múltipla**
   ```
   Casa 1: Odd 3.00, Stake R$ 66,67
   Casa 2: Odd 3.50, Stake R$ 57,14
   Casa 3: Odd 4.00, Stake R$ 50,00
   Total: R$ 173,81
   Lucro: R$ 26,19
   ROI: 15,07%
   ```

## Considerações de Segurança

1. **Validações Críticas**
   - Verificação de odds mínimas
   - Limites de stake
   - Proteção contra erros
   - Validação de resultados

2. **Proteção Operacional**
   - Confirmação de valores
   - Alertas de risco
   - Limites operacionais
   - Logs de operações