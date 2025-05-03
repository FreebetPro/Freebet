# Documentação da Calculadora Lay

## Visão Geral
O componente LayCalculator fornece uma interface para calcular apostas lay (contra) com retorno garantido, permitindo calcular os valores necessários para operações de trading esportivo usando exchanges de apostas.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface FormData {
  backOdds: string;
  backStake: string;
  useFreebet: boolean;
  layOdds: string;
  exchange: string;
}

interface Result {
  layStake: number | null;
  liability: number | null;
  backResult: number | null;
  layResult: number | null;
}
```

### Funcionalidades Principais

#### 1. Gestão de Apostas Back
- Input de odd back
- Valor da aposta back
- Opção de freebet
- Cálculo de retorno

#### 2. Gestão de Apostas Lay
- Input de odd lay
- Seleção de exchange
- Cálculo de liability
- Valor de lay necessário

#### 3. Configurações de Exchange
- Seleção de exchange
- Taxas de comissão
- Cálculos ajustados
- Resultados por cenário

### Funções Principais

#### `calculate()`
Calcula os valores da operação lay.
```typescript
const calculate = () => {
  // Valida inputs
  // Calcula stake lay
  // Calcula liability
  // Retorna resultados
};
```

#### `handleInputChange()`
Processa alterações nos inputs.
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Atualiza estado
  // Valida valores
  // Recalcula resultados
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de apostas
const [formData, setFormData] = useState({
  backOdds: '',
  backStake: '',
  useFreebet: false,
  layOdds: '',
  exchange: '6.5'
});

// Controle de resultados
const [result, setResult] = useState<Result | null>(null);
```

### Seções da Interface

1. **Aposta Back**
   - Odd back
   - Valor da aposta
   - Opção freebet
   - Validações

2. **Aposta Lay**
   - Odd lay
   - Exchange
   - Valor de lay
   - Liability

3. **Resultados**
   - Resultado na casa
   - Resultado na exchange
   - Lucro/Prejuízo
   - Análise por cenário

### Cálculos e Fórmulas

1. **Stake Lay (Normal)**
   ```
   layStake = (backStake * backOdds) / (layOdds - commission)
   ```

2. **Stake Lay (Freebet)**
   ```
   layStake = (backStake * (backOdds - 1)) / (layOdds - commission)
   ```

3. **Liability**
   ```
   liability = layStake * (layOdds - 1)
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
   - Mais exchanges
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

2. **Exchanges**
   - Taxas atualizadas
   - Limites de mercado
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
   - Seleção de exchange
   - Cálculo de valores
   - Exibição de resultados

2. **Validações**
   - Verificação de inputs
   - Análise de viabilidade
   - Cálculo de lucro
   - Confirmação de valores

## Exemplos de Uso

1. **Lay Normal**
   ```
   Back: Odd 2.00, Stake R$ 100,00
   Lay: Odd 2.10, Exchange 6.5%
   Lay Stake: R$ 102,13
   Liability: R$ 112,34
   ```

2. **Lay com Freebet**
   ```
   Back: Odd 2.00, Stake R$ 100,00 (Freebet)
   Lay: Odd 2.10, Exchange 6.5%
   Lay Stake: R$ 51,06
   Liability: R$ 56,17
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

   // Valor inválido
   'Por favor, insira um valor válido'

   // Exchange inválida
   'Selecione uma exchange válida'
   ```

2. **Erros de Cálculo**
   ```typescript
   // Lay impossível
   'Não é possível garantir lucro com essas odds'

   // Valor mínimo
   'O valor deve ser maior que o mínimo permitido'

   // Saldo insuficiente
   'Saldo insuficiente para realizar o lay'
   ```

## Fluxos de Trabalho

1. **Aposta Normal**
   - Insere odd back
   - Define valor back
   - Insere odd lay
   - Seleciona exchange
   - Calcula resultados

2. **Aposta Freebet**
   - Marca opção freebet
   - Insere odd back
   - Define valor freebet
   - Insere odd lay
   - Calcula resultados

## Dicas de Uso

1. **Otimização de Resultados**
   - Busque odds lay próximas às back
   - Considere as comissões
   - Verifique a liquidez
   - Monitore os resultados

2. **Prevenção de Erros**
   - Confirme os valores antes de operar
   - Verifique os limites
   - Considere as taxas
   - Analise os cenários