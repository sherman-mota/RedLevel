export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export interface Translations {
  // App / Nav
  appName: string;
  appSubtitle: string;
  navOverview: string;
  navL3: string;
  navL2: string;
  navL1: string;
  navDependencies: string;
  navMetrics: string;
  navSettings: string;
  navMetaOverview: string;
  navMetaL3: string;
  navMetaL2: string;
  navMetaL1: string;
  navMetaDep: string;
  navMetaMetrics: string;
  navMetaSettings: string;
  collapseMenu: string;
  redmineConnected: string;
  connectionOffline: string;
  demoWorkspace: string;

  // Header
  headerOverview: string;
  headerL3: string;
  headerL2: string;
  headerL1: string;
  headerDependencies: string;
  headerMetrics: string;
  headerSettings: string;
  headerSubtitle: string;
  syncData: string;
  quickFilters: string;
  redmineConnectedBadge: string;
  connectionOfflineBadge: string;

  // Notification bar
  hideNotification: string;

  // Loader
  loadingModule: string;
  waitingSync: string;

  // Filters
  filtersTitle: string;
  filterProject: string;
  filterTeam: string;
  filterStatus: string;
  filterBlockedOnly: string;
  filterSearch: string;
  filterGroupField: string;
  filterAll: string;
  filterClear: string;
  filterRefresh: string;

  // Settings
  settingsTitle: string;
  settingsSubtitle: string;

  // Settings > Section 1
  section1Title: string;
  labelServerUrl: string;
  labelApiToken: string;
  placeholderServerUrl: string;
  placeholderToken: string;
  testConnection: string;
  testingConnection: string;
  connectionEstablished: string;
  connectionFailed: string;
  corsHint: string;
  fillUrlAndToken: string;

  // Settings > Section 2
  section2Title: string;
  themeModernName: string;
  themeModernDesc: string;
  themeClassicName: string;
  themeClassicDesc: string;
  themeContrastName: string;
  themeContrastDesc: string;

  // Settings > Section 3
  section3Title: string;
  sectionDemoMode: string;
  sectionConnectedMode: string;
  reloadTrackers: string;
  trackersDescription: string;
  loadingTrackers: string;
  noTrackers: string;
  levelStrategic: string;
  levelTactical: string;
  levelOperational: string;
  levelIgnore: string;
  addCustomTracker: string;
  placeholderCustomTracker: string;

  // Settings > Section 4
  section4Title: string;
  customFieldsDesc: string;
  fieldBlockedFlag: string;
  fieldBlockedReason: string;
  fieldTeam: string;
  fieldGrouping: string;
  placeholderBlockedFlag: string;
  placeholderBlockedReason: string;
  placeholderTeam: string;
  placeholderGrouping: string;
  selectField: string;
  manualEntry: string;
  mappedValue: string;
  reloadCustomFields: string;

  // Settings > Section 5
  section5Title: string;
  autoMapTitle: string;
  autoMapDesc: string;
  autoMapButton: string;
  autoMapDetecting: string;
  addStatusMapping: string;
  placeholderRedmineStatus: string;
  mapToKanban: string;
  linkStatus: string;
  redmineStatusCol: string;
  mappedToCol: string;
  actionCol: string;
  removeMapping: string;

  // Settings > Section 6 (Language)
  section6Title: string;
  section6Desc: string;
  langPtBr: string;
  langEnUs: string;
  langEsEs: string;

  // Settings footer
  settingsStorageNote: string;
  saveAllSettings: string;
  settingsSaved: string;

  // Issue detail panel
  backButton: string;
  confirmAndBack: string;
  flightStatus: string;
  mainOwner: string;
  impactHours: string;
  squadOwner: string;
  flightLevel: string;
  activeFor: string;
  daysActive: string;
  issueDetails: string;
  noDescription: string;
  parentageTitle: string;
  parentCode: string;
  noParent: string;
  blockersTitle: string;
  isBlocked: string;
  specifyBlockReason: string;
  placeholderBlockReason: string;

  // New Issue Modal
  newIssueTitle: string;
  hideModal: string;
  labelSubject: string;
  placeholderSubject: string;
  labelDescription: string;
  placeholderDescription: string;
  labelAssignee: string;
  labelEffort: string;
  labelEffortHours: string;
  labelTeamSquad: string;
  labelParentCode: string;
  createIssueBorn: string;
  placeholderBlockReasonCreate: string;
  cancelButton: string;
  createIssueButton: string;
  issueCreated: string;
  fillTitle: string;

  // Status messages
  syncSuccess: string;
  syncError: string;
  allStatusesMapped: string;
  autoMappedSuccess: string;

  // Unassigned
  unassigned: string;
  notConfigured: string;
  allTeams: string;
  noParentLinked: string;

  // Overview KPIs & Levels
  kpiTotal: string;
  kpiStrategicTitle: string;
  kpiStrategicInProgress: string;
  kpiTacticalTitle: string;
  kpiTacticalDays: string;
  kpiOperationalTitle: string;

  // Level L3 Strategic
  lvl3Title: string;
  lvl3Subtitle: string;
  lvl3Description: string;
  lvl3Iniciatives: string;
  lvl3Blocked: string;
  lvl3NoIssues: string;
  lvl3NoDescription: string;
  lvl3SyncN2: string;
  lvl3NoManager: string;
  lvl3BlockLabel: string;

  // Level L2 Tactical
  lvl2Title: string;
  lvl2Subtitle: string;
  lvl2Description: string;
  lvl2EpicsProjects: string;
  lvl2WipAgeAvg: string;
  lvl2NoIssues: string;
  lvl2AllTeams: string;
  lvl2SyncL1: string;
  lvl2WipAgeLabel: string;
  lvl2NoOwner: string;
  lvl2BottleneckLabel: string;

  // Level L1 Operational
  lvl1Title: string;
  lvl1Subtitle: string;
  lvl1Description: string;
  lvl1HighDensityOn: string;
  lvl1HighDensityOff: string;
  lvl1HighDensityTooltip: string;
  lvl1HighDensityCompaction: string;
  lvl1HighDensityCorpSummary: string;
  lvl1HighDensityKlausLeopold: string;
  lvl1DotMatrixTitle: string;
  lvl1FilteredActive: string;
  lvl1NoParent: string;
  lvl1NoAssignee: string;
  lvl1NoEstimation: string;
  lvl1BlockedTag: string;
  lvl1Backlog: string;
  lvl1ToDo: string;
  lvl1InProgress: string;
  lvl1Blocked: string;
  lvl1Done: string;
}


