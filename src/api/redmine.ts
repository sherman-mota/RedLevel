import { RedmineConfig, Issue, FlightLevel, KanbanStage } from '../types';
import { getMockIssues } from '../mockData';

/**
 * Constrói a URL para o proxy reverso.
 * Codifica a URL do Redmine como primeiro segmento do path, para que o
 * servidor proxy (Vite ou Express) possa extraí-la sem depender de headers
 * customizados — o que resolve problemas de roteamento dinâmico no preview.
 *
 * Exemplo:
 *   buildRedmineUrl('https://redmine.acme.com', '/users/current.json')
 *   → '/redmine-proxy/https%3A%2F%2Fredmine.acme.com/users/current.json'
 */
function buildRedmineUrl(serverUrl: string, apiPath: string): string {
  const encoded = encodeURIComponent(serverUrl.replace(/\/$/, ''));
  return `/redmine-proxy/${encoded}${apiPath}`;
}

function buildRedmineHeaders(token: string): HeadersInit {
  return {
    'X-Redmine-API-Key': token,
    'Content-Type': 'application/json',
  };
}

const CONFIG_KEY = 'redlevels_redmine_config';

const DEMO_TRACKERS = [
  'Strategic Initiative',
  'Portfolio Goal',
  'Value Stream',
  'Feature Epic',
  'Coordination Issue',
  'Task',
  'Bug',
  'Support Request',
  'Sub-task'
];

export const DEFAULT_CONFIG: RedmineConfig = {
  serverUrl: '',
  token: '',
  isConnected: false,
  useDemoWorkspace: true,
  activeTheme: 'modern',
  language: 'pt-BR',
  trackers: {
    l3: ['Strategic Initiative', 'Portfolio Goal'],
    l2: ['Value Stream', 'Feature Epic', 'Coordination Issue'],
    l1: ['Task', 'Bug', 'Support Request', 'Sub-task']
  },
  syncedTrackers: DEMO_TRACKERS,
  l3Mode: 'tracker',
  l3CustomField: '',
  l3CustomFieldValue: '',
  stagesMap: {
    '__global__': {
      'Nova': 'Backlog',
      'Em Discussão': 'To Do',
      'Aprovada': 'To Do',
      'Em Desenvolvimento': 'In Progress',
      'Bloqueada': 'In Progress',
      'Em Teste': 'In Progress',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Strategic Initiative': {
      'Nova': 'Backlog',
      'Em Discussão': 'To Do',
      'Aprovada': 'To Do',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Portfolio Goal': {
      'Nova': 'Backlog',
      'Em Discussão': 'To Do',
      'Aprovada': 'To Do',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Value Stream': {
      'Nova': 'Backlog',
      'Em Discussão': 'To Do',
      'Aprovada': 'To Do',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Feature Epic': {
      'Nova': 'Backlog',
      'Em Discussão': 'To Do',
      'Aprovada': 'To Do',
      'Em Desenvolvimento': 'In Progress',
      'Bloqueada': 'In Progress',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Coordination Issue': {
      'Nova': 'Backlog',
      'Em Discussão': 'To Do',
      'Aprovada': 'To Do',
      'Em Desenvolvimento': 'In Progress',
      'Bloqueada': 'In Progress',
      'Em Teste': 'In Progress',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Task': {
      'Nova': 'Backlog',
      'Em Desenvolvimento': 'In Progress',
      'Bloqueada': 'In Progress',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Bug': {
      'Nova': 'Backlog',
      'Em Desenvolvimento': 'In Progress',
      'Bloqueada': 'In Progress',
      'Em Teste': 'In Progress',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Support Request': {
      'Nova': 'Backlog',
      'Em Desenvolvimento': 'In Progress',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    },
    'Sub-task': {
      'Nova': 'Backlog',
      'Em Desenvolvimento': 'In Progress',
      'Resolvida': 'Done',
      'Fechada': 'Done'
    }
  },
  fieldsMap: {
    l3: { blockedFlag: '', blockedReason: '', groupingField: '' },
    l2: { blockedFlag: '', blockedReason: '', groupingField: 'area_coordenacao' },
    l1: { blockedFlag: 'blocked_custom_field', blockedReason: 'blocked_reason_custom_field', groupingField: '' },
  },
  filterFields: {
    l3: [],
    l2: [],
    l1: [],
  },
};

