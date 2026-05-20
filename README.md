# 🔴 RedLevels — Flight Levels Management System

**RedLevels** é um sistema corporativo de gestão visual e métricas de alta performance, baseado na metodologia de **Flight Levels** e integrado em tempo real com o **Redmine** via API segura. 

O principal objetivo do RedLevels é fornecer visibilidade de ponta a ponta sobre o fluxo de entrega de valor de uma corporação, traduzindo grandes objetivos estratégicos (L3) em rotas de coordenação tática (L2) e tarefas diárias de execução operacional (L1).

---

## 🎨 Design System & Identidade Visual

O RedLevels adota o **Enterprise Corporate Red Palette**, estruturado de forma elegante com foco em alta legibilidade de dados analíticos:
*   **Tema Light & Claro:** Fundos limpos off-white e cinzas suaves que preservam o conforto visual durante longas horas de análise corporativa.
*   **Destaques de Marca:** Acentos finos e elegantes baseados em vermelho corporativo (`#8a2d46`) e tonalidades de rosa suave.
*   **Tipografia:** Família de fontes **Inter** de alta legibilidade corporativa, com elementos lógicos em fontes mono-espaçadas para IDs de tarefas e chaves de integração do Redmine.
*   **Aesthetics Premium:** Interface focada em dados práticos, eliminando ruídos técnicos e dashboards poluídos para focar em métricas reais de agilidade.

---

## 🚀 Principais Módulos do Sistema

### 1. Visão Geral (Overview Hub)
Apresenta de forma dinâmica os blocos interativos dos três níveis de voo (**L3**, **L2**, **L1**). Cada seção do Hub exibe indicadores quantitativos instantâneos de itens ativos e impedimentos bloqueantes das equipes de entrega.

### 2. Quadro Kanban (Flight Boards)
Quadros customizados para cada nível de voo:
*   **Flight Level 3 (Estratégico):** Monitoramento de metas anuais e objetivos estratégicos de longo prazo.
*   **Flight Level 2 (Coordenação):** Suporte avançado a raias horizontais (*Swimlanes*) parametrizáveis, isolando dependências entre múltiplas equipes ou áreas de negócio.
*   **Flight Level 1 (Operacional):** Quadro de tarefas granular e compactado com display de carga via mapa de densidade (*Dot Matrix*).

### 3. Mapa de Dependências Globais
Um visualizador de conexões interativas que rastreia dependências e impedimentos inter-squad (relações do tipo `blocked-by` e parentesco `parent-child`), permitindo a rápida identificação de gargalos críticos.

### 4. Painel de Métricas Avançadas
Gráficos analíticos automatizados alimentados em tempo real pelas métricas de agilidade e fluxo:
*   **Distribuição de Lead Time:** Tempo histórico de entrega de ponta a ponta.
*   **Throughput Semanal/Mensal:** Volume de vazão de itens concluídos.
*   **WIP Age Ativo:** Sinalização preditiva de cartões inativos bloqueados na fila operativa.
*   **Cumulative Flow Diagram (CFD):** Saúde estrutural e estabilidade do fluxo de trabalho.

### 5. Configurações de Sincronia Redmine
Módulo para mapeamento flexível de servidores, segurança, associação dinâmica de trackers para cada nível de voo e mapeamento inteligente de ciclos de status para colunas Kanban corporativas.

---

## 📂 Guia de Documentos do Sistema

Toda a documentação técnica, especificação de arquitetura e casos de uso do RedLevels está disponível no diretório `/docs`:

*   🏛️ [**docs/ARCHITECTURE.md**](./docs/ARCHITECTURE.md) - **Especificação de Arquitetura Técnica:** Detalhes de modelagem de dados, engenharia do proxy reverso de CORS, otimizações de paginação e design tokens.
*   🛠️ [**docs/DEVELOPER_GUIDE.md**](./docs/DEVELOPER_GUIDE.md) - **Guia de Desenvolvimento e Operações:** Manual prático para instalação local, depuração de campos personalizados e troubleshooting.
*   📄 [**docs/PRD.md**](./docs/PRD.md) - **Documento de Requisitos do Produto (PRD):** Visão de negócios, taxonomia de Flight Levels e escopo do sistema.
*   📄 [**docs/USER_STORIES.md**](./docs/USER_STORIES.md) - **Histórias de Usuário:** Casos de uso ágeis estruturados por personas com critérios de aceitação refinados.

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi construída com um ecossistema robusto, responsivo e de alta performance:
*   **Frontend Core:** React 18, TypeScript e Vite.
*   **Design & Estilos:** Tailwind CSS v4 para utilitários de design elegantes.
*   **Animações:** Motion para micro-interações de navegação fluidas e transições premium.
*   **Dashboards:** Recharts e D3 para renderização de gráficos em tempo real.
*   **Ícones:** Lucide React.
*   **Proxy Server:** Node.js com Express para bypass seguro de CORS.

---

## ⚡ Setup Rápido (Local Run)

### Instalação
Para instalar todas as dependências do projeto:
```bash
npm install
```

### Executar em Modo de Demonstração (Dados Simulados)
Inicie o dev-server do Vite de forma autônoma:
```bash
npm run dev
```
Acesse em: `http://localhost:3000`.

### Executar em Modo Integrado (Com Redmine Real)
Inicie o servidor proxy integrado para resolver bloqueios de CORS:
```bash
npm run serve
```
Acesse em: `http://localhost:4173` e configure suas chaves de API nas configurações do app.
