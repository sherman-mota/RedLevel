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

export const DEFAULT_CONFIG: RedmineConfig = {
  serverUrl: '',
  token: '',
  isConnected: false,
  useDemoWorkspace: true,
  activeTheme: 'modern',
  trackers: {
    l3: ['Strategic Initiative', 'Portfolio Goal'],
    l2: ['Value Stream', 'Feature Epic', 'Coordination Issue'],
    l1: ['Task', 'Bug', 'Support Request', 'Sub-task']
  },
  stagesMap: {
    'Nova': 'Backlog',
    'Em Discussão': 'To Do',
    'Aprovada': 'To Do',
    'Em Desenvolvimento': 'In Progress',
    'Bloqueada': 'In Progress',
    'Em Teste': 'In Progress',
    'Resolvida': 'Done',
    'Fechada': 'Done'
  },
  fieldsMap: {
    blockedFlag: 'blocked_custom_field',
    blockedReason: 'blocked_reason_custom_field',
    team: 'team_custom_field',
    leadTimeStart: 'Em Desenvolvimento',
    groupingField: 'area_coordenacao'
  }
};

export function saveConfig(config: RedmineConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadConfig(): RedmineConfig {
  const data = localStorage.getItem(CONFIG_KEY);
  if (!data) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(data);
    return { ...DEFAULT_CONFIG, ...parsed };
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
    
    const configTrackers = config.trackers || {};
    const l3 = Array.isArray(configTrackers.l3) ? configTrackers.l3 : [];
    const l2 = Array.isArray(configTrackers.l2) ? configTrackers.l2 : [];
    const l1 = Array.isArray(configTrackers.l1) ? configTrackers.l1 : [];
    
    const allMappedNames = [...l3, ...l2, ...l1];
    
    // Obter os IDs numéricos correspondentes aos trackers mapeados pelo usuário
    const mappedTrackerIds = trackersList
      .filter(t => allMappedNames.includes(t.name))
      .map(t => t.id);

    // Se o usuário não mapeou nenhum tracker, retorna vazio imediatamente sem fazer requisição à toa
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
      return l3.includes(trackerName) || l2.includes(trackerName) || l1.includes(trackerName);
    });

    // Mapear os cartões filtrados para o schema do FlightLevels do app
    return mappedIssues.map((issue: any): Issue => {
      const trackerName = issue.tracker?.name || '';
      const statusName = issue.status?.name || '';
      
      // Map Flight Level
      let level = FlightLevel.L1;
      if (config.trackers.l3.includes(trackerName)) {
        level = FlightLevel.L3;
      } else if (config.trackers.l2.includes(trackerName)) {
        level = FlightLevel.L2;
      }

      // Map Status Stage
      let status: KanbanStage = 'Backlog';
      if (config.stagesMap[statusName]) {
        status = config.stagesMap[statusName];
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

      // Read custom fields
      const customFieldMap: Record<string, string> = {};
      if (issue.custom_fields) {
        issue.custom_fields.forEach((cf: any) => {
          customFieldMap[cf.name] = String(cf.value || '');
          customFieldMap[String(cf.id)] = String(cf.value || '');
        });
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

      // Blocked state parsing
      let blockedVal = customFieldMap[config.fieldsMap.blockedFlag]?.toLowerCase();
      let blocked = false;
      if (blockedVal) {
        blocked = blockedVal === 'sim' || blockedVal === '1' || blockedVal === 'true' || blockedVal === 'yes' || blockedVal === 'bloqueado';
      }
      if (statusName.toLowerCase().includes('bloqueada') || statusName.toLowerCase().includes('impedida')) {
        blocked = true;
      }

      const blockedReason = customFieldMap[config.fieldsMap.blockedReason] || 
        (blocked ? 'Marcação de status impeditivo ou bloqueio manual no Redmine.' : undefined);

      // Team mapping
      const teamVal = customFieldMap[config.fieldsMap.team] || issue.category?.name || 'Unassigned';

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

export async function fetchRedmineCustomFields(config: RedmineConfig): Promise<{ id: string; name: string }[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    return [
      { id: '1', name: 'Impedimento (Blocked Flag)' },
      { id: '2', name: 'Motivo do Impedimento' },
      { id: '3', name: 'Squad Responsável' },
      { id: '4', name: 'Área de Coordenação' },
      { id: '5', name: 'Flight Level' },
      { id: '6', name: 'Business Value' },
      { id: '7', name: 'Fila de Origem' }
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
    return (data.custom_fields || []).map((cf: any) => ({
      id: String(cf.id),
      name: cf.name
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Erro buscando campos personalizados do Redmine, usando fallback:', error);
    return [
      { id: '1', name: 'Impedimento (Blocked Flag)' },
      { id: '2', name: 'Motivo do Impedimento' },
      { id: '3', name: 'Squad Responsável' },
      { id: '4', name: 'Área de Coordenação' },
      { id: '5', name: 'Flight Level' },
      { id: '6', name: 'Business Value' },
      { id: '7', name: 'Fila de Origem' }
    ];
  }
}