export function saveConfig(config: RedmineConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearDemoData(): void {
  localStorage.removeItem(CONFIG_KEY);
}

export function loadConfig(): RedmineConfig {
  const data = localStorage.getItem(CONFIG_KEY);
  if (!data) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(data);

    // Deep-merge trackers
    const trackers = {
      l3: Array.isArray(parsed.trackers?.l3) ? parsed.trackers.l3 : DEFAULT_CONFIG.trackers.l3,
      l2: Array.isArray(parsed.trackers?.l2) ? parsed.trackers.l2 : DEFAULT_CONFIG.trackers.l2,
      l1: Array.isArray(parsed.trackers?.l1) ? parsed.trackers.l1 : DEFAULT_CONFIG.trackers.l1,
    };

    // Migrate old flat fieldsMap -> new per-level structure
    const oldFlat = parsed.fieldsMap || {};
    const isOldFormat = oldFlat.blockedFlag !== undefined && !oldFlat.l1;
    const fieldsMap = {
      l3: {
        ...DEFAULT_CONFIG.fieldsMap.l3,
        ...(parsed.fieldsMap?.l3 || (isOldFormat ? {} : {})),
      },
      l2: {
        ...DEFAULT_CONFIG.fieldsMap.l2,
        ...(parsed.fieldsMap?.l2 || {}),
        // Migrate old groupingField to l2
        ...(isOldFormat && oldFlat.groupingField ? { groupingField: oldFlat.groupingField } : {}),
      },
      l1: {
        ...DEFAULT_CONFIG.fieldsMap.l1,
        ...(parsed.fieldsMap?.l1 || {}),
        // Migrate old blocked fields to l1
        ...(isOldFormat && oldFlat.blockedFlag   ? { blockedFlag: oldFlat.blockedFlag }     : {}),
        ...(isOldFormat && oldFlat.blockedReason ? { blockedReason: oldFlat.blockedReason } : {}),
      },
    };

    const filterFields = {
      l3: Array.isArray(parsed.filterFields?.l3) ? parsed.filterFields.l3 : [],
      l2: Array.isArray(parsed.filterFields?.l2) ? parsed.filterFields.l2 : [],
      l1: Array.isArray(parsed.filterFields?.l1) ? parsed.filterFields.l1 : [],
    };

    // Migrate stagesMap
    const rawStagesMap = parsed.stagesMap || DEFAULT_CONFIG.stagesMap;
    const isNested = Object.values(rawStagesMap || {}).some(v => v && typeof v === 'object');
    let stagesMap: Record<string, Record<string, KanbanStage>> = {};
    if (isNested) {
      stagesMap = rawStagesMap as Record<string, Record<string, KanbanStage>>;
    } else {
      // Migrate flat stagesMap -> tracker specific stagesMap
      const globalStages = (rawStagesMap || {}) as Record<string, KanbanStage>;
      stagesMap['__global__'] = { ...globalStages };
      
      const trackersList = [
        ...DEFAULT_CONFIG.trackers.l3,
        ...DEFAULT_CONFIG.trackers.l2,
        ...DEFAULT_CONFIG.trackers.l1,
        ...(parsed.syncedTrackers || []),
        ...trackers.l3,
        ...trackers.l2,
        ...trackers.l1
      ];
      Array.from(new Set(trackersList)).forEach(t => {
        stagesMap[t] = { ...globalStages };
      });
    }

    // Ensure all default/configured trackers exist in stagesMap
    const allTrackers = Array.from(new Set([
      ...DEFAULT_CONFIG.trackers.l3,
      ...DEFAULT_CONFIG.trackers.l2,
      ...DEFAULT_CONFIG.trackers.l1,
      ...(parsed.syncedTrackers || []),
      ...trackers.l3,
      ...trackers.l2,
      ...trackers.l1
    ]));
    
    allTrackers.forEach(t => {
      if (!stagesMap[t]) {
        stagesMap[t] = { ...(stagesMap['__global__'] || DEFAULT_CONFIG.stagesMap['__global__'] || {}) };
      }
    });

    if (!stagesMap['__global__']) {
      stagesMap['__global__'] = { ...DEFAULT_CONFIG.stagesMap['__global__'] };
    }

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      trackers,
      fieldsMap,
      filterFields,
      stagesMap,
      syncedTrackers: Array.isArray(parsed.syncedTrackers) ? parsed.syncedTrackers : DEFAULT_CONFIG.syncedTrackers,
      l3Mode: parsed.l3Mode || 'tracker',
      l3CustomField: parsed.l3CustomField || '',
      l3CustomFieldValue: parsed.l3CustomFieldValue || '',
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// Simple direct request with potential JSONP or proxy explanation.
// Since most Redmine servers require CORS headers, client side direct fetch might fail for on-prem,
// which is why we guide the user clearly, offer demo data, and handle any network exceptions safely.
export async function testConnection(serverUrl: string, token: string): Promise<boolean> {
  if (!serverUrl || !token) return false;
  
  const cleanUrl = serverUrl.replace(/\/$/, '');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    // Usa o proxy para evitar CORS — /redmine-proxy redireciona para o Redmine real
    const url = buildRedmineUrl(cleanUrl, '/users/current.json');
    const response = await fetch(url, {
      method: 'GET',
      headers: buildRedmineHeaders(token),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return true;
    }
    // Tenta entender o erro
    if (response.status === 401) {
      throw new Error('Token de API inválido ou sem permissão. Verifique a chave de API do Redmine.');
    }
    return false;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Se o proxy não estiver disponível (rodando direto no Vite sem proxy), informa claramente
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError') || error?.name === 'AbortError') {
      throw new Error(
        'Não foi possível conectar ao servidor Redmine.\n\n' +
        'Para usar com um servidor Redmine externo, execute o app com:\n' +
        '  npm run serve\n\n' +
        'O servidor proxy embutido resolve o CORS automaticamente.'
      );
    }
    console.error('Redmine connection failed:', error);
    throw error;
  }
}

export async function fetchRedmineIssues(config: RedmineConfig): Promise<Issue[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    return getMockIssues();
  }

  const cleanUrl = config.serverUrl.replace(/\/$/, '');
  
  try {
    // 1. Obter a lista completa de trackers cadastrados com seus IDs
    const trackersList = await fetchRedmineTrackersList(config);
    
    const configSyncedTrackers = Array.isArray(config.syncedTrackers) ? config.syncedTrackers : [];
    
    // Obter os IDs numéricos correspondentes aos trackers sincronizados pelo usuário
    const mappedTrackerIds = trackersList
      .filter(t => configSyncedTrackers.includes(t.name))
      .map(t => t.id);

    // Se o usuário não selecionou nenhum tracker, retorna vazio imediatamente sem fazer requisição à toa
    if (mappedTrackerIds.length === 0) {
      return [];
    }

    // Formata os IDs como uma query string aceita nativamente pelo Redmine: tracker_id=1,2,3...
    const trackerIdsQuery = mappedTrackerIds.join(',');

    // Busca paginada para obter apenas as tarefas que pertencem a estes trackers
    let allIssues: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      // Passa a query parameter tracker_id para que o Redmine filtre os registros diretamente no banco de dados!
      const url = buildRedmineUrl(
        cleanUrl, 
        `/issues.json?limit=${limit}&offset=${offset}&tracker_id=${trackerIdsQuery}&include=custom_fields`
      );
      
      const response = await fetch(url, {
        method: 'GET',
        headers: buildRedmineHeaders(config.token),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do Redmine: ${response.status}`);
      }

      const data = await response.json();
      const pageIssues = data.issues || [];
      allIssues = [...allIssues, ...pageIssues];

      // Se a página retornou menos itens que o limite, não há mais páginas.
      if (pageIssues.length < limit) {
        hasMore = false;
      } else if (data.total_count !== undefined && data.total_count !== null && allIssues.length >= Number(data.total_count)) {
        hasMore = false;
      } else {
        offset += limit;
      }

      // Trava de segurança para evitar loops infinitos
      if (offset > 5000) {
        hasMore = false;
      }
    }

    // Mantemos o filtro em memória como camada dupla de segurança (double-guard)
    const mappedIssues = allIssues.filter((issue: any) => {
      const trackerName = issue.tracker?.name || '';
      return configSyncedTrackers.includes(trackerName);
    });

    // Mapear os cartões filtrados para o schema do FlightLevels do app
    return mappedIssues.map((issue: any): Issue => {
      const trackerName = issue.tracker?.name || '';
      const statusName = issue.status?.name || '';
      
      // Read custom fields
      const customFieldMap: Record<string, string> = {};
      if (issue.custom_fields) {
        issue.custom_fields.forEach((cf: any) => {
          customFieldMap[cf.name] = String(cf.value || '');
          customFieldMap[String(cf.id)] = String(cf.value || '');
        });
      }

      // Map Flight Level
      let level = FlightLevel.L1;
      if (config.l3Mode === 'customField' && config.l3CustomField) {
        const customFieldValue = customFieldMap[config.l3CustomField];
        if (customFieldValue && customFieldValue.trim() !== '' && customFieldValue !== '0' && customFieldValue.toLowerCase() !== 'false') {
          level = FlightLevel.L3;
        } else if (config.trackers.l2.includes(trackerName)) {
          level = FlightLevel.L2;
        }
      } else {
        if (config.trackers.l3.includes(trackerName)) {
          level = FlightLevel.L3;
        } else if (config.trackers.l2.includes(trackerName)) {
          level = FlightLevel.L2;
        }
      }

      // Map Status Stage
      let status: KanbanStage = 'Backlog';
      const trackerStages = (config.stagesMap as any)[trackerName];
      if (trackerStages && typeof trackerStages === 'object' && trackerStages[statusName]) {
        status = trackerStages[statusName];
      } else if (config.stagesMap['__global__'] && config.stagesMap['__global__'][statusName]) {
        status = config.stagesMap['__global__'][statusName];
      } else if (config.stagesMap[statusName] && typeof config.stagesMap[statusName] === 'string') {
        // Legacy fallback
        status = config.stagesMap[statusName] as any;
      } else {
        // Fallback guess logic
        const lowerStatus = statusName.toLowerCase();
        if (lowerStatus.includes('resolvida') || lowerStatus.includes('fechada') || lowerStatus.includes('done') || lowerStatus.includes('concluido')) {
          status = 'Done';
        } else if (lowerStatus.includes('desenho') || lowerStatus.includes('progresso') || lowerStatus.includes('andamento') || lowerStatus.includes('doing') || lowerStatus.includes('desenvolvimento')) {
          status = 'In Progress';
        } else if (lowerStatus.includes('aprov') || lowerStatus.includes('prioriz') || lowerStatus.includes('todo')) {
          status = 'To Do';
        }
      }

      // Retrieve parent ID from custom fields or native parent key
      let parentId: string | undefined = undefined;
      if (issue.parent && issue.parent.id) {
        parentId = String(issue.parent.id);
      } else {
        // Look for custom fields naming parent or strategic links
        const parentCF = issue.custom_fields?.find((cf: any) => 
          cf.name.toLowerCase().includes('pai') || 
          cf.name.toLowerCase().includes('parent') || 
          cf.name.toLowerCase().includes('link_l') ||
          cf.name.toLowerCase().includes('iniciativa')
        );
        if (parentCF && parentCF.value) {
          parentId = String(parentCF.value);
        }
      }

      // Blocked state parsing — use level-appropriate custom field
      const levelKey = level === FlightLevel.L3 ? 'l3' : level === FlightLevel.L2 ? 'l2' : 'l1';
      const levelFields = config.fieldsMap[levelKey];

      let blockedVal = customFieldMap[levelFields.blockedFlag]?.toLowerCase();
      let blocked = false;
      if (blockedVal) {
        blocked = blockedVal === 'sim' || blockedVal === '1' || blockedVal === 'true' || blockedVal === 'yes' || blockedVal === 'bloqueado';
      }
      if (statusName.toLowerCase().includes('bloqueada') || statusName.toLowerCase().includes('impedida')) {
        blocked = true;
      }

      const blockedReason = customFieldMap[levelFields.blockedReason] ||
        (blocked ? 'Marcação de status impeditivo ou bloqueio manual no Redmine.' : undefined);

      // Team: use assigned_to directly (no custom field needed)
      const teamVal = issue.assigned_to?.name || issue.category?.name || 'Unassigned';

      // Calculated age
      const createdDate = new Date(issue.created_on);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - createdDate.getTime());
      const age = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: String(issue.id),
        subject: issue.subject || '',
        description: issue.description || '',
        status,
        redmineStatus: statusName,
        project: issue.project?.name || 'Plano Geral',
        tracker: trackerName,
        assignee: issue.assigned_to?.name || 'Não atribuído',
        assigneeAvatar: issue.assigned_to?.name ? issue.assigned_to.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'NA',
        level,
        parentId,
        blocked,
        blockedReason,
        creationDate: issue.created_on?.slice(0, 10) || getPastDateToday(),
        startDate: issue.start_date || undefined,
        closedDate: issue.closed_on?.slice(0, 10) || undefined,
        points: issue.estimated_hours ? Math.ceil(issue.estimated_hours) : undefined,
        team: teamVal,
        age: age,
        customFields: customFieldMap
      };
    });
  } catch (error) {
    console.error('Erro buscando dados do Redmine:', error);
    throw error;
  }
}

function getPastDateToday() {
  return new Date().toISOString().split('T')[0];
}

export async function fetchRedmineTrackers(config: RedmineConfig): Promise<string[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    return [
      'Strategic Initiative',
      'Portfolio Goal',
      'Value Stream',
      'Feature Epic',
      'Coordination Issue',
      'Task',
      'Bug',
      'Support Request',
      'Sub-task'
    ];
  }

  const cleanUrl = config.serverUrl.replace(/\/$/, '');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    const url = buildRedmineUrl(cleanUrl, '/trackers.json');
    const response = await fetch(url, {
      method: 'GET',
      headers: buildRedmineHeaders(config.token),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro buscando trackers: ${response.status}`);
    }

    const data = await response.json();
    return (data.trackers || []).map((t: any) => t.name);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Erro buscando trackers do Redmine, usando fallback:', error);
    return [
      'Strategic Initiative',
      'Portfolio Goal',
      'Value Stream',
      'Feature Epic',
      'Coordination Issue',
      'Task',
      'Bug',
      'Support Request',
      'Sub-task'
    ];
  }
}

