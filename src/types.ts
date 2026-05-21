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

/** Custom field map for a single Flight Level */
export interface LevelFieldsMap {
  blockedFlag: string;    // Custom field that flags blockage (e.g. "1" or "true")
  blockedReason: string;  // Custom field containing block reason text
  groupingField: string;  // Custom field used to group/swimlane the kanban
}

export interface RedmineConfig {
  serverUrl: string;
  token: string;
  isConnected: boolean;
  useDemoWorkspace: boolean;
  activeTheme: 'classic' | 'modern' | 'contrast';
  language: 'pt-BR' | 'en-US' | 'es-ES';

  /** Which tracker names map to each Flight Level */
  trackers: {
    l3: string[];
    l2: string[];
    l1: string[];
  };

  /**
   * Trackers explicitly included in RedLevels sync.
   * Trackers NOT in this list are ignored during import.
   */
  syncedTrackers: string[];

  /**
   * How L3 (Strategic level) issues are identified.
   * 'tracker' = by tracker name (default)
   * 'customField' = by a custom field value
   */
  l3Mode: 'tracker' | 'customField';
  l3CustomField: string;       // Custom field name/id for L3 identification
  l3CustomFieldValue: string;  // Value of that field that marks an issue as L3

  /** Redmine status name -> KanbanStage mapping */
  stagesMap: Record<string, KanbanStage>;

  /** Per-level custom field mappings */
  fieldsMap: {
    l3: LevelFieldsMap;
    l2: LevelFieldsMap;
    l1: LevelFieldsMap;
  };

  /**
   * Custom field names/ids that will appear as filter chips
   * in the Kanban views for each level.
   */
  filterFields: {
    l3: string[];
    l2: string[];
    l1: string[];
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