const ptBR: Translations = {
  appName: 'RedLevels',
  appSubtitle: 'Agilidade Escalada com Redmine',
  navOverview: 'Visão Geral',
  navL3: 'Estratégico',
  navL2: 'Tático',
  navL1: 'Operacional',
  navDependencies: 'Dependências',
  navMetrics: 'Métricas',
  navSettings: 'Configurações',
  navMetaOverview: '',
  navMetaL3: '',
  navMetaL2: '',
  navMetaL1: '',
  navMetaDep: '',
  navMetaMetrics: '',
  navMetaSettings: '',
  collapseMenu: 'Recolher Menu',
  redmineConnected: 'Conectado ao Servidor do Redmine',
  connectionOffline: 'Conexão Offline (Cache)',
  demoWorkspace: 'Demonstração',

  headerOverview: 'Visão Geral',
  headerL3: 'Kanban Estratégico',
  headerL2: 'Kanban tático de Coordenação',
  headerL1: 'Kanban Operacional',
  headerDependencies: 'Mapa de Conexões',
  headerMetrics: 'Performance & CFD',
  headerSettings: 'Preferências do RedLevels',
  headerSubtitle: 'Visão geral das tarefas do redmine de acordo com o seu nível: N1 (Estratégico), N2 (Tático), N3 (Operacional)',
  syncData: 'Sincronizar dados agora',
  quickFilters: 'Filtros Rápidos',
  redmineConnectedBadge: 'Redmine Conectado',
  connectionOfflineBadge: 'Conexão Offline (Cache)',

  hideNotification: 'Ocultar',

  loadingModule: 'Carregando módulo de visualização...',
  waitingSync: 'Aguardando Sincronização Redmine...',

  filtersTitle: 'Filtros Rápidos',
  filterProject: 'Projeto',
  filterTeam: 'Time / Área',
  filterStatus: 'Status Kanban',
  filterBlockedOnly: 'Somente Bloqueados',
  filterSearch: 'Buscar por título...',
  filterGroupField: 'Agrupar por Campo',
  filterAll: 'Todos',
  filterClear: 'Limpar Filtros',
  filterRefresh: 'Atualizar Dados',

  settingsTitle: 'Painel de Ajustes & Integrações',
  settingsSubtitle: 'Configure mapeamento de campos personalizados, conexão de servidores e preferências visuais do Flight Levels',

  section1Title: '1. Conexão com Servidor Redmine',
  labelServerUrl: 'URL Oficial do Servidor Redmine',
  labelApiToken: 'API Access Token (Chave de Acesso)',
  placeholderServerUrl: 'Ex: https://meu-redmine.empresa.com',
  placeholderToken: 'Inserir hash de chave rest...',
  testConnection: 'Testar Conexão',
  testingConnection: 'Testando...',
  connectionEstablished: 'Conexão Estabelecida!',
  connectionFailed: 'Falha na Validação',
  corsHint: 'Como resolver erro CORS do Redmine',
  fillUrlAndToken: 'Por favor, preencha a URL do Redmine e o Token de API.',

  section2Title: '2. Temas Visuais (Enterprise Palette)',
  themeModernName: 'Modern RedLevels',
  themeModernDesc: 'Visual elegante baseado em bordas limpas e paleta de corporação Deep Crimson.',
  themeClassicName: 'Classic Redmine',
  themeClassicDesc: 'Relembra a identidade estética azul rústica tradicional da comunidade Redmine.',
  themeContrastName: 'High Contrast Red (Light)',
  themeContrastDesc: 'Contraste claro purista com a paleta corporativa vermelha e bordas marcadas.',

  section3Title: '3. Mapeador de Trackers por Nível de Voo',
  sectionDemoMode: 'Modo de Demonstração (Trackers Fictícios)',
  sectionConnectedMode: 'Conectado ao Redmine',
  reloadTrackers: 'Recarregar trackers do Redmine',
  trackersDescription: 'Associe cada Tipo de Tarefa (Tracker) do seu Redmine ao seu respectivo nível do Flight Levels do modelo Klaus Leopold. Isso ditará em quais quadros e visões cada tarefa será agrupada.',
  loadingTrackers: 'Carregando trackers do Redmine...',
  noTrackers: 'Nenhum tracker localizado. Use o formulário abaixo para adicionar trackers manualmente.',
  levelStrategic: 'N3 Estratégico',
  levelTactical: 'N2 Tático',
  levelOperational: 'N1 Operacional',
  levelIgnore: 'Ignorar',
  addCustomTracker: 'Adicionar Tracker Personalizado Manualmente',
  placeholderCustomTracker: 'Ex: Epic, Sub-tarefa',

  section4Title: '4. Mapeador de Campos Personalizados',
  customFieldsDesc: 'Selecione os campos personalizados (Custom Fields) carregados do seu Redmine ou escolha "Outro" para digitar o nome/ID manualmente.',
  fieldBlockedFlag: 'Marcador de Bloqueio (Custom Block Flag)',
  fieldBlockedReason: 'Razão de Bloqueios (Block Reason Field)',
  fieldTeam: 'Dono / Time Operacional (Squad Field ID)',
  fieldGrouping: 'Mapeador de Área L2 (Agrupador de Kanban)',
  placeholderBlockedFlag: 'Ex: Impedimento, blocked_flag, 12',
  placeholderBlockedReason: 'Ex: blocked_reason, Causa de impedimento, 13',
  placeholderTeam: 'Ex: squad_responsável, squad_id, 14',
  placeholderGrouping: 'Ex: area_coordenacao, cluster_valor, 15',
  selectField: '-- Selecionar Campo --',
  manualEntry: '✍️ Outro / Digitar Manualmente...',
  mappedValue: 'Valor Mapeado (ID ou Nome)',
  reloadCustomFields: 'Recarregar campos do Redmine',

  section5Title: '5. Mapeador de Ciclos e Estágios Kanban',
  autoMapTitle: 'Configuração Automática Inteligente',
  autoMapDesc: 'Detecte e vincule instantaneamente todos os status do seu Redmine utilizando o motor preditivo.',
  autoMapButton: 'Detectar e Mapear Automaticamente',
  autoMapDetecting: 'Detectando...',
  addStatusMapping: 'Registrar Novo Status Redmine',
  placeholderRedmineStatus: 'Ex: Em Homologação',
  mapToKanban: 'Mapear Para Kanban',
  linkStatus: 'Vincular',
  redmineStatusCol: 'Status Redmine',
  mappedToCol: 'Mapeado Para',
  actionCol: 'Ação',
  removeMapping: 'Desfazer',

  section6Title: '6. Idioma da Interface',
  section6Desc: 'Selecione o idioma de exibição de toda a interface do RedLevels.',
  langPtBr: 'Português (Brasil)',
  langEnUs: 'English (US)',
  langEsEs: 'Español (ES)',

  settingsStorageNote: 'Configurações persistidas nativamente em seu navegador local (LocalStorage).',
  saveAllSettings: 'Salvar Todas as Configurações',
  settingsSaved: 'Configurações salvas com sucesso no armazenamento local!',

  backButton: 'Voltar',
  confirmAndBack: 'Confirmar e Voltar',
  flightStatus: 'Status do Voo',
  mainOwner: 'Dono Principal',
  impactHours: 'Impacto / Horas',
  squadOwner: 'Squad Responsável',
  flightLevel: 'Nível de Voo',
  activeFor: 'Ativo Há (WIP Age)',
  daysActive: 'dias no ar',
  issueDetails: 'Detalhes da Demanda',
  noDescription: 'Sem descrição cadastrada neste cartão do Redmine.',
  parentageTitle: 'Trilhas de Parentesco',
  parentCode: 'Código Pai',
  noParent: 'Sem nível superior vinculado',
  blockersTitle: 'Gargalos e Impedimentos',
  isBlocked: 'Esta demanda está sob bloqueio/gargalo externo?',
  specifyBlockReason: 'Especificar Causa do Impedimento',
  placeholderBlockReason: 'Ex: Aguardando liberação do comitê corporativo de conformidade técnica...',

  newIssueTitle: 'Adicionar Item de Voo: Flight Level',
  hideModal: 'Ocultar',
  labelSubject: 'Título do Item / Demanda',
  placeholderSubject: 'Ex: Migração Estrutural de Logs AWS',
  labelDescription: 'Descrição Detalhada de Contexto',
  placeholderDescription: 'Descreva de forma macro a meta e o que se espera de entrega...',
  labelAssignee: 'Dono Atribuído',
  labelEffort: 'Esforço Estimado (Esforço)',
  labelEffortHours: 'Esforço Estimado (Horas)',
  labelTeamSquad: 'Time Executor / Squad',
  labelParentCode: 'Código do Item Pai',
  createIssueBorn: 'Nascer bloqueado? (Identificar gargalo preliminar)',
  placeholderBlockReasonCreate: 'Especifique a razão (e.g. Falta aprovação regulatória)',
  cancelButton: 'Voltar',
  createIssueButton: 'Criar Demanda de Voo',
  issueCreated: 'adicionada com código de voo:',
  fillTitle: 'Por favor, digite o título da demanda.',

  syncSuccess: 'Sincronizado! Carregadas',
  syncError: 'Erro ao sincronizar. Ativando Modo Simulador Offline para evitar travamento.',
  allStatusesMapped: 'Todos os status detectados no seu Redmine já possuem mapeamentos ativos!',
  autoMappedSuccess: 'Sucesso! O assistente detectou e mapeou automaticamente',

  unassigned: 'Unassigned',
  notConfigured: 'Não Configurado',
  allTeams: 'Todas',
  noParentLinked: 'Sem nível superior vinculado',

  // Overview KPIs & Levels
  kpiTotal: 'Total',
  kpiStrategicTitle: 'Itens Estratégicos',
  kpiStrategicInProgress: 'em Progresso',
  kpiTacticalTitle: 'Itens Táticos (WIP Age Médio)',
  kpiTacticalDays: 'dias',
  kpiOperationalTitle: 'Itens Operacionais Ativos',

  // Level L3 Strategic
  lvl3Title: 'Iniciativas Estratégias',
  lvl3Subtitle: '(Projetos Estratégicos)',
  lvl3Description: 'Direciona a estratégia da organização conectando metas até as equipes',
  lvl3Iniciatives: 'Projetos Estratégicos',
  lvl3Blocked: 'Bloqueados',
  lvl3NoIssues: 'Nenhuma iniciativa estratégica corresponde aos filtros atuais.',
  lvl3NoDescription: 'Sem descrição cadastrada.',
  lvl3SyncN2: 'Sincronização N2',
  lvl3NoManager: 'Sem gestor',
  lvl3BlockLabel: 'Bloqueio:',

  // Level L2 Tactical
  lvl2Title: 'Demandas Táticas',
  lvl2Subtitle: '(Demandas)',
  lvl2Description: 'Coordena a entrega de múltiplos times operacionais orientado pelas iniciativas estratégicas',
  lvl2EpicsProjects: 'Demandas',
  lvl2WipAgeAvg: 'WIP Age Médio:',
  lvl2NoIssues: 'Nenhum item do nível de coordenação corresponde aos filtros.',
  lvl2AllTeams: 'Todas Equipes',
  lvl2SyncL1: 'Sincronização L1',
  lvl2WipAgeLabel: 'WIP Age:',
  lvl2NoOwner: 'Sem dono',
  lvl2BottleneckLabel: 'Gargalo:',

  // Level L1 Operational
  lvl1Title: 'Tarefas Operacionais',
  lvl1Subtitle: '(Tarefas)',
  lvl1Description: 'Visualização dos incrementos de software produzidos',
  lvl1HighDensityOn: 'Resumo de Alta Densidade: LIGADO',
  lvl1HighDensityOff: 'Mostrar Todos os Cards',
  lvl1HighDensityTooltip: 'Alternar entre modo compactado e cartões grandes',
  lvl1HighDensityCompaction: 'Resumo',
  lvl1HighDensityCorpSummary: 'Resumo Corporativo de Alta Densidade',
  lvl1HighDensityKlausLeopold: 'Agilistas Klaus Leopold indicam consolidar representações operacionais volumosas para evitar gargalo informacional de microgerenciamento.',
  lvl1DotMatrixTitle: 'Área operacional consolidada (1 bolinha = 5 demandas ativas)',
  lvl1FilteredActive: 'Filtrados Operacionais Ativos no RedLevels',
  lvl1NoParent: 'Sem Vínculo',
  lvl1NoAssignee: 'Sem Atrib.',
  lvl1NoEstimation: 'No est.',
  lvl1BlockedTag: 'Bloqueado!',
  lvl1Backlog: 'Backlog',
  lvl1ToDo: 'To Do',
  lvl1InProgress: 'In Progress',
  lvl1Blocked: 'Blocked',
  lvl1Done: 'Done',
};

