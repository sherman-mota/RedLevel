# 🛠️ Guia de Desenvolvimento e Operações — RedLevels

Bem-vindo ao manual operacional de desenvolvimento do **RedLevels**. Este guia descreve o setup do ambiente local de desenvolvimento, arquitetura do servidor proxy, depuração de conexões com o Redmine e boas práticas para expansão do sistema.

---

## 📂 1. Estrutura de Diretórios Resumida

Compreender a estrutura de arquivos ajudará a localizar rapidamente onde cada módulo reside no repositório:

```
redlevel/
├── docs/                      # Documentação técnica e de produto
│   ├── ARCHITECTURE.md        # Especificação detalhada de software
│   └── PRD.md                 # Documento de Requisitos do Produto
├── public/                    # Assets estáticos globais e favicons
├── src/                       # Código-fonte da aplicação React
│   ├── api/                   # Integração com Redmine API e mocks
│   │   ├── redmine.ts         # Handshake, queries e parsers
│   │   └── mockData.ts        # Massa de testes de alta fidelidade
│   ├── components/            # Componentes modulares e reutilizáveis
│   │   ├── KanbanBoard.tsx    # Níveis de voo L3, L2 e L1
│   │   ├── DependencyMap.tsx  # Grafo interativo de dependências
│   │   └── MetricsDashboard.tsx # Dashboards e relatórios de fluxo
│   ├── App.tsx                # Gerenciador de rotas e abas do Hub
│   ├── main.tsx               # Ponto de entrada do React
│   └── types.ts               # Tipagens TypeScript do domínio
├── server.cjs                 # Servidor Proxy reverso Node.js / Express
├── tsconfig.json              # Configurações do compilador TypeScript
└── vite.config.ts             # Configuração de build e plugins do Vite
```

---

## 🚀 2. Modos de Execução da Aplicação

O RedLevels pode ser executado em dois modos distintos de acordo com a necessidade do desenvolvedor:

### A. Modo de Demonstração (Standalone Vite)
Ideal para prototipagem de UI, testes de performance e design de novos gráficos. Não requer servidor Redmine ativo e utiliza dados simulados de alta complexidade em [mockData.ts](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/mockData.ts).

1.  **Instalação:**
    ```bash
    npm install
    ```
2.  **Executar Dev-Server:**
    ```bash
    npm run dev
    ```
3.  **Acesso:** Abra `http://localhost:3000` no seu navegador. Ative a opção **"Usar Workspace de Demonstração (Dados Simulados)"** no painel lateral de configurações para habilitar a visualização.

---

### B. Modo Integrado Corporativo (Com Proxy CORS)
Essencial para integrar a aplicação com um servidor Redmine real instalado em sua rede corporativa ou nuvem. Este modo inicializa o servidor Node.js proxy que contorna as restrições de segurança do navegador.

1.  **Instalar dependências** (caso não tenha feito):
    ```bash
    npm install
    ```
2.  **Executar Servidor Proxy Integrado:**
    ```bash
    npm run serve
    ```
    Este script inicia o servidor em `server.cjs`, mapeando a porta padrão `http://localhost:4173`.
3.  **Configurar Conexão no Painel:**
    *   No menu lateral do aplicativo, vá em **Configurações de Sincronia**.
    *   Desmarque **"Usar Workspace de Demonstração"**.
    *   Insira a **URL do seu Servidor Redmine** (ex: `https://redmine.minhaempresa.com`).
    *   Insira a sua **Chave de API do Redmine** (Token pessoal disponível em sua conta no Redmine em *Minha Conta* -> *Chave de acesso API*).
    *   Clique em **Testar Conectividade**.

---

## 📡 3. Detalhes de Integração e Campos Personalizados

Para usufruir de todas as capacidades de visualização do RedLevels, é altamente recomendado configurar os campos personalizados correspondentes no seu Redmine para que o mapeador faça a leitura correta.

Abaixo estão as especificações dos campos customizados que devem ser criados no Redmine:

### A. Campo de Impedimentos (`blocked`)
*   **Nome no Redmine:** `Impedimento` ou `Blocked`
*   **Tipo de Campo:** `Lista` (valores: `Sim`, `Não`) ou `Booleano`
*   **Mapeamento nas Configurações:** Informe o nome exato deste campo no input **Campo Customizado de Bloqueio** do RedLevels.

### B. Campo de Motivo do Impedimento (`blockedReason`)
*   **Nome no Redmine:** `Motivo do Impedimento`
*   **Tipo de Campo:** `Texto longo` ou `Texto simples`
*   **Mapeamento nas Configurações:** Informe o nome deste campo no input **Campo Customizado de Motivo de Bloqueio** nas configurações.

### C. Campo de Time/Squad (`team`)
*   **Nome no Redmine:** `Squad` ou `Time`
*   **Tipo de Campo:** `Lista` ou `Texto simples`
*   **Mapeamento nas Configurações:** Utilizado para associar tarefas a squads no nível L1 e L2.

### D. Agrupador de Raias L2 (`groupingField`)
*   **Nome no Redmine:** `Area de Negocio` ou `Frente de Trabalho`
*   **Mapeamento nas Configurações:** Define qual campo será o indexador para separar o Flight Level 2 em raias horizontais (*Swimlanes*).

---

## 🔍 4. Guia de Resolução de Problemas (Troubleshooting)

### ❌ Erro de Conexão: "NetworkError" ou "Failed to fetch" ao conectar ao Redmine
*   **Causa:** Você está executando a aplicação no modo standalone (`npm run dev`) na porta 3000 e tentando fazer requisições a um Redmine externo. O navegador bloqueia por CORS devido à ausência do proxy.
*   **Resolução:** Encerre o terminal e inicie a aplicação com `npm run serve`. Acesse o sistema na porta correta (`http://localhost:4173`).

### ❌ Quadro L1, L2 ou L3 vazio após conectar ao Redmine
*   **Causa 1:** Mapeamento incorreto de Trackers nas configurações. Se o RedLevels não encontrar tarefas associadas exatamente aos trackers mapeados, ele retornará zero itens.
*   **Resolução 1:** Verifique em *Configurações* se os nomes dos trackers estão escritos de forma idêntica ao Redmine (letras maiúsculas/minúsculas importam).
*   **Causa 2:** O usuário autenticado pela chave de API não tem permissão para visualizar os projetos ou tarefas associadas no Redmine.
*   **Resolução 2:** Tente acessar a rota `/issues.json` direto no navegador logado no Redmine para testar se há retorno de dados.

### ❌ Acentuação e Caracteres Especiais no Proxy
*   **Causa:** URL do Redmine enviada com caracteres especiais sem a devida codificação HTTP.
*   **Resolução:** A aplicação cliente sempre passa a URL convertida usando `encodeURIComponent()`. Certifique-se de não haver espaços em branco no campo de URL do painel de configurações.

---

## 🎨 5. Padrão de Estilos e Layouts (Aesthetics & Theme)

O RedLevels adota a **Enterprise Corporate Red Palette**. Ao desenvolver novos componentes, siga fielmente a cartilha de estilo abaixo:

1.  **Evite ad-hoc classes:** Use utilitários flexíveis e tokens de cores do Tailwind baseados na paleta existente.
2.  **Não quebre o Light Mode:** A interface corporativa é majoritariamente baseada em tons claros off-white para legibilidade de dados. Elementos escuros devem ser usados apenas em detalhes como Sidebars recolhidas ou modais destacados.
3.  **Transições de Estado:** Sempre use `<motion.div>` da biblioteca Motion para transições de hover, expansão de menus e filtros de tarefas, mantendo uma sensação premium e fluida para o usuário.
