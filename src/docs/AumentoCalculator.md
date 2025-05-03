# Documentação da Calculadora de Aumento 25%

## Visão Geral
O componente AumentoCalculator fornece uma interface para calcular apostas com aumento de odds, permitindo distribuir valores entre múltiplas casas de apostas e calcular lucros garantidos.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface House {
  odd: string;
  boost: string;
  stake: string;
  commission: boolean;
  commissionValue: string;
  freebet: boolean;
  fixedStake: boolean;
}

interface Results {
  results: {
    stake: number;
    profit: number;
  }[];
  totalStake: number;
  roi: number;
}
```

### Funcionalidades Principais

#### 1. Gestão de Casas
- Configuração de 2 a 5 casas
- Definição de odds
- Configuração de aumento
- Controle de stakes

#### 2. Cálculos Automáticos
- Cálculo de odds finais
- Distribuição de stakes
- Cálculo de lucro
- Análise de ROI

#### 3. Configurações Avançadas
- Comissões por casa
- Modo freebet
- Stakes fixas
- Proteções

### Funções Principais

#### `calculateFinalOdd()`
Calcula a odd final após aplicar o aumento.
```typescript
const calculateFinalOdd = (odd: string, boost: string) => {
  // Converte valores para números
  // Aplica fórmula de aumento
  // Retorna odd final
};
```

#### `calculateStake()`
Calcula o stake necessário para cada casa.
```typescript
const calculateStake = (odd: string, boost: string, index: number) => {
  // Verifica se é primeira casa
  // Calcula stake proporcional
  // Aplica comissões se necessário
  // Retorna valor formatado
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de casas
const [numHouses, setNumHouses] = useState(2);
const [houses, setHouses] = useState<House[]>([]);

// Controle de valores
const baseStake = 100;
const [results, setResults] = useState<Results | null>(null);
```

### Seções da Interface

1. **Configurações**
   - Seleção de número de casas
   - Configurações gerais
   - Opções avançadas

2. **Casas de Apostas**
   - Odds e aumentos
   - Stakes e comissões
   - Opções por casa

3. **Resultados**
   - Tabela de resultados
   - Métricas gerais
   - Análise de lucro

### Cálculos e Fórmulas

1. **Odd Final**
   ```
   oddFinal = odd + ((odd - 1) * boost / 100)
   ```

2. **Stake Proporcional**
   ```
   stake = (firstHouseStake / finalOdd) * firstHouseFinalOdd
   ```

3. **ROI**
   ```
   roi = (profit / totalStake) * 100
   ```

### Tratamento de Erros

O componente implementa diversos mecanismos de segurança:
- Validação de inputs
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
   - Mais tipos de aumento
   - Templates salvos
   - Histórico de cálculos
   - Exportação de dados

2. **Otimizações Previstas**
   - Interface aprimorada
   - Mais configurações
   - Análises avançadas
   - Integrações

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
   - Promoções ativas
   - Limites de stake

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
   - Aplicação de aumento
   - Cálculo de stakes
   - Exibição de resultados

2. **Validações**
   - Verificação de inputs
   - Cálculo de viabilidade
   - Análise de lucro
   - Confirmação de valores

## Exemplos de Uso

1. **Aumento Simples**
   ```
   Odd original: 2.00
   Aumento: 25%
   Odd final: 2.25
   ```

2. **Cálculo Completo**
   ```
   Casa 1: Odd 2.00 (+25%) = 2.25
   Casa 2: Odd 1.80 = 1.80
   Stake 1: R$ 100,00
   Stake 2: R$ 125,00
   Lucro: R$ 25,00
   ROI: 11,11%
   ```