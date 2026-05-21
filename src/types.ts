export enum FlightLevel {
  L3 = 'L3', // Estratégico
  L2 = 'L2', // Coordenação
  L1 = 'L1'  // Operacional
}

export type KanbanStage = 'Backlog' | 'To Do' | 'In Progress' | 'Done';

export interface Issue {
  id: string;
  subject: string;
  description?: string;
  status: KanbanStage;
  redmineStatus: string;
  project: string;
  tracker: string;
  assignee?: string;
  assigneeAvatar?: string;
  level: FlightLevel;
  parentId?: string; // Links L2 -> L3 or L1 -> L2
  blocked: boolean;
  blockedReason?: string;
  creationDate: string;
  startDate?: string;
  closedDate?: string;
  points?: number;
  team?: string;
  age: number; // For L1 and L2 cards: active days in columns other than Backlog/Done
  customFields: Record<string, string>;
  flowLogs?: { stage: KanbanStage; date: string }[];
}

export interface Dependency {
  id: string;
  sourceId: string; // The issue that is waiting or is the child
  targetId: string; // The issue being waited on or the parent
  type: 'blocked-by' | 'parent-child';
}

export interface RedmineConfig {
  serverUrl: string;
  token: string;
  isConnected: boolean;
  useDemoWorkspace: boolean;
  activeTheme: 'classic' | 'modern' | 'contrast';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  trackers: {
    l3: string[];
    l2: string[];
    l1: string[];
  };
  stagesMap: Record<string, KanbanStage>; // Redmine status name -> KanbanStage
  fieldsMap: {
    blockedFlag: string; // Name or ID of custom field
    blockedReason: string;
    team: string; // Custom field defining team/area
    leadTimeStart: string; // Status or field that triggers lead time
    groupingField: string; // Custom field to group L2 Kanban by
  };
}

export interface FilterState {
  project: string;
  team: string; // area
  status: string;
  blockedOnly: boolean;
  search: string;
  selectedGroupFieldVal: string; // Specially for L2 Kanbans grouped by team
}
