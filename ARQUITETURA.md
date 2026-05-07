# Estrutura de Pastas - Lanchonete App

## Organização do Projeto

```
src/
├── pages/                      # Páginas HTML
│   ├── index.html             # Página de login
│   ├── cliente.html           # Página do cliente
│   ├── admin.html             # Página do admin
│   ├── cozinheiro.html        # Página do cozinheiro
│   └── atendente.html         # Página do atendente
│
├── js/                         # Scripts JavaScript
│   ├── auth/                  # Autenticação
│   │   ├── auth.js            # Funções de autenticação
│   │   └── login.js           # Lógica da página de login
│   │
│   ├── services/              # Serviços e API
│   │   └── dataService.js     # Carregamento e gerenciamento de dados
│   │
│   ├── pages/                 # Scripts das páginas
│   │   ├── cliente.js         # Lógica do cliente
│   │   ├── admin.js           # Lógica do admin
│   │   ├── cozinheiro.js      # Lógica do cozinheiro
│   │   └── atendente.js       # Lógica do atendente
│   │
│   └── utils/                 # Utilitários
│       └── storage.js         # Gerenciamento de localStorage
│
├── styles/                     # Estilos CSS
│   └── style.css              # Estilos globais
│
├── data/                       # Dados JSON (banco de dados mock)
│   ├── usuarios.json          # Dados de usuários
│   ├── produtos.json          # Dados de produtos
│   ├── store.json             # Dados de lojas
│   ├── order.json             # Dados de pedidos
│   └── loyalty.json           # Dados de fidelidade
│
└── README.md                  # Este arquivo
```

## Padrões de Arquitetura

### 1. **Separação de Responsabilidades**
- **Pages**: HTMLs puros, sem lógica
- **Auth**: Autenticação e autorização
- **Services**: Comunicação com dados
- **Pages (JS)**: Lógica específica da página
- **Utils**: Funções reutilizáveis

### 2. **Fluxo de Aplicação**
```
index.html (Login)
  ↓
[Validação de Credenciais]
  ↓
[Salva usuário em localStorage]
  ↓
[Redirecionamento por tipo]
  ↓
Página específica (cliente, admin, etc)
```

### 3. **Hierarquia de Importação de Scripts**
Cada página HTML importa:
1. `dataService.js` - Carrega dados
2. `storage.js` - Funções de localStorage
3. `auth.js` - Funções de autenticação
4. Arquivo JS específico da página

### 4. **Tipos de Usuário**
- **admin**: Painel administrativo
- **cliente**: Sistema de pedidos e pontos
- **cozinheiro**: Gerenciamento de preparação
- **atendente**: Gerenciamento de atendimento

## Boas Práticas Implementadas

✅ **DRY (Don't Repeat Yourself)**: Código compartilhado em services e utils
✅ **Single Responsibility**: Cada arquivo tem uma responsabilidade
✅ **Modularidade**: Fácil adicionar novas features
✅ **Segurança**: Validação de tipo de usuário em cada página
✅ **Manutenibilidade**: Código organizado e comentado

## Como Adicionar Nova Feature

### 1. Novo Tipo de Usuário:
- Adicionar em `usuarios.json`
- Criar `novoTipo.html` em `/pages`
- Criar `novoTipo.js` em `/js/pages`
- Adicionar rota em `auth.js`

### 2. Novo Serviço:
- Criar arquivo em `/js/services/novoService.js`
- Exportar funções para uso em `dataService.js`

### 3. Novo Utilitário:
- Criar arquivo em `/js/utils/novoUtil.js`
- Importar conforme necessário

## Dados Mock (JSON)

Todos os dados são armazenados em JSON na pasta `/data`:
- Modificáveis para testes
- Fácil visualização da estrutura
- Pronto para migração para API real

## Próximos Passos

- [ ] Integração com banco de dados real
- [ ] API REST para substituir JSONs
- [ ] Autenticação JWT
- [ ] Testes unitários
- [ ] Deploy em produção