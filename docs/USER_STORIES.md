# 📄 Histórias de Usuário (User Stories) — RedLevels

Este documento cataloga as histórias de usuário ágeis que direcionam o desenvolvimento, a validação de qualidade e os critérios de aceite do sistema **RedLevels**.

---

## 🚀 Tema 1: Alinhamento Estratégico (Flight Level 3)

### US01: Visualização do Direcionamento Estratégico de Portfólio
*   **Como um** Executivo de Portfólio (C-Level/PMO)  
    **Eu quero** visualizar o quadro consolidado das grandes iniciativas da corporação (Flight Level 3)  
    **Para que** eu consiga monitorar se o progresso dos investimentos anuais converge com o planejado e identificar bloqueios antes que impactem os resultados trimestrais.

#### Critérios de Aceitação:
*   **CA 1.1:** O quadro L3 deve listar apenas os itens cadastrados no Redmine cujos trackers correspondam às configurações estratégicas configuradas.
*   **CA 1.2:** Deve organizar os cartões nas 4 colunas clássicas: Backlog, To Do, In Progress e Done.
*   **CA 1.3:** Se uma iniciativa estratégico-chave possuir um sinal de bloqueio ativo (`blocked` = verdadeiro), o cartão deve apresentar um destaque avermelhado de alerta com bordas contrastantes e exibir o motivo original do impedimento.
*   **Componente Responsável:** [KanbanBoard.tsx](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/components/KanbanBoard.tsx)

---

## 🔄 Tema 2: Coordenação de Valor e Fluxos (Flight Level 2)

### US02: Gestão Visual de Dependências e Swimlanes no L2
*   **Como um** Agile Delivery Lead (ADL) ou Gerente de Produto  
    **Eu quero** poder habilitar raias horizontais (*Swimlanes*) agrupando os épicos e fluxos de valor pelo campo de time ou área customizada  
    **Para que** eu consiga detectar impedimentos cruzados entre equipes e orquestrar as entregas em sincronia de liberação de releases.

#### Critérios de Aceitação:
*   **CA 2.1:** Deve possibilitar a alternância instantânea entre a "Visão Kanban Padrão" e a "Visão de Raias (Swimlanes)" com um único clique.
*   **CA 2.2:** O agrupamento de raias deve mapear dinamicamente os valores presentes no campo customizado parametrizável (ex: Campo customizado de Área ou Produto).
*   **CA 2.3:** Cada raia horizontal pode ser colapsada ou expandida individualmente para otimizar espaço de tela em reuniões diárias ou semanais de coordenação (*FL2 Standup*).
*   **Componente Responsável:** [KanbanBoard.tsx](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/components/KanbanBoard.tsx)

---

## ⚙️ Tema 3: Monitoria e Alta Densidade Operacional (Flight Level 1)

### US03: Visualização Compactada de Alta Densidade de Trabalho
*   **Como um** Coordenador de Delivery Técnico do Nível Operacional  
    **Eu quero** um quadro consolidado de tarefas e bugs diários integrando uma matriz de densidade visual agregada (*Dot Matrix*)  
    **Para que** eu consiga mensurar com um único olhar a carga operacional massiva de centenas de demandas sem poluir o monitor ou perder o foco de gargalos iminentes.

#### Critérios de Aceitação:
*   **CA 3.1:** O nível operacional L1 deve disponibilizar uma caixa estatística informando as taxas de volumetria ativa (ex: tarefas ativas acumuladas no Redmine).
*   **CA 3.2:** Apresentar painel de decorações do tipo *Dot Matrix* correspondendo à proporcionalidade real de itens em cada uma das raias de Backlog, To Do, In Progress e Done.
*   **CA 3.3:** Garantir transições suaves e design intuitivo utilizando a paleta de cores light-clara (vermelhos corporativos e bordas limpas).
*   **Componente Responsável:** [Overview.tsx](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/components/Overview.tsx) e [KanbanBoard.tsx](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/components/KanbanBoard.tsx)

---

## 📡 Tema 4: Parametrização e Sincronismo do Servidor (Redmine Integration)

### US04: Configuração Customizada das Regras de Sincronismo de Projetos
*   **Como um** Administrador do Sistema RedLevels  
    **Eu quero** configurar o endereço do servidor Redmine, token pessoal de segurança e realizar o mapeamento entre trackers, status e campos customizados de forma amigável  
    **Para que** as operações de sincronia de dados compreendam perfeitamente a convenção de trabalho e a taxonomia da nossa organização.

#### Critérios de Aceitação:
*   **CA 4.1:** Apresentar indicador em tempo real da conectividade com o servidor Redmine (Conectado / Desconectado / Erro de CORS).
*   **CA 4.2:** Permitir mapeamento flexível de trackers: associando um ou múltiplos trackers cadastrados no Redmine a cada um dos três níveis de voo corporativos.
*   **CA 4.3:** Permitir mapeamento flexível de status: o usuário configura o nome do status real do Redmine e especifica a qual raia (ex: *In Progress*) o RedLevels deve transladá-lo.
*   **Componentes Responsáveis:** [Settings.tsx](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/components/Settings.tsx) e [redmine.ts](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/api/redmine.ts)

---

## 🔗 Tema 5: Rotas de Bloqueio e Resolução de Entraves

### US05: Inspeção do Grafo e Linhas Críticas de Dependências
*   **Como um** Diretor de Operações de Rede de Entrega  
    **Eu quero** um painel dedicado que trace links direcionais de dependências entre iniciativas irmãs ou relações de paternidade  
    **Para que** eu possa desvendar gargalos sistêmicos de agência de desenvolvimento em relação a múltiplos silos funcionais produtores de valor.

#### Critérios de Aceitação:
*   **CA 5.1:** O mapa de dependência deve expor graficamente nós representando os IDs e subjects das iniciativas.
*   **CA 5.2:** Links direcionais devem diferenciar graficamente relações do tipo pai-filho (`parent-child`) de relações do tipo bloqueio ativo (`blocked-by`).
*   **CA 5.3:** O clique sobre uma dependência deve isolar apenas a subtrilha relacionada de conexões e habilitar uma gaveta informativa na base da tela explicando origem, destino e tipo de entrave associado.
*   **Componente Responsável:** [DependencyMap.tsx](file:///Users/shermanmota/Downloads/workspace/redlevel/RedLevel/src/components/DependencyMap.tsx)
