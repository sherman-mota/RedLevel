# RedLevels - Flight Levels Management System

**RedLevels** é um sistema corporativo de gestão visual e métricas de alta performance baseado na metodologia de **Flight Levels** integrada em tempo real com o **Redmine**. 

O principal objetivo do RedLevels é fornecer visibilidade ponta a ponta sobre o fluxo de entrega de valor de uma corporação, traduzindo grandes objetivos estratégicos (L3) em rotas de coordenação tática (L2) e tarefas diárias de execução operacional (L1).

---

## 🎨 Design System & Identidade Visual
O RedLevels adota a **Enterprise Corporate Red Palette**, estruturada de forma clara, moderna e com foco em alta legibilidade:
- **Tema Light & Claro:** Fundos leves em tons suaves de off-white e cinza, que preservam o conforto visual durante longas horas de análise corporativa.
- **Destaques de Marca:** Acentos finos e focados baseados em vermelho corporativo (`#8a2d46`) e tonalidades de rosa suave.
- **Tipografia:** Tipografia sofisticada de alta legibilidade corporativa utilizando a família de fontes **Inter** com elementos lógicos em mono-espaçado para IDs de tarefas e strings de integração do Redmine.
- No-Larping visual: Interface focada em dados práticos, eliminando ruídos técnicos, consoles simulados ou dados de rede irrelevantes.

---

## 🚀 Principais Módulos do Sistema

### 1. Visão Geral (Overview Hub)
Apresenta de forma vertical os blocos interativos dos três níveis de voo (**L3**, **L2**, **L1**). Cada seção do Hub exibe indicadores quantitativos instantâneos de itens ativos e impedimentos bloqueantes das equipes de entrega.

### 2. Quadro Kanban (Flight Boards)
Quadros customizados para cada nível de voo:
- **Flight Level 3 (Estratégico):** Monitoramento de metas anuais e de longo prazo.
- **Flight Level 2 (Coordenação):** Suporte avançado a raias horizontais (*Swimlanes*) parametrizáveis pelo campo customizado pré-definido, isolando dependências entre múltiplas equipes.
- **Flight Level 1 (Operacional):** Quadro altamente focado na operação diária com compactação automática e display consolidado de carga via mapa de densidade (*Dot Matrix*).

### 3. Mapa de Dependências Globais
Um visualizador de conexões que rastreia dependências e impedimentos inter-squad (*blocked-by* e relações *parent-child*), permitindo que gerentes identifiquem gargalos em rota crítica do portfólio.

### 4. Painel de Métricas Avançadas
Gráficos e indicadores automatizados com as principais métricas de agilidade e fluxo:
- **Lead Time Histórico** (Distribuição de duração de entrega).
- **Throughput semanal/mensal** (Vazão de itens finalizados).
- **WIP Age Ativo** (Sinalização preditiva de gargalos e cartões inativos bloqueados na fila).
- **CFD (Cumulative Flow Diagram)** (Acompanhamento e saúde do fluxo operativo).

### 5. Painel de Configurações das Sincronias Redmine
Módulo inteligente para mapeamento flexível de segurança, parametrização de servidores, associação flexível de trackers para cada Flight Level, e conversores de ciclos de status do Redmine para os estágios padrões de agilidade.

---

## 📂 Estrutura de Documentos do Sistema
A documentação completa de especificações e casos de uso do sistema foi consolidada sob a pasta `/docs`:
- 📄 [**docs/PRD.md**](./docs/PRD.md) - Documento de Requisitos do Produto, detalhando objetivos, regras de negócio e a arquitetura de sincronização integrada com o Redmine.
- 📄 [**docs/USER_STORIES.md**](./docs/USER_STORIES.md) - Compilado de Histórias de Usuário ágeis segmentadas por persona e com critérios de aceitação refinados.

---

## 🛠️ Tecnologias Utilizadas
A aplicação foi construída com um ecossistema robusto, responsivo e performático:
- **Frontend Core:** [React 18](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Vite:** Build Rápido e Dev-Server ágil.
- **Tailwind CSS:** Construção de utilitários rápidos e ágeis baseados na paleta light corporativa.
- **Motion:** Biblioteca otimizada para transições e micro-interações de navegação.
- **Recharts / D3:** Dashboards de alta fidelidade para métricas de agilidade.
- **Lucide React:** Ícones vetoriais modernos e legíveis.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
*   Node.js instalado (v18 ou superior recomendado)
*   NPM (gerenciador de pacotes padrão)

### Instalação de Dependências
Para instalar todas as dependências do projeto contidas no `package.json`, execute:
```bash
npm install
```

### Rodar Servidor de Desenvolvimento
Inicie a aplicação localmente no endereço e porta padrões (`http://localhost:3000`):
```bash
npm run dev
```

### Gerar Build Estático de Produção
Para compilar e otimizar a aplicação para distribuição em produção:
```bash
npm run build
```
O build final e compactado será gerado de forma estática dentro do subdiretório `dist/`.