const enUS: Translations = {
  appName: 'RedLevels',
  appSubtitle: 'Flight Levels Management',
  navOverview: 'General Management (Flex)',
  navL3: 'Strategic L3',
  navL2: 'Coordination L2',
  navL1: 'Operational L1',
  navDependencies: 'Dep. Map',
  navMetrics: 'Flow Metrics',
  navSettings: 'Settings',
  navMetaOverview: 'L3-L2-L1',
  navMetaL3: 'Strategic',
  navMetaL2: 'Tactical',
  navMetaL1: 'Operational',
  navMetaDep: 'Graphs',
  navMetaMetrics: 'KRs',
  navMetaSettings: 'Redmine',
  collapseMenu: 'Collapse Menu',
  redmineConnected: 'Redmine Integrated',
  connectionOffline: 'Offline Connection (Cache)',
  demoWorkspace: 'Demo Workspace',

  headerOverview: 'General Flow Overview',
  headerL3: 'Strategic Kanban (L3)',
  headerL2: 'Tactical Coordination Kanban (L2)',
  headerL1: 'Operational Kanban (L1)',
  headerDependencies: 'Connection Map',
  headerMetrics: 'Performance & CFD',
  headerSettings: 'RedLevels Preferences',
  headerSubtitle: 'Redmine Flight Levels • Klaus Leopold Value Stream Alignment',
  syncData: 'Sync data now',
  quickFilters: 'Quick Filters',
  redmineConnectedBadge: 'Redmine Connected',
  connectionOfflineBadge: 'Offline Connection (Cache)',

  hideNotification: 'Hide',

  loadingModule: 'Loading view module...',
  waitingSync: 'Waiting for Redmine Sync...',

  filtersTitle: 'Quick Filters',
  filterProject: 'Project',
  filterTeam: 'Team / Area',
  filterStatus: 'Kanban Status',
  filterBlockedOnly: 'Blocked Only',
  filterSearch: 'Search by title...',
  filterGroupField: 'Group by Field',
  filterAll: 'All',
  filterClear: 'Clear Filters',
  filterRefresh: 'Refresh Data',

  settingsTitle: 'Settings & Integrations Panel',
  settingsSubtitle: 'Configure custom field mappings, server connection and Flight Levels visual preferences',

  section1Title: '1. Redmine Server Connection',
  labelServerUrl: 'Official Redmine Server URL',
  labelApiToken: 'API Access Token',
  placeholderServerUrl: 'E.g.: https://my-redmine.company.com',
  placeholderToken: 'Enter rest key hash...',
  testConnection: 'Test Connection',
  testingConnection: 'Testing...',
  connectionEstablished: 'Connection Established!',
  connectionFailed: 'Validation Failed',
  corsHint: 'How to fix Redmine CORS error',
  fillUrlAndToken: 'Please fill in the Redmine URL and API Token.',

  section2Title: '2. Visual Themes (Enterprise Palette)',
  themeModernName: 'Modern RedLevels',
  themeModernDesc: 'Elegant visual based on clean borders and Deep Crimson corporate palette.',
  themeClassicName: 'Classic Redmine',
  themeClassicDesc: 'Reminisces the traditional rustic blue aesthetic identity of the Redmine community.',
  themeContrastName: 'High Contrast Red (Light)',
  themeContrastDesc: 'Purist light contrast with the red corporate palette and marked borders.',

  section3Title: '3. Tracker Mapper per Flight Level',
  sectionDemoMode: 'Demo Mode (Mock Trackers)',
  sectionConnectedMode: 'Connected to Redmine',
  reloadTrackers: 'Reload Redmine trackers',
  trackersDescription: 'Associate each Task Type (Tracker) from your Redmine to its respective Flight Levels level from the Klaus Leopold model. This will determine on which boards and views each task is grouped.',
  loadingTrackers: 'Loading Redmine trackers...',
  noTrackers: 'No trackers found. Use the form below to add trackers manually.',
  levelStrategic: 'L3 Strategic',
  levelTactical: 'L2 Tactical',
  levelOperational: 'L1 Operational',
  levelIgnore: 'Ignore',
  addCustomTracker: 'Add Custom Tracker Manually',
  placeholderCustomTracker: 'E.g.: Epic, Sub-task',

  section4Title: '4. Custom Fields Mapper',
  customFieldsDesc: 'Select the custom fields loaded from your Redmine or choose "Other" to type the name/ID manually.',
  fieldBlockedFlag: 'Block Flag (Custom Block Flag)',
  fieldBlockedReason: 'Block Reason (Block Reason Field)',
  fieldTeam: 'Owner / Operational Team (Squad Field ID)',
  fieldGrouping: 'L2 Area Mapper (Kanban Grouping Field)',
  placeholderBlockedFlag: 'E.g.: Impediment, blocked_flag, 12',
  placeholderBlockedReason: 'E.g.: blocked_reason, Block cause, 13',
  placeholderTeam: 'E.g.: responsible_squad, squad_id, 14',
  placeholderGrouping: 'E.g.: coordination_area, value_cluster, 15',
  selectField: '-- Select Field --',
  manualEntry: '✍️ Other / Type Manually...',
  mappedValue: 'Mapped Value (ID or Name)',
  reloadCustomFields: 'Reload Redmine fields',

  section5Title: '5. Kanban Stages & Cycles Mapper',
  autoMapTitle: 'Intelligent Auto Configuration',
  autoMapDesc: 'Instantly detect and link all your Redmine statuses using the predictive engine.',
  autoMapButton: 'Detect and Map Automatically',
  autoMapDetecting: 'Detecting...',
  addStatusMapping: 'Register New Redmine Status',
  placeholderRedmineStatus: 'E.g.: In Staging',
  mapToKanban: 'Map to Kanban',
  linkStatus: 'Link',
  redmineStatusCol: 'Redmine Status',
  mappedToCol: 'Mapped To',
  actionCol: 'Action',
  removeMapping: 'Remove',

  section6Title: '6. Interface Language',
  section6Desc: 'Select the display language for the entire RedLevels interface.',
  langPtBr: 'Português (Brasil)',
  langEnUs: 'English (US)',
  langEsEs: 'Español (ES)',

  settingsStorageNote: 'Settings natively persisted in your local browser (LocalStorage).',
  saveAllSettings: 'Save All Settings',
  settingsSaved: 'Settings saved successfully to local storage!',

  backButton: 'Back',
  confirmAndBack: 'Confirm & Back',
  flightStatus: 'Flight Status',
  mainOwner: 'Main Owner',
  impactHours: 'Impact / Hours',
  squadOwner: 'Responsible Squad',
  flightLevel: 'Flight Level',
  activeFor: 'Active For (WIP Age)',
  daysActive: 'days in flight',
  issueDetails: 'Issue Details',
  noDescription: 'No description registered for this Redmine card.',
  parentageTitle: 'Parentage Trails',
  parentCode: 'Parent Code',
  noParent: 'No higher level linked',
  blockersTitle: 'Blockers & Impediments',
  isBlocked: 'Is this demand under an external block/bottleneck?',
  specifyBlockReason: 'Specify the Impediment Cause',
  placeholderBlockReason: 'E.g.: Waiting for corporate technical compliance committee release...',

  newIssueTitle: 'Add Flight Item: Flight Level',
  hideModal: 'Hide',
  labelSubject: 'Item / Demand Title',
  placeholderSubject: 'E.g.: AWS Logs Structural Migration',
  labelDescription: 'Detailed Context Description',
  placeholderDescription: 'Describe the goal and expected deliverable at a macro level...',
  labelAssignee: 'Assigned Owner',
  labelEffort: 'Estimated Effort (Effort)',
  labelEffortHours: 'Estimated Effort (Hours)',
  labelTeamSquad: 'Executing Team / Squad',
  labelParentCode: 'Parent Item Code',
  createIssueBorn: 'Born blocked? (Identify preliminary bottleneck)',
  placeholderBlockReasonCreate: 'Specify the reason (e.g. Missing regulatory approval)',
  cancelButton: 'Cancel',
  createIssueButton: 'Create Flight Demand',
  issueCreated: 'added with flight code:',
  fillTitle: 'Please enter the demand title.',

  syncSuccess: 'Synced! Loaded',
  syncError: 'Sync error. Activating Offline Simulator Mode to avoid freezing.',
  allStatusesMapped: 'All statuses detected in your Redmine already have active mappings!',
  autoMappedSuccess: 'Success! The assistant automatically detected and mapped',

  unassigned: 'Unassigned',
  notConfigured: 'Not Configured',
  allTeams: 'All',
  noParentLinked: 'No higher level linked',

  // Overview KPIs & Levels
  kpiTotal: 'Total',
  kpiStrategicTitle: 'Strategic Items',
  kpiStrategicInProgress: 'In Progress',
  kpiTacticalTitle: 'Tactical Items (Average WIP Age)',
  kpiTacticalDays: 'days',
  kpiOperationalTitle: 'Active Operational Items',

  // Level L3 Strategic
  lvl3Title: 'Flight Level 3: Strategic',
  lvl3Subtitle: '(Portfolio Initiatives)',
  lvl3Description: 'Steers the corporation by connecting annual goals down to teams',
  lvl3Iniciatives: 'Initiatives',
  lvl3Blocked: 'Blocked',
  lvl3NoIssues: 'No strategic initiatives match the current filters.',
  lvl3NoDescription: 'No description registered.',
  lvl3SyncN2: 'L2 Sync',
  lvl3NoManager: 'No manager',
  lvl3BlockLabel: 'Blocked:',

  // Level L2 Tactical
  lvl2Title: 'Flight Level 2: Coordination',
  lvl2Subtitle: '(Value Flow & Dependencies)',
  lvl2Description: 'Synchronizes multiple operational teams in the same Value Stream',
  lvl2EpicsProjects: 'Epics/Projects',
  lvl2WipAgeAvg: 'Average WIP Age:',
  lvl2NoIssues: 'No coordination level items match the filters.',
  lvl2AllTeams: 'All Teams',
  lvl2SyncL1: 'L1 Sync',
  lvl2WipAgeLabel: 'WIP Age:',
  lvl2NoOwner: 'No owner',
  lvl2BottleneckLabel: 'Bottleneck:',

  // Level L1 Operational
  lvl1Title: 'Flight Level 1: Operational',
  lvl1Subtitle: '(Team Kanban Boards)',
  lvl1Description: 'High-density view for tasks, bugs, and daily sprints',
  lvl1HighDensityOn: 'High Density Summary: ON',
  lvl1HighDensityOff: 'Show All Cards',
  lvl1HighDensityTooltip: 'Toggle between compacted mode and large cards',
  lvl1HighDensityCompaction: 'AUTOMATIC COMPACTION L1',
  lvl1HighDensityCorpSummary: 'Corporate High Density Summary',
  lvl1HighDensityKlausLeopold: 'Klaus Leopold agilists recommend consolidating bulky operational representations to avoid information bottleneck of micromanagement.',
  lvl1DotMatrixTitle: 'Consolidated operational area (1 dot = 5 active demands)',
  lvl1FilteredActive: 'Active Operational Filtered in RedLevels',
  lvl1NoParent: 'No Link',
  lvl1NoAssignee: 'No Assignee',
  lvl1NoEstimation: 'No est.',
  lvl1BlockedTag: 'Blocked!',
  lvl1Backlog: 'Backlog',
  lvl1ToDo: 'To Do',
  lvl1InProgress: 'In Progress',
  lvl1Blocked: 'Blocked',
  lvl1Done: 'Done',
};

