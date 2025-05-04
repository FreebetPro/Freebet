# Documentação da Página QR Code e Casas de Apostas

## Visão Geral
O componente BettingHousesPage fornece uma interface completa para gerenciar contas em diferentes casas de apostas, permitindo gerar QR Codes para depósitos e monitorar saldos.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface BettingHouse {
  id: string;
  name: string;
  accounts: AccountBettingHouse[];
}

interface AccountBettingHouse {
  id: string;
  account_id: string;
  betting_house_id: string;
  status: string;
  verification: string;
  saldo: string;
  deposito: string;
  sacado: string;
  creditos: string;
  obs: string;
  account: {
    cpf: string;
    name: string;
    email1: string;
    password: string;
  };
}
```

### Funcionalidades Principais

#### 1. Gerenciamento de Casas de Apostas
- Listagem de todas as casas disponíveis
- Seleção de casa para visualização de contas
- Filtros e busca por:
  - CPF
  - Nome
  - Status da conta
- Paginação e controle de registros por página

#### 2. Gerenciamento de Depósitos
- Geração de QR Code individual
- Depósito automático via QR
- Depósito em massa para múltiplas contas
- Controle de valores por conta

#### 3. Monitoramento de Saldos
- Atualização de saldo individual
- Consulta de saldo geral
- Histórico de transações
- Exportação de dados

### Funções Principais

#### `handleRefreshBalance(accountId: string)`
Atualiza o saldo de uma conta específica.
```typescript
const handleRefreshBalance = async (accountId: string) => {
  // Simula chamada ao robô para captura de saldo
  // Atualiza interface com novo saldo
  // Exibe feedback visual
};
```

#### `handleDepositValueChange(accountId: string, value: string)`
Gerencia alterações nos valores de depósito.
```typescript
const handleDepositValueChange = (accountId: string, value: string) => {
  // Formata valor para moeda
  // Atualiza estado do componente
  // Valida limites e restrições
};
```

#### `handleGenerateQRCode(accountId: string)`
Gera QR Code para depósito.
```typescript
const handleGenerateQRCode = async (accountId: string) => {
  // Valida valor do depósito
  // Gera QR Code
  // Armazena código gerado
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de casas
const [selectedHouse, setSelectedHouse] = useState<string>('');
const [bettingHouses, setBettingHouses] = useState<BettingHouse[]>([]);

// Controle de UI
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [selectedStatus, setSelectedStatus] = useState('');

// Controle de valores
const [totalBalance, setTotalBalance] = useState(0);
const [depositValues, setDepositValues] = useState<Record<string, string>>({});
```

### Modais e Popups

1. **Modal de Depósito Individual**
   - Exibe informações da conta
   - Permite inserir valor
   - Gera QR Code

2. **Modal de Depósito em Massa**
   - Seleção múltipla de contas
   - Valor único para todas as contas
   - Geração em lote de QR Codes

3. **Modal de Depósito Automático**
   - Explicação do processo
   - Redirecionamento para Fintech
   - Tutorial em vídeo

### Tratamento de Erros

O componente implementa diversos mecanismos de segurança:
- Validação de valores de depósito
- Confirmação de operações críticas
- Feedback visual de erros
- Tratamento de falhas de API

### Considerações de Performance

1. **Otimizações**
   - Paginação eficiente
   - Debounce em buscas
   - Caching de dados
   - Atualizações seletivas

2. **Boas Práticas**
   - Componentes modularizados
   - Estados bem gerenciados
   - Feedback imediato ao usuário
   - Design responsivo

### Segurança

1. **Validações**
   - Verificação de saldos
   - Confirmação de operações
   - Proteção contra duplo clique
   - Validação de valores

2. **Proteção de Dados**
   - Mascaramento de informações sensíveis
   - Validação de permissões
   - Logs de operações
   - Confirmações de segurança

### Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Relatórios detalhados
   - Exportação de dados
   - Filtros avançados
   - Automação de operações

2. **Otimizações Previstas**
   - Cache aprimorado
   - Melhor feedback visual
   - Mais opções de customização
   - Integração com outros módulos

## Notas de Implementação

1. **Dependências**
   - Supabase para banco de dados
   - React para interface
   - Tailwind para estilos
   - Lucide para ícones

2. **Ambiente**
   - Requer Node.js
   - Configuração do Supabase
   - Variáveis de ambiente
   - Permissões adequadas

## Manutenção

1. **Atualizações**
   - Verificar dependências
   - Testar novas funcionalidades
   - Manter documentação
   - Backup de dados

2. **Monitoramento**
   - Logs de operações
   - Métricas de uso
   - Performance
   - Erros e exceções