export async function fetchRedmineTrackersList(config: RedmineConfig): Promise<{ id: number; name: string }[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    return [
      { id: 1, name: 'Strategic Initiative' },
      { id: 2, name: 'Portfolio Goal' },
      { id: 3, name: 'Value Stream' },
      { id: 4, name: 'Feature Epic' },
      { id: 5, name: 'Coordination Issue' },
      { id: 6, name: 'Task' },
      { id: 7, name: 'Bug' },
      { id: 8, name: 'Support Request' },
      { id: 9, name: 'Sub-task' }
    ];
  }

  const cleanUrl = config.serverUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    const url = buildRedmineUrl(cleanUrl, '/trackers.json');
    const response = await fetch(url, {
      method: 'GET',
      headers: buildRedmineHeaders(config.token),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro buscando trackers: ${response.status}`);
    }

    const data = await response.json();
    return (data.trackers || []).map((t: any) => ({
      id: Number(t.id),
      name: String(t.name)
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Erro buscando lista detalhada de trackers do Redmine, usando fallback:', error);
    return [
      { id: 1, name: 'Strategic Initiative' },
      { id: 2, name: 'Portfolio Goal' },
      { id: 3, name: 'Value Stream' },
      { id: 4, name: 'Feature Epic' },
      { id: 5, name: 'Coordination Issue' },
      { id: 6, name: 'Task' },
      { id: 7, name: 'Bug' },
      { id: 8, name: 'Support Request' },
      { id: 9, name: 'Sub-task' }
    ];
  }
}

export async function fetchRedmineCustomFields(config: RedmineConfig): Promise<{ id: string; name: string; possibleValues?: string[] }[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    return [
      { id: '1', name: 'Impedimento (Blocked Flag)', possibleValues: ['Sim', 'Não'] },
      { id: '2', name: 'Motivo do Impedimento' },
      { id: '3', name: 'Squad Responsável', possibleValues: ['Squad A', 'Squad B', 'Squad C', 'Squad D'] },
      { id: '4', name: 'Área de Coordenação', possibleValues: ['Marketing', 'Vendas', 'Engenharia', 'Diretoria'] },
      { id: '5', name: 'Flight Level', possibleValues: ['L3', 'L2', 'L1', 'Strategic', 'Coordination', 'Operational'] },
      { id: '6', name: 'Business Value', possibleValues: ['Alto', 'Médio', 'Baixo'] },
      { id: '7', name: 'Fila de Origem', possibleValues: ['Suporte', 'Interno', 'Diretoria'] }
    ];
  }

  const cleanUrl = config.serverUrl.replace(/\/$/, '');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    const url = buildRedmineUrl(cleanUrl, '/custom_fields.json');
    const response = await fetch(url, {
      method: 'GET',
      headers: buildRedmineHeaders(config.token),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro buscando custom fields: ${response.status}`);
    }

    const data = await response.json();
    return (data.custom_fields || []).map((cf: any) => {
      let possibleValues: string[] | undefined = undefined;
      if (Array.isArray(cf.possible_values)) {
        possibleValues = cf.possible_values.map((v: any) => {
          if (v && typeof v === 'object' && v.value !== undefined) {
            return String(v.value);
          }
          return String(v);
        });
      }
      return {
        id: String(cf.id),
        name: cf.name,
        possibleValues
      };
    });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Erro buscando campos personalizados do Redmine, usando fallback:', error);
    return [
      { id: '1', name: 'Impedimento (Blocked Flag)', possibleValues: ['Sim', 'Não'] },
      { id: '2', name: 'Motivo do Impedimento' },
      { id: '3', name: 'Squad Responsável', possibleValues: ['Squad A', 'Squad B', 'Squad C', 'Squad D'] },
      { id: '4', name: 'Área de Coordenação', possibleValues: ['Marketing', 'Vendas', 'Engenharia', 'Diretoria'] },
      { id: '5', name: 'Flight Level', possibleValues: ['L3', 'L2', 'L1', 'Strategic', 'Coordination', 'Operational'] },
      { id: '6', name: 'Business Value', possibleValues: ['Alto', 'Médio', 'Baixo'] },
      { id: '7', name: 'Fila de Origem', possibleValues: ['Suporte', 'Interno', 'Diretoria'] }
    ];
  }
}

