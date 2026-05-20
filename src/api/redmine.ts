import { RedmineConfig, Issue, FlightLevel, KanbanStage } from '../types';
import { getMockIssues } from '../mockData';

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
  
  // Clean trailing slashes
  const cleanUrl = serverUrl.replace(/\/$/, '');
  
  try {
    const response = await fetch(`${cleanUrl}/users/current.json`, {
      method: 'GET',
      headers: {
        'X-Redmine-API-Key': token,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Redmine connection failed (likely CORS or wrong URL):', error);
    throw new Error(
      'Não foi possível conectar ao servidor Redmine. ' +
      'Verifique se a URL está correta e se o servidor suporta CORS para requisições desta origem.'
    );
  }
}

export async function fetchRedmineIssues(config: RedmineConfig): Promise<Issue[]> {
  if (config.useDemoWorkspace || !config.serverUrl || !config.token) {
    return getMockIssues();
  }

  const cleanUrl = config.serverUrl.replace(/\/$/, '');
  
  try {
    // Redmine API request for issues
    const response = await fetch(`${cleanUrl}/issues.json?limit=100&include=custom_fields`, {
      method: 'GET',
      headers: {
        'X-Redmine-API-Key': config.token,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do Redmine: ${response.status}`);
    }

    const data = await response.json();
    const redmineIssues = data.issues || [];

    // Parse and map Redmine issues to FlightLevel schemas
    return redmineIssues.map((issue: any): Issue => {
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
