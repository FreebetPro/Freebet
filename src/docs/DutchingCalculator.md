# Documentação da Calculadora Dutching

## Visão Geral
O componente DutchingCalculator fornece uma interface para calcular apostas dutching, permitindo distribuir valores entre múltiplos resultados para garantir um retorno específico independente do resultado.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface Bet {
  odd: number;
  stake: number;
}

interface DutchingResult {
  percentages: number[];
  stakes: number[];
  profit: number;
  finalResult: number;
  bookmakerMargin?: number;
  outcomes?: number[];
}
```

### Funcionalidades Principais

#### 1. Gestão de Apostas
- Adição dinâmica de odds
- Cálculo de stakes
- Distribuição de valores
- Análise de viabilidade

#### 2. Cálculos Automáticos
- Distribuição proporcional
- Cálculo de margem
- Análise de retorno
- Validações de segurança

#### 3. Configurações Avançadas
- Comissão do bookmaker
- Arredondamento de stakes
- Valor total da operação
- Análise de resultados

### Funções Principais

#### `calculateDutching()`
Calcula a distribuição de stakes e resultados.
```typescript
const calculateDutching = () => {
  // Valida inputs
  // Calcula distribuição
  // Verifica viabilidade
  // Retorna resultados
};
```

#### `handleCurrencyInput()`
Processa entrada de valores monetários.
```typescript
const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Formata valor
  // Remove caracteres inválidos
  // Atualiza estado
  // Recalcula resultados
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de apostas
const [totalStake, setTotalStake] = useState<string>('');
const [commission, setCommission] = useState<string>('0');
const [roundTo, setRoundTo] = useState<string>('0.01');
const [odds, setOdds] = useState<string[]>(['', '']);

// Controle de resultados
const [result, setResult] = useState<DutchingResult | null>(null);
const [error, setError] = useState<string | null>(null);
```

### Seções da Interface

1. **Configuração de Odds**
   - Input de odds
   - Adição/remoção de odds
   - Validações em tempo real
   - Feedback visual

2. **Configurações Gerais**
   - Valor total da operação
   - Comissão do bookmaker
   - Arredondamento de valores
   - Opções avançadas

3. **Resultados**
   - Distribuição de stakes
   - Análise de retorno
   - Margem do bookmaker
   - Cenários possíveis

### Cálculos e Fórmulas

1. **Distribuição de Stakes**
   ```
   stake = (total * (1/odd)) / soma(1/odds)
   ```

2. **Margem do Bookmaker**
   ```
   margin = (1 - (1/surebet)) * 100
   ```

3. **Retorno por Resultado**
   ```
   return = stake * odd - totalStake
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

1. **Dutching Simples**
   ```
   Valor Total: R$ 1.000,00
   Odd 1: 3.00 - Stake: R$ 333,33
   Odd 2: 3.00 - Stake: R$ 333,33
   Odd 3: 3.00 - Stake: R$ 333,34
   Retorno: R$ 1.000,00
   ```

2. **Dutching com Comissão**
   ```
   Valor Total: R$ 1.000,00
   Comissão: 5%
   Odd 1: 2.00 - Stake: R$ 526,32
   Odd 2: 2.00 - Stake: R$ 473,68
   Retorno: R$ 950,00
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

## Mensagens de Erro

1. **Erros de Validação**
   ```typescript
   // Odds inválidas
   'Por favor, insira odds válidas maiores que 1'

   // Valor total inválido
   'Por favor, insira um valor total válido'

   // Comissão inválida
   'A comissão deve estar entre 0% e 100%'
   ```

2. **Erros de Cálculo**
   ```typescript
   // Dutching impossível
   'Não é possível garantir lucro com essas odds e comissão'

   // Valor mínimo
   'O valor total deve ser maior que o mínimo permitido'

   // Odds insuficientes
   'Por favor, insira pelo menos duas odds'
   ```

## Fluxos de Trabalho

1. **Adição de Odds**
   - Usuário insere odds
   - Sistema valida valores
   - Atualiza distribuição
   - Mostra resultados

2. **Configuração de Valores**
   - Define valor total
   - Ajusta comissão
   - Configura arredondamento
   - Calcula distribuição

3. **Análise de Resultados**
   - Verifica viabilidade
   - Mostra distribuição
   - Exibe retornos
   - Indica riscos

## Dicas de Uso

1. **Otimização de Resultados**
   - Ajuste as odds para melhor distribuição
   - Considere a comissão no cálculo
   - Verifique os arredondamentos
   - Analise todos os cenários

2. **Prevenção de Erros**
   - Verifique os valores antes de confirmar
   - Atente aos limites das casas
   - Considere as comissões
   - Monitore os resultados