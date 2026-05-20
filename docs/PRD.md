# Documento de Requisitos do Produto (PRD) - RedLevels

## 1. Visão Geral do Produto
O **RedLevels** é um sistema corporativo de gestão visual e métricas baseado na metodologia de **Flight Levels** integrada de forma direta e configurável com o **Redmine** via API. 

Muitas organizações utilizam o Redmine para registrar e gerenciar o trabalho diário de desenvolvimento, suporte e operação, porém carecem de uma visão unificada e top-down que conecte a estratégia corporativa aos times de entrega. O RedLevels soluciona esse problema fornecendo painéis interativos de alta densidade estruturados em três níveis de voo, garantindo alinhamento e fluxo contínuo.

---

## 2. Abordagem de Flight Levels Adotada
A arquitetura de visualização e agrupamento baseia-se nos três níveis clássicos da metodologia:

*   **Flight Level 3: Estratégico (Iniciativas de Portfólio)**  
    *   **Propósito:** Direcionar o rumo corporativo e monitorar a saúde de grandes iniciativas, metas anuais e objetivos estratégicos de grande impacto.
    *   **Comportamento:** Cartões agregados de alto nível. Comunica bloqueios de grande risco para o negócio.
*   **Flight Level 2: Coordenação (Fluxos de Valor e Sincronização)**  
    *   **Propósito:** Sincronizar múltiplos times que compartilham o mesmo fluxo de valor ou que possuem dependências cruzadas complexas.
    *   **Comportamento:** Suporte a raias horizontais (*Swimlanes*) parametrizáveis pelo campo customizado configurado (ex: Área de Negócio, Produto ou Squad Principal). Exibe dependências ativas e gargalos.
*   **Flight Level 3: Operacional (Quadros de Times)**  
    *   **Propósito:** Visualização granular das tarefas diárias, bugs e sprints operacionais das equipes de execução.
    *   **Comportamento:** Quadro Kanban tradicional de alta densidade com recursos de compactação visual automática e exibição de dot matrix para simular grandes cargas operacionais agregadas.

---

## 3. Arquitetura de Integração Redmine
Diferente de ferramentas proprietárias que geram silos de informação, o RedLevels funciona como uma camada de exibição interativa e inteligente sobre o Redmine:

1.  **Mapeador de Trackers por Nível de Voo:**  
    O administrador associa quais IDs ou nomes de trackers (ex: *Iniciativa*, *Épico*, *Tarefa*, *Bug*) pertencem a cada nível de voo correspondente.
2.  **Mapeador de Ciclos e Estágios Kanban (Stages Map):**  
    Abstração dos diferentes fluxos de estados do Redmine (*Novo*, *Em Resolução*, *Aprovado*, *Pendente*, *Fechado*) em 4 colunas universais de progresso ágil:
    *   **Backlog**
    *   **To Do**
    *   **In Progress**
    *   **Done**
3.  **Campos Customizados Avançados:**  
    Permite configurar os nomes exatos de campos customizados do Redmine a serem interpretados pelo RedLevels para:
    *   Identificação de impedimentos (`blocked` e `blockedReason`).
    *   Pertencimento de time (`team`).
    *   Campo agregador para raias no L2 (`groupingField`).
4.  **Múltiplos Níveis de Dependências:**  
    Links automáticos do tipo pai/filho (`parent-child`) ou impedimento direto (`blocked-by`) lidos das conexões de tarefas relacionadas para gerar um grafo interativo de rotas críticas de dependências corporativas.

---

## 4. Requisitos de Interface e Estilo de Usabilidade
*   **Paleta Corporativa Light & Clara (Red Premium):**  
    Interface com foco em legibilidade profunda, abandonando temas noturnos carregados em preto puro. Utiliza fundos claros elegantes em tons suaves de off-white e cinza, destacados por bordas finas com contornos e acentos de cor vermelha corporativa (`#8a2d46`) e tons correlatos de rosa suave.
*   **Controles de Menu Compacto (Sidebar):**  
    Sidebar expansível e recolhível que preserva o status de conexões e indicações do Redmine.
*   **Painel Flutuante de Detalhes:**  
    Ao clicar em qualquer cartão de nível de voo, o usuário visualiza uma gaveta detalhada contendo o log histórico de movimentação (*lead time tracker*), campos customizados agregados e opções de atualização de status.
*   **Restrições Atuais de Escopo:**  
    *   **Sem Criação Direta:** Conforme regra de sync estrita e integridade transacional, a inclusão de novos itens diretamente pelo painel está temporariamente desativada. Novas demandas devem ser geradas no Redmine e sincronizadas automaticamente no RedLevels.

---

## 5. Matriz de Métricas Disponíveis
O painel de métricas corporativas agrupa e plota os seguintes relatórios em tempo real:
*   **Distribuição de Lead Time:** Histograma de dias trabalhados em itens concluídos.
*   **Throughput Histórico:** Volume agregador de itens concluídos por intervalo semanal/mensal.
*   **WIP Age Ativo:** Monitoramento estrutural do tempo de permanência de cartões em andamento para sinalizar envelhecimento anormal de itens da fila operativa.
*   **Gráfico de Fluxo Cumulativo (CFD):** Visualização de acúmulo de gargalos em colunas intermediárias.