export async function fetchRedmineStatuses(config: RedmineConfig): Promise<{ id: string; name: string; is_default?: boolean; is_closed?: boolean }[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    return [
      { id: '1', name: 'Nova', is_default: true, is_closed: false },
      { id: '2', name: 'Em Discussão', is_default: false, is_closed: false },
      { id: '3', name: 'Aprovada', is_default: false, is_closed: false },
      { id: '4', name: 'Em Desenvolvimento', is_default: false, is_closed: false },
      { id: '5', name: 'Bloqueada', is_default: false, is_closed: false },
      { id: '6', name: 'Em Teste', is_default: false, is_closed: false },
      { id: '7', name: 'Aguardando Homologação', is_default: false, is_closed: false },
      { id: '8', name: 'Resolvida', is_default: false, is_closed: true },
      { id: '9', name: 'Fechada', is_default: false, is_closed: true },
      { id: '10', name: 'Rejeitada', is_default: false, is_closed: true }
    ];
  }

  const cleanUrl = config.serverUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    const url = buildRedmineUrl(cleanUrl, '/issue_statuses.json');
    const response = await fetch(url, {
      method: 'GET',
      headers: buildRedmineHeaders(config.token),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro buscando status do Redmine: ${response.status}`);
    }

    const data = await response.json();
    return (data.issue_statuses || []).map((status: any) => ({
      id: String(status.id),
      name: status.name,
      is_default: !!status.is_default,
      is_closed: !!status.is_closed
    }));
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Erro buscando status do Redmine:', error);
    throw error;
  }
}

export async function fetchRedmineTrackersWithStatuses(config: RedmineConfig): Promise<{ name: string; statuses: { id: string; name: string }[] }[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    const demoStatuses = [
      { id: '1', name: 'Nova' },
      { id: '2', name: 'Em Discussão' },
      { id: '3', name: 'Aprovada' },
      { id: '4', name: 'Em Desenvolvimento' },
      { id: '5', name: 'Bloqueada' },
      { id: '6', name: 'Em Teste' },
      { id: '7', name: 'Aguardando Homologação' },
      { id: '8', name: 'Resolvida' },
      { id: '9', name: 'Fechada' },
      { id: '10', name: 'Rejeitada' }
    ];
    
    return [
      {
        name: 'Strategic Initiative',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Discussão', 'Aprovada', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Portfolio Goal',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Discussão', 'Aprovada', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Value Stream',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Discussão', 'Aprovada', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Feature Epic',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Discussão', 'Aprovada', 'Em Desenvolvimento', 'Bloqueada', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Coordination Issue',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Discussão', 'Aprovada', 'Em Desenvolvimento', 'Bloqueada', 'Em Teste', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Task',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Desenvolvimento', 'Bloqueada', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Bug',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Desenvolvimento', 'Bloqueada', 'Em Teste', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Support Request',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Desenvolvimento', 'Resolvida', 'Fechada'].includes(s.name))
      },
      {
        name: 'Sub-task',
        statuses: demoStatuses.filter(s => ['Nova', 'Em Desenvolvimento', 'Resolvida', 'Fechada'].includes(s.name))
      }
    ];
  }

  const cleanUrl = config.serverUrl.replace(/\/$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  
  try {
    const allStatuses = await fetchRedmineStatuses(config);
    
    const url = buildRedmineUrl(cleanUrl, '/trackers.json');
    const response = await fetch(url, {
      method: 'GET',
      headers: buildRedmineHeaders(config.token),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro buscando trackers: ${response.status}`);
    }

    const data = await response.json();
    return (data.trackers || []).map((t: any) => {
      const trackerStatuses = t.statuses 
        ? t.statuses.map((s: any) => ({ id: String(s.id), name: s.name })) 
        : allStatuses;
      return {
        name: String(t.name),
        statuses: trackerStatuses.length > 0 ? trackerStatuses : allStatuses
      };
    });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Erro buscando trackers com status, usando fallback:', error);
    
    const allStatuses = await fetchRedmineStatuses(config).catch(() => [
      { id: '1', name: 'Nova' },
      { id: '2', name: 'Em Discussão' },
      { id: '3', name: 'Aprovada' },
      { id: '4', name: 'Em Desenvolvimento' },
      { id: '5', name: 'Bloqueada' },
      { id: '6', name: 'Em Teste' },
      { id: '7', name: 'Aguardando Homologação' },
      { id: '8', name: 'Resolvida' },
      { id: '9', name: 'Fechada' },
      { id: '10', name: 'Rejeitada' }
    ]);
    
    const trackersList = [
      'Strategic Initiative', 'Portfolio Goal', 'Value Stream', 'Feature Epic', 
      'Coordination Issue', 'Task', 'Bug', 'Support Request', 'Sub-task'
    ];
    
    return trackersList.map(name => ({
      name,
      statuses: allStatuses
    }));
  }
}

