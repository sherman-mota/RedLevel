import { FlightLevel, Issue, Dependency, KanbanStage } from './types';

// Let's create high-quality realistic user avatars using pure visual styles in components, but standard names here.
export const DEMO_PROJECTS = [
  'All Projects',
  'América Portfolio',
  'Infrastructure Migration',
  'Growth Initiatives',
  'Core Billing Engine'
];

export const DEMO_TEAMS = [
  'All Teams',
  'Platform Team',
  'Checkout & Pay',
  'DevOps & Sec',
  'UI/UX Experience',
  'Data Insights'
];

export const DEMO_TRACKERS = {
  l3: ['Strategic Initiative', 'Portfolio Goal'],
  l2: ['Value Stream', 'Feature Epic', 'Coordination Issue'],
  l1: ['Task', 'Bug', 'Support Request', 'Sub-task']
};

export const INITIAL_REDMINE_STATUSES = [
  'Nova',
  'Em Discussão',
  'Aprovada',
  'Em Desenvolvimento',
  'Bloqueada',
  'Em Teste',
  'Resolvida',
  'Fechada'
];

// Reusable flow logs to calculate historical data
const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const getMockIssues = (): Issue[] => [
  // --- LEVEL 3: STRATEGIC INITIATIVES ---
  {
    id: 'STR-01',
    subject: 'Portfólio América: Cloud Migration Q3',
    description: 'Migração completa de toda a infraestrutura on-premise da América Latina para AWS/Açure para assegurar latência < 100ms.',
    status: 'In Progress',
    redmineStatus: 'Em Desenvolvimento',
    project: 'Infrastructure Migration',
    tracker: 'Strategic Initiative',
    assignee: 'Jean Dupont',
    assigneeAvatar: 'JD',
    level: FlightLevel.L3,
    blocked: false,
    creationDate: getPastDate(90),
    startDate: getPastDate(80),
    points: 100,
    team: 'Platform Team',
    age: 80,
    customFields: {
      blockedFlag: 'Não',
      tema_estrategico: 'Eficiência Operacional',
      prioridade_diretoria: 'Alta'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(90) },
      { stage: 'To Do', date: getPastDate(85) },
      { stage: 'In Progress', date: getPastDate(80) }
    ]
  },
  {
    id: 'STR-02',
    subject: 'New Core Payment Gateway',
    description: 'Integração de uma nova solução multifuncional de gateway (Stripe/Adyen) para reduzir taxas de transação em 2.5%.',
    status: 'In Progress',
    redmineStatus: 'Bloqueada',
    project: 'Core Billing Engine',
    tracker: 'Strategic Initiative',
    assignee: 'Mariano Ribeiro',
    assigneeAvatar: 'MR',
    level: FlightLevel.L3,
    blocked: true,
    blockedReason: 'Aguardando liberação de conformidade regulatória pelo Banco Central.',
    creationDate: getPastDate(60),
    startDate: getPastDate(45),
    points: 150,
    team: 'Checkout & Pay',
    age: 45,
    customFields: {
      blockedFlag: 'Sim',
      blocked_reason: 'Aguardando aprovação de compliance',
      tema_estrategico: 'Expansão de Receita',
      prioridade_diretoria: 'Crítica'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(60) },
      { stage: 'To Do', date: getPastDate(50) },
      { stage: 'In Progress', date: getPastDate(45) }
    ]
  },
  {
    id: 'STR-03',
    subject: 'Plataforma CX Omnichannel V2',
    description: 'Centralização de interações via chat, whatsapp e email em um único front-end integrado para atendimento ao cliente.',
    status: 'To Do',
    redmineStatus: 'Aprovada',
    project: 'Growth Initiatives',
    tracker: 'Strategic Initiative',
    assignee: 'Ana Kos',
    assigneeAvatar: 'AK',
    level: FlightLevel.L3,
    blocked: false,
    creationDate: getPastDate(30),
    startDate: getPastDate(20),
    points: 80,
    team: 'UI/UX Experience',
    age: 20,
    customFields: {
      blockedFlag: 'Não',
      tema_estrategico: 'Foco no Cliente',
      prioridade_diretoria: 'Média'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(30) },
      { stage: 'To Do', date: getPastDate(20) }
    ]
  },
  {
    id: 'STR-04',
    subject: 'Auditoria de Segurança da Informação & ISO 27001',
    description: 'Varredura passiva de vulnerabilidades e adequação de todas as etapas de CI/CD para obtenção do selo ISO 27001.',
    status: 'Done',
    redmineStatus: 'Fechada',
    project: 'Infrastructure Migration',
    tracker: 'Strategic Initiative',
    assignee: 'Douglas Miller',
    assigneeAvatar: 'DM',
    level: FlightLevel.L3,
    blocked: false,
    creationDate: getPastDate(120),
    startDate: getPastDate(110),
    closedDate: getPastDate(15),
    points: 50,
    team: 'DevOps & Sec',
    age: 95,
    customFields: {
      blockedFlag: 'Não',
      tema_estrategico: 'Segurança & Compliance',
      prioridade_diretoria: 'Crítica'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(120) },
      { stage: 'To Do', date: getPastDate(115) },
      { stage: 'In Progress', date: getPastDate(110) },
      { stage: 'Done', date: getPastDate(15) }
    ]
  },
  {
    id: 'STR-05',
    subject: 'Engaging Global Growth',
    description: 'Iniciativas de SEO automatizado e marketing baseado em IA no mercado Asiático e Europeu.',
    status: 'Backlog',
    redmineStatus: 'Nova',
    project: 'Growth Initiatives',
    tracker: 'Strategic Initiative',
    level: FlightLevel.L3,
    blocked: false,
    creationDate: getPastDate(14),
    age: 0,
    customFields: {
      blockedFlag: 'Não',
      tema_estrategico: 'Expansão Global'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(14) }
    ]
  },

  // --- LEVEL 2: COORDINATION (TACTICAL COORD) ---
  // Children of STR-01 (Cloud Migration)
  {
    id: 'PRJ-101',
    subject: 'Backend Refactor API v2',
    description: 'Desacoplamento do monólito operacional buscando API Restful modularizada em Docker.',
    status: 'In Progress',
    redmineStatus: 'Em Desenvolvimento',
    project: 'Infrastructure Migration',
    tracker: 'Feature Epic',
    assignee: 'Jean Dupont',
    assigneeAvatar: 'JD',
    level: FlightLevel.L2,
    parentId: 'STR-01',
    blocked: false,
    creationDate: getPastDate(75),
    startDate: getPastDate(70),
    points: 40,
    team: 'Platform Team',
    age: 70,
    customFields: {
      blockedFlag: 'Não',
      area_coordenacao: 'Plataforma Core'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(75) },
      { stage: 'To Do', date: getPastDate(72) },
      { stage: 'In Progress', date: getPastDate(70) }
    ]
  },
  {
    id: 'PRJ-102',
    subject: 'Databases Re-sharding LATAM',
    description: 'Migração do cluster Postgres para instâncias com replicação geográfica multi-ativa.',
    status: 'To Do',
    redmineStatus: 'Aprovada',
    project: 'Infrastructure Migration',
    tracker: 'Feature Epic',
    assignee: 'Fabiana Lima',
    assigneeAvatar: 'FL',
    level: FlightLevel.L2,
    parentId: 'STR-01',
    blocked: false,
    creationDate: getPastDate(40),
    startDate: getPastDate(38),
    points: 30,
    team: 'Data Insights',
    age: 38,
    customFields: {
      blockedFlag: 'Não',
      area_coordenacao: 'Banco de Dados'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(40) },
      { stage: 'To Do', date: getPastDate(38) }
    ]
  },
  {
    id: 'PRJ-103',
    subject: 'CI/CD Pipelines Modernization',
    description: 'Migração do Jenkins local para GitHub Actions empresariais seguras.',
    status: 'Done',
    redmineStatus: 'Resolvida',
    project: 'Infrastructure Migration',
    tracker: 'Feature Epic',
    assignee: 'Douglas Miller',
    assigneeAvatar: 'DM',
    level: FlightLevel.L2,
    parentId: 'STR-01',
    blocked: false,
    creationDate: getPastDate(80),
    startDate: getPastDate(75),
    closedDate: getPastDate(10),
    points: 25,
    team: 'DevOps & Sec',
    age: 65,
    customFields: {
      blockedFlag: 'Não',
      area_coordenacao: 'Infraestrutura'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(80) },
      { stage: 'To Do', date: getPastDate(78) },
      { stage: 'In Progress', date: getPastDate(75) },
      { stage: 'Done', date: getPastDate(10) }
    ]
  },

  // Children of STR-02 (New Core Payment Gateway)
  {
    id: 'PRJ-104',
    subject: 'Stripe Integration Architecture',
    description: 'Definição do modelo de dados transacional, webhook de falhar recorrentes e tratamento de split de pagamentos.',
    status: 'In Progress',
    redmineStatus: 'Bloqueada',
    project: 'Core Billing Engine',
    tracker: 'Coordination Issue',
    assignee: 'Mariano Ribeiro',
    assigneeAvatar: 'MR',
    level: FlightLevel.L2,
    parentId: 'STR-02',
    blocked: true,
    blockedReason: 'Compliance Hold - Aguardando validação do comitê de segurança de dados (LGPD).',
    creationDate: getPastDate(44),
    startDate: getPastDate(35),
    points: 60,
    team: 'Checkout & Pay',
    age: 35,
    customFields: {
      blockedFlag: 'Sim',
      blocked_reason: 'Aguardando validação com o setor de LGPD',
      area_coordenacao: 'Operações Crédito'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(44) },
      { stage: 'To Do', date: getPastDate(40) },
      { stage: 'In Progress', date: getPastDate(35) }
    ]
  },
  {
    id: 'PRJ-105',
    subject: 'Unified POS Conciliator API',
    description: 'Serviço para consolidação automática de compras físicas e e-commerce.',
    status: 'To Do',
    redmineStatus: 'Nova',
    project: 'Core Billing Engine',
    tracker: 'Feature Epic',
    assignee: 'Roberto Diaz',
    assigneeAvatar: 'RD',
    level: FlightLevel.L2,
    parentId: 'STR-02',
    blocked: false,
    creationDate: getPastDate(20),
    points: 45,
    team: 'Checkout & Pay',
    age: 0,
    customFields: {
      blockedFlag: 'Não',
      area_coordenacao: 'Finanças'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(20) }
    ]
  },

  // Children of STR-03 (CX Omnichannel)
  {
    id: 'PRJ-106',
    subject: 'Messaging Hub Interface (WhatsApp/Telegram)',
    description: 'Front-end modular reativo para chat unificado permitindo múltiplos atendentes por fila.',
    status: 'In Progress',
    redmineStatus: 'Em Desenvolvimento',
    project: 'Growth Initiatives',
    tracker: 'Feature Epic',
    assignee: 'Karina Silva',
    assigneeAvatar: 'KS',
    level: FlightLevel.L2,
    parentId: 'STR-03',
    blocked: false,
    creationDate: getPastDate(15),
    startDate: getPastDate(12),
    points: 50,
    team: 'UI/UX Experience',
    age: 12,
    customFields: {
      blockedFlag: 'Não',
      area_coordenacao: 'Canais de Atendimento'
    },
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(15) },
      { stage: 'To Do', date: getPastDate(14) },
      { stage: 'In Progress', date: getPastDate(12) }
    ]
  },

  // --- LEVEL 1: OPERATIONAL ---
  // Subtasks of PRJ-101 (Backend Refactor)
  {
    id: 'TSK-4001',
    subject: 'Create Mock API endpoints for route validation',
    status: 'Done',
    redmineStatus: 'Fechada',
    project: 'Infrastructure Migration',
    tracker: 'Task',
    assignee: 'Gabriel Souza',
    assigneeAvatar: 'GS',
    level: FlightLevel.L1,
    parentId: 'PRJ-101',
    blocked: false,
    creationDate: getPastDate(72),
    startDate: getPastDate(70),
    closedDate: getPastDate(65),
    points: 5,
    team: 'Platform Team',
    age: 5,
    customFields: {},
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(72) },
      { stage: 'To Do', date: getPastDate(71) },
      { stage: 'In Progress', date: getPastDate(70) },
      { stage: 'Done', date: getPastDate(65) }
    ]
  },
  {
    id: 'TSK-4002',
    subject: 'Implement JWT Stateless Auth in Router',
    status: 'In Progress',
    redmineStatus: 'Em Desenvolvimento',
    project: 'Infrastructure Migration',
    tracker: 'Task',
    assignee: 'Juliana Costa',
    assigneeAvatar: 'JC',
    level: FlightLevel.L1,
    parentId: 'PRJ-101',
    blocked: false,
    creationDate: getPastDate(10),
    startDate: getPastDate(8),
    points: 8,
    team: 'Platform Team',
    age: 8,
    customFields: {},
    flowLogs: [
      { stage: 'Backlog', date: getPastDate(10) },
      { stage: 'In Progress', date: getPastDate(8) }
    ]
  },
  {
    id: 'TSK-4003',
    subject: 'Optimize Express middleware chain for payload decompression',
    status: 'In Progress',
    redmineStatus: 'Em Desenvolvimento',
    project: 'Infrastructure Migration',
    tracker: 'Task',
    assignee: 'Gabriel Souza',
    assigneeAvatar: 'GS',
    level: FlightLevel.L1,
    parentId: 'PRJ-101',
    blocked: true,
    blockedReason: 'Falta Dockerfile de referência otimizado pelo time de DevOps Sec.',
    creationDate: getPastDate(7),
    startDate: getPastDate(5),
    points: 3,
    team: 'Platform Team',
    age: 5,
    customFields: {
      blockedFlag: 'Sim',
      blocked_reason: 'Dependência de DevOps'
    },
    flowLogs: [
      { stage: 'To Do', date: getPastDate(7) },
      { stage: 'In Progress', date: getPastDate(5) }
    ]
  },
  {
    id: 'TSK-4004',
    subject: 'Write Unit Tests for Router endpoints (>85% coverage)',
    status: 'To Do',
    redmineStatus: 'Nova',
    project: 'Infrastructure Migration',
    tracker: 'Task',
    assignee: 'Lucas Melo',
    assigneeAvatar: 'LM',
    level: FlightLevel.L1,
    parentId: 'PRJ-101',
    blocked: false,
    creationDate: getPastDate(5),
    points: 5,
    team: 'Platform Team',
    age: 0,
    customFields: {},
    flowLogs: []
  },

  // Subtasks of PRJ-102 (Databases Re-sharding LATAM)
  {
    id: 'TSK-4011',
    subject: 'Analyze current schemas & tables constraints for partitioning',
    status: 'In Progress',
    redmineStatus: 'Em Desenvolvimento',
    project: 'Infrastructure Migration',
    tracker: 'Task',
    assignee: 'Fabiana Lima',
    assigneeAvatar: 'FL',
    level: FlightLevel.L1,
    parentId: 'PRJ-102',
    blocked: false,
    creationDate: getPastDate(30),
    startDate: getPastDate(25),
    points: 13,
    team: 'Data Insights',
    age: 25,
    customFields: {},
    flowLogs: [
      { stage: 'To Do', date: getPastDate(30) },
      { stage: 'In Progress', date: getPastDate(25) }
    ]
  },
  {
    id: 'TSK-4012',
    subject: 'Verify logical replication limits on multi-tenant IDs',
    status: 'To Do',
    redmineStatus: 'Nova',
    project: 'Infrastructure Migration',
    tracker: 'Task',
    assignee: 'Evelyn Ramos',
    assigneeAvatar: 'ER',
    level: FlightLevel.L1,
    parentId: 'PRJ-102',
    blocked: false,
    creationDate: getPastDate(15),
    points: 8,
    team: 'Data Insights',
    age: 0,
    customFields: {}
  },

  // Subtasks of PRJ-104 (Stripe Integration Architecture)
  {
    id: 'TSK-4021',
    subject: 'Implement Stripe Signature Webhook Validator',
    status: 'In Progress',
    redmineStatus: 'Bloqueada',
    project: 'Core Billing Engine',
    tracker: 'Task',
    assignee: 'Enzo Ferrari',
    assigneeAvatar: 'EF',
    level: FlightLevel.L1,
    parentId: 'PRJ-104',
    blocked: true,
    blockedReason: 'Bloqueado devido ao bloqueio da iniciativa-mãe (PRJ-104). Aguardando conformidade jurídica.',
    creationDate: getPastDate(20),
    startDate: getPastDate(18),
    points: 5,
    team: 'Checkout & Pay',
    age: 18,
    customFields: {
      blockedFlag: 'Sim',
      blocked_reason: 'Compliance Hold'
    },
    flowLogs: [
      { stage: 'To Do', date: getPastDate(20) },
      { stage: 'In Progress', date: getPastDate(18) }
    ]
  },
  {
    id: 'TSK-4022',
    subject: 'Implement Credit Card Tokenization fallback workflow',
    status: 'To Do',
    redmineStatus: 'Nova',
    project: 'Core Billing Engine',
    tracker: 'Task',
    assignee: 'Mariano Ribeiro',
    assigneeAvatar: 'MR',
    level: FlightLevel.L1,
    parentId: 'PRJ-104',
    blocked: false,
    creationDate: getPastDate(10),
    points: 8,
    team: 'Checkout & Pay',
    age: 0,
    customFields: {}
  },
  {
    id: 'TSK-4023',
    subject: 'Mock Credit Card charges via Sandbox Stripe token client',
    status: 'Done',
    redmineStatus: 'Resolvida',
    project: 'Core Billing Engine',
    tracker: 'Task',
    assignee: 'Enzo Ferrari',
    assigneeAvatar: 'EF',
    level: FlightLevel.L1,
    parentId: 'PRJ-104',
    blocked: false,
    creationDate: getPastDate(30),
    startDate: getPastDate(25),
    closedDate: getPastDate(20),
    points: 3,
    team: 'Checkout & Pay',
    age: 5,
    customFields: {},
    flowLogs: [
      { stage: 'To Do', date: getPastDate(30) },
      { stage: 'In Progress', date: getPastDate(25) },
      { stage: 'Done', date: getPastDate(20) }
    ]
  },

  // Subtasks of PRJ-106 (Messaging Hub WhatsApp)
  {
    id: 'TSK-4031',
    subject: 'Integrate Twilio API for WhatsApp webhook gateway',
    status: 'In Progress',
    redmineStatus: 'Em Desenvolvimento',
    project: 'Growth Initiatives',
    tracker: 'Task',
    assignee: 'Karina Silva',
    assigneeAvatar: 'KS',
    level: FlightLevel.L1,
    parentId: 'PRJ-106',
    blocked: false,
    creationDate: getPastDate(12),
    startDate: getPastDate(10),
    points: 8,
    team: 'UI/UX Experience',
    age: 10,
    customFields: {}
  },
  {
    id: 'TSK-4032',
    subject: 'Design conversational UI layout with floating panels',
    status: 'Done',
    redmineStatus: 'Fechada',
    project: 'Growth Initiatives',
    tracker: 'Task',
    assignee: 'Vitor Hugo',
    assigneeAvatar: 'VH',
    level: FlightLevel.L1,
    parentId: 'PRJ-106',
    blocked: false,
    creationDate: getPastDate(14),
    startDate: getPastDate(13),
    closedDate: getPastDate(9),
    points: 5,
    team: 'UI/UX Experience',
    age: 4,
    customFields: {}
  }
];

