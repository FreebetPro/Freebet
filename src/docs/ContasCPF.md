# Documentação da Página de Contas CPF

## Visão Geral
O componente CPFAccounts fornece uma interface completa para gerenciamento de contas CPF, permitindo cadastro, monitoramento e controle de status de verificação de contas em diferentes casas de apostas.

## Estrutura do Componente

### Interfaces Principais
```typescript
interface Account {
  id: string;
  item: number;
  responsavel: string;
  status: string;
  name: string;
  cpf: string;
  birth_date: string;
  address: string | null;
  phone: string | null;
  email1: string | null;
  password1: string | null;
  chip: string | null;
  verification: string | null;
  created_at: string;
  updated_at: string;
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
}
```

### Funcionalidades Principais

#### 1. Gestão de Contas
- Cadastro de novas contas
- Edição de dados cadastrais
- Monitoramento de status
- Histórico de alterações

#### 2. Verificação de Contas
- Controle de status de verificação
- Processo de validação
- Acompanhamento de documentação
- Histórico de verificações

#### 3. Integração com Casas de Apostas
- Vinculação de contas
- Status por casa de apostas
- Monitoramento de saldos
- Controle de acessos

### Funções Principais

#### `handleAccountSubmit()`
Processa o cadastro ou atualização de uma conta.
```typescript
const handleAccountSubmit = async () => {
  // Valida dados da conta
  // Processa documentos
  // Registra no banco
  // Atualiza interface
};
```

#### `handleVerificationUpdate()`
Atualiza o status de verificação de uma conta.
```typescript
const handleVerificationUpdate = async () => {
  // Verifica documentação
  // Atualiza status
  // Notifica responsável
  // Registra histórico
};
```

### Estados do Componente

#### Estado Principal
```typescript
// Controle de contas
const [accounts, setAccounts] = useState<Account[]>([]);
const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

// Controle de UI
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('');

// Controle de modais
const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
```

### Seções da Interface

1. **Cabeçalho**
   - Título e descrição
   - Botões de ação
   - Filtros e busca

2. **Lista de Contas**
   - Dados principais
   - Status de verificação
   - Ações disponíveis
   - Paginação

3. **Modais de Gestão**
   - Formulário de cadastro
   - Edição de dados
   - Verificação de documentos
   - Histórico de alterações

### Modais e Formulários

1. **Modal de Cadastro**
   - Dados pessoais
   - Documentos necessários
   - Informações de contato
   - Dados de acesso

2. **Modal de Edição**
   - Atualização de dados
   - Status de verificação
   - Observações
   - Histórico

### Tratamento de Erros

O componente implementa diversos mecanismos de segurança:
- Validação de CPF
- Verificação de documentos
- Feedback visual
- Logs de erros

### Considerações de Performance

1. **Otimizações**
   - Paginação eficiente
   - Caching de dados
   - Lazy loading
   - Debounce em buscas

2. **Boas Práticas**
   - Componentes modulares
   - Estados otimizados
   - Feedback imediato
   - Design responsivo

### Segurança

1. **Validações**
   - Verificação de CPF
   - Validação de dados
   - Proteção de informações
   - Controle de acesso

2. **Proteção de Dados**
   - Criptografia
   - Mascaramento
   - Logs de acesso
   - Backups

### Melhorias Futuras

1. **Funcionalidades Planejadas**
   - Verificação automática
   - OCR de documentos
   - Integração com bureaus
   - Automação de processos

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

2. **Casas de Apostas**
   - Status por casa
   - Verificações específicas
   - Histórico de uso

3. **Operações**
   - Vinculação em operações
   - Controle de stakes
   - Histórico operacional