const esES: Translations = {
  appName: 'RedLevels',
  appSubtitle: 'Gestión de Flight Levels',
  navOverview: 'Gestión General (Flex)',
  navL3: 'Estratégico L3',
  navL2: 'Coordinación L2',
  navL1: 'Operacional L1',
  navDependencies: 'Mapa de Dep.',
  navMetrics: 'Métricas de Flujo',
  navSettings: 'Configuración',
  navMetaOverview: 'L3-L2-L1',
  navMetaL3: 'Estratégico',
  navMetaL2: 'Táctico',
  navMetaL1: 'Operacional',
  navMetaDep: 'Grafos',
  navMetaMetrics: 'KRs',
  navMetaSettings: 'Redmine',
  collapseMenu: 'Colapsar Menú',
  redmineConnected: 'Redmine Integrado',
  connectionOffline: 'Conexión Sin Conexión (Caché)',
  demoWorkspace: 'Espacio de Demostración',

  headerOverview: 'Resumen General de Flujo',
  headerL3: 'Kanban Estratégico (L3)',
  headerL2: 'Kanban Táctico de Coordinación (L2)',
  headerL1: 'Kanban Operacional (L1)',
  headerDependencies: 'Mapa de Conexiones',
  headerMetrics: 'Rendimiento & CFD',
  headerSettings: 'Preferencias de RedLevels',
  headerSubtitle: 'Redmine Flight Levels • Klaus Leopold Value Stream Alignment',
  syncData: 'Sincronizar datos ahora',
  quickFilters: 'Filtros Rápidos',
  redmineConnectedBadge: 'Redmine Conectado',
  connectionOfflineBadge: 'Conexión Sin Conexión (Caché)',

  hideNotification: 'Ocultar',

  loadingModule: 'Cargando módulo de visualización...',
  waitingSync: 'Esperando Sincronización de Redmine...',

  filtersTitle: 'Filtros Rápidos',
  filterProject: 'Proyecto',
  filterTeam: 'Equipo / Área',
  filterStatus: 'Estado Kanban',
  filterBlockedOnly: 'Solo Bloqueados',
  filterSearch: 'Buscar por título...',
  filterGroupField: 'Agrupar por Campo',
  filterAll: 'Todos',
  filterClear: 'Limpiar Filtros',
  filterRefresh: 'Actualizar Datos',

  settingsTitle: 'Panel de Ajustes e Integraciones',
  settingsSubtitle: 'Configure el mapeo de campos personalizados, conexión de servidores y preferencias visuales de Flight Levels',

  section1Title: '1. Conexión con Servidor Redmine',
  labelServerUrl: 'URL Oficial del Servidor Redmine',
  labelApiToken: 'Token de Acceso API',
  placeholderServerUrl: 'Ej: https://mi-redmine.empresa.com',
  placeholderToken: 'Ingrese hash de clave rest...',
  testConnection: 'Probar Conexión',
  testingConnection: 'Probando...',
  connectionEstablished: '¡Conexión Establecida!',
  connectionFailed: 'Fallo de Validación',
  corsHint: 'Cómo resolver el error CORS de Redmine',
  fillUrlAndToken: 'Por favor, complete la URL de Redmine y el Token de API.',

  section2Title: '2. Temas Visuales (Paleta Empresarial)',
  themeModernName: 'Modern RedLevels',
  themeModernDesc: 'Visual elegante basado en bordes limpios y paleta corporativa Deep Crimson.',
  themeClassicName: 'Classic Redmine',
  themeClassicDesc: 'Recuerda la identidad estética azul rústica tradicional de la comunidad Redmine.',
  themeContrastName: 'High Contrast Red (Light)',
  themeContrastDesc: 'Contraste claro purista con la paleta corporativa roja y bordes marcados.',

  section3Title: '3. Mapeador de Trackers por Nivel de Vuelo',
  sectionDemoMode: 'Modo de Demostración (Trackers Ficticios)',
  sectionConnectedMode: 'Conectado a Redmine',
  reloadTrackers: 'Recargar trackers de Redmine',
  trackersDescription: 'Asocie cada Tipo de Tarea (Tracker) de su Redmine a su respectivo nivel de Flight Levels del modelo Klaus Leopold. Esto determinará en qué tableros y vistas se agrupará cada tarea.',
  loadingTrackers: 'Cargando trackers de Redmine...',
  noTrackers: 'No se encontraron trackers. Use el formulario a continuación para agregar trackers manualmente.',
  levelStrategic: 'N3 Estratégico',
  levelTactical: 'N2 Táctico',
  levelOperational: 'N1 Operacional',
  levelIgnore: 'Ignorar',
  addCustomTracker: 'Agregar Tracker Personalizado Manualmente',
  placeholderCustomTracker: 'Ej: Epic, Sub-tarea',

  section4Title: '4. Mapeador de Campos Personalizados',
  customFieldsDesc: 'Seleccione los campos personalizados cargados de su Redmine o elija "Otro" para escribir el nombre/ID manualmente.',
  fieldBlockedFlag: 'Marcador de Bloqueo (Custom Block Flag)',
  fieldBlockedReason: 'Razón de Bloqueos (Block Reason Field)',
  fieldTeam: 'Propietario / Equipo Operacional (Squad Field ID)',
  fieldGrouping: 'Mapeador de Área L2 (Agrupador de Kanban)',
  placeholderBlockedFlag: 'Ej: Impedimento, blocked_flag, 12',
  placeholderBlockedReason: 'Ej: blocked_reason, Causa de impedimento, 13',
  placeholderTeam: 'Ej: squad_responsable, squad_id, 14',
  placeholderGrouping: 'Ej: area_coordinacion, cluster_valor, 15',
  selectField: '-- Seleccionar Campo --',
  manualEntry: '✍️ Otro / Escribir Manualmente...',
  mappedValue: 'Valor Mapeado (ID o Nombre)',
  reloadCustomFields: 'Recargar campos de Redmine',

  section5Title: '5. Mapeador de Ciclos y Etapas Kanban',
  autoMapTitle: 'Configuración Automática Inteligente',
  autoMapDesc: 'Detecte y vincule instantáneamente todos los estados de su Redmine usando el motor predictivo.',
  autoMapButton: 'Detectar y Mapear Automáticamente',
  autoMapDetecting: 'Detectando...',
  addStatusMapping: 'Registrar Nuevo Estado Redmine',
  placeholderRedmineStatus: 'Ej: En Homologación',
  mapToKanban: 'Mapear a Kanban',
  linkStatus: 'Vincular',
  redmineStatusCol: 'Estado Redmine',
  mappedToCol: 'Mapeado A',
  actionCol: 'Acción',
  removeMapping: 'Eliminar',

  section6Title: '6. Idioma de la Interfaz',
  section6Desc: 'Seleccione el idioma de visualización de toda la interfaz de RedLevels.',
  langPtBr: 'Português (Brasil)',
  langEnUs: 'English (US)',
  langEsEs: 'Español (ES)',

  settingsStorageNote: 'Configuraciones persistidas nativamente en su navegador local (LocalStorage).',
  saveAllSettings: 'Guardar Todas las Configuraciones',
  settingsSaved: '¡Configuraciones guardadas exitosamente en el almacenamiento local!',

  backButton: 'Volver',
  confirmAndBack: 'Confirmar y Volver',
  flightStatus: 'Estado de Vuelo',
  mainOwner: 'Propietario Principal',
  impactHours: 'Impacto / Horas',
  squadOwner: 'Squad Responsable',
  flightLevel: 'Nivel de Vuelo',
  activeFor: 'Activo Hace (WIP Age)',
  daysActive: 'días en vuelo',
  issueDetails: 'Detalles de la Demanda',
  noDescription: 'Sin descripción registrada en esta tarjeta de Redmine.',
  parentageTitle: 'Rastros de Parentesco',
  parentCode: 'Código Padre',
  noParent: 'Sin nivel superior vinculado',
  blockersTitle: 'Cuellos de Botella e Impedimentos',
  isBlocked: '¿Esta demanda está bajo un bloqueo/cuello de botella externo?',
  specifyBlockReason: 'Especificar Causa del Impedimento',
  placeholderBlockReason: 'Ej: Esperando liberación del comité corporativo de conformidad técnica...',

  newIssueTitle: 'Agregar Elemento de Vuelo: Flight Level',
  hideModal: 'Ocultar',
  labelSubject: 'Título del Elemento / Demanda',
  placeholderSubject: 'Ej: Migración Estructural de Logs AWS',
  labelDescription: 'Descripción Detallada de Contexto',
  placeholderDescription: 'Describa de forma macro el objetivo y lo que se espera entregar...',
  labelAssignee: 'Propietario Asignado',
  labelEffort: 'Esfuerzo Estimado (Esfuerzo)',
  labelEffortHours: 'Esfuerzo Estimado (Horas)',
  labelTeamSquad: 'Equipo Ejecutor / Squad',
  labelParentCode: 'Código del Elemento Padre',
  createIssueBorn: '¿Nace bloqueado? (Identificar cuello de botella preliminar)',
  placeholderBlockReasonCreate: 'Especifique la razón (ej: Falta aprobación regulatoria)',
  cancelButton: 'Cancelar',
  createIssueButton: 'Crear Demanda de Vuelo',
  issueCreated: 'agregado con código de vuelo:',
  fillTitle: 'Por favor, ingrese el título de la demanda.',

  syncSuccess: '¡Sincronizado! Cargados',
  syncError: 'Error de sincronización. Activando Modo Simulador Offline para evitar congelamiento.',
  allStatusesMapped: '¡Todos los estados detectados en su Redmine ya tienen mappings activos!',
  autoMappedSuccess: '¡Éxito! El asistente detectó y mapeó automáticamente',

  unassigned: 'Sin Asignar',
  notConfigured: 'No Configurado',
  allTeams: 'Todos',
  noParentLinked: 'Sin nivel superior vinculado',

  // Overview KPIs & Levels
  kpiTotal: 'Total',
  kpiStrategicTitle: 'Elementos Estratégicos',
  kpiStrategicInProgress: 'en Progreso',
  kpiTacticalTitle: 'Elementos Tácticos (Edad WIP Media)',
  kpiTacticalDays: 'días',
  kpiOperationalTitle: 'Elementos Operacionales Activos',

  // Level L3 Strategic
  lvl3Title: 'Flight Level 3: Estratégico',
  lvl3Subtitle: '(Iniciativas de Portafolio)',
  lvl3Description: 'Dirige el rumbo de la corporación conectando metas anuales con los equipos',
  lvl3Iniciatives: 'Iniciativas',
  lvl3Blocked: 'Bloqueadas',
  lvl3NoIssues: 'Ninguna iniciativa estratégica coincide con los filtros actuales.',
  lvl3NoDescription: 'Sin descripción registrada.',
  lvl3SyncN2: 'Sincronización N2',
  lvl3NoManager: 'Sin gestor',
  lvl3BlockLabel: 'Bloqueo:',

  // Level L2 Tactical
  lvl2Title: 'Flight Level 2: Coordinación',
  lvl2Subtitle: '(Flujo de Valor y Dependências)',
  lvl2Description: 'Sincroniza múltiples equipos operativos en el mismo Value Stream',
  lvl2EpicsProjects: 'Épicos/Proyectos',
  lvl2WipAgeAvg: 'Edad WIP Media:',
  lvl2NoIssues: 'Ningún elemento del nivel de coordinación coincide con los filtros.',
  lvl2AllTeams: 'Todos los Equipos',
  lvl2SyncL1: 'Sincronización L1',
  lvl2WipAgeLabel: 'Edad WIP:',
  lvl2NoOwner: 'Sin propietario',
  lvl2BottleneckLabel: 'Cuello de Botella:',

  // Level L1 Operational
  lvl1Title: 'Flight Level 1: Operacional',
  lvl1Subtitle: '(Tableros Kanban de Equipos)',
  lvl1Description: 'Visualización de alta densidad para tareas, errores y sprints diarios',
  lvl1HighDensityOn: 'Resumen de Alta Densidade: ACTIVADO',
  lvl1HighDensityOff: 'Mostrar Todas las Tarjetas',
  lvl1HighDensityTooltip: 'Alternar entre modo compactado y tarjetas grandes',
  lvl1HighDensityCompaction: 'COMPACTACIÓN AUTOMÁTICA N1',
  lvl1HighDensityCorpSummary: 'Resumen Corporativo de Alta Densidad',
  lvl1HighDensityKlausLeopold: 'Los agilistas de Klaus Leopold aconsejan consolidar las representaciones operativas voluminosas para evitar el cuello de botella de información del microgerenciamiento.',
  lvl1DotMatrixTitle: 'Área operativa consolidada (1 punto = 5 demandas activas)',
  lvl1FilteredActive: 'Filtrados Operativos Activos en RedLevels',
  lvl1NoParent: 'Sin Vínculo',
  lvl1NoAssignee: 'Sin Asig.',
  lvl1NoEstimation: 'Sin est.',
  lvl1BlockedTag: '¡Bloqueado!',
  lvl1Backlog: 'Backlog',
  lvl1ToDo: 'To Do',
  lvl1InProgress: 'In Progress',
  lvl1Blocked: 'Blocked',
  lvl1Done: 'Done',
};

export const translations: Record<Language, Translations> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};