export const getMockDependencies = (): Dependency[] => [
  // Parent-Child: Strategic L3 to Tactial L2
  { id: 'DEP-01', sourceId: 'PRJ-101', targetId: 'STR-01', type: 'parent-child' },
  { id: 'DEP-02', sourceId: 'PRJ-102', targetId: 'STR-01', type: 'parent-child' },
  { id: 'DEP-03', sourceId: 'PRJ-103', targetId: 'STR-01', type: 'parent-child' },
  { id: 'DEP-04', sourceId: 'PRJ-104', targetId: 'STR-02', type: 'parent-child' },
  { id: 'DEP-05', sourceId: 'PRJ-105', targetId: 'STR-02', type: 'parent-child' },
  { id: 'DEP-06', sourceId: 'PRJ-106', targetId: 'STR-03', type: 'parent-child' },

  // Parent-Child: L2 to L1
  { id: 'DEP-07', sourceId: 'TSK-4001', targetId: 'PRJ-101', type: 'parent-child' },
  { id: 'DEP-08', sourceId: 'TSK-4002', targetId: 'PRJ-101', type: 'parent-child' },
  { id: 'DEP-09', sourceId: 'TSK-4003', targetId: 'PRJ-101', type: 'parent-child' },
  { id: 'DEP-10', sourceId: 'TSK-4004', targetId: 'PRJ-101', type: 'parent-child' },
  { id: 'DEP-11', sourceId: 'TSK-4011', targetId: 'PRJ-102', type: 'parent-child' },
  { id: 'DEP-12', sourceId: 'TSK-4012', targetId: 'PRJ-102', type: 'parent-child' },
  { id: 'DEP-13', sourceId: 'TSK-4021', targetId: 'PRJ-104', type: 'parent-child' },
  { id: 'DEP-14', sourceId: 'TSK-4022', targetId: 'PRJ-104', type: 'parent-child' },
  { id: 'DEP-15', sourceId: 'TSK-4023', targetId: 'PRJ-104', type: 'parent-child' },
  { id: 'DEP-16', sourceId: 'TSK-4031', targetId: 'PRJ-106', type: 'parent-child' },
  { id: 'DEP-17', sourceId: 'TSK-4032', targetId: 'PRJ-106', type: 'parent-child' },

  // Cross-level or intra-level blocks (blocked-by)
  { id: 'DEP-BL-01', sourceId: 'STR-02', targetId: 'STR-04', type: 'blocked-by' }, // Core payment waits for ISO 27001 Security Audit completion
  { id: 'DEP-BL-02', sourceId: 'TSK-4003', targetId: 'PRJ-103', type: 'blocked-by' }, // Middleware block waits for DevOps Pipeline work (PRJ-103 is CI/CD DevOps)
  { id: 'DEP-BL-03', sourceId: 'PRJ-104', targetId: 'STR-04', type: 'blocked-by' }
];

export interface WeeklyDelivery {
  week: string;
  l3: number;
  l2: number;
  l1: number;
}

export interface MetricDataset {
  leadTimeDistribution: { time: number; count: number }[];
  throughput: WeeklyDelivery[];
  flowEfficiency: { active: number; waiting: number; team: string }[];
  cumulativeFlow: { date: string; Backlog: number; ToDo: number; InProgress: number; Done: number }[];
}

export const getMockMetrics = (): MetricDataset => {
  return {
    leadTimeDistribution: [
      { time: 5, count: 8 },
      { time: 10, count: 12 },
      { time: 15, count: 18 },
      { time: 20, count: 24 },
      { time: 25, count: 15 },
      { time: 30, count: 10 },
      { time: 40, count: 7 },
      { time: 50, count: 4 },
      { time: 60, count: 2 },
      { time: 70, count: 1 }
    ],
    throughput: [
      { week: 'W40', l3: 0, l2: 1, l1: 8 },
      { week: 'W41', l3: 1, l2: 2, l1: 12 },
      { week: 'W42', l3: 0, l2: 1, l1: 7 },
      { week: 'W43', l3: 1, l2: 3, l1: 14 },
      { week: 'W44', l3: 0, l2: 0, l1: 9 },
      { week: 'W45', l3: 0, l2: 2, l1: 15 },
      { week: 'W46', l3: 1, l2: 1, l1: 11 },
      { week: 'W47', l3: 0, l2: 1, l1: 16 }
    ],
    flowEfficiency: [
      { team: 'Platform Team', active: 78, waiting: 22 },
      { team: 'Checkout & Pay', active: 45, waiting: 55 }, // Lower flow efficiency on payments due to compliance locks
      { team: 'DevOps & Sec', active: 85, waiting: 15 },
      { team: 'UI/UX Experience', active: 90, waiting: 10 },
      { team: 'Data Insights', active: 70, waiting: 30 }
    ],
    cumulativeFlow: [
      { date: '05-13', Backlog: 150, ToDo: 80, InProgress: 40, Done: 780 },
      { date: '05-14', Backlog: 148, ToDo: 82, InProgress: 42, Done: 785 },
      { date: '05-15', Backlog: 145, ToDo: 79, InProgress: 45, Done: 791 },
      { date: '05-16', Backlog: 142, ToDo: 84, InProgress: 43, Done: 798 },
      { date: '05-17', Backlog: 140, ToDo: 80, InProgress: 46, Done: 805 },
      { date: '05-18', Backlog: 139, ToDo: 81, InProgress: 48, Done: 811 },
      { date: '05-19', Backlog: 135, ToDo: 85, InProgress: 42, Done: 821 },
      { date: '05-20', Backlog: 132, ToDo: 82, InProgress: 45, Done: 830 }
    ]
  };
};
