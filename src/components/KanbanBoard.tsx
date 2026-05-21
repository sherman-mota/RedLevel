import React, { useState, useMemo } from 'react';
import { 
  Satellite, 
  Plane, 
  Monitor, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  HelpCircle,
  Plus,
  RefreshCw,
  GitCommit,
  Group,
  Rows,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  User,
  ExternalLink
} from 'lucide-react';
import { FlightLevel, Issue, RedmineConfig, KanbanStage, FilterState } from '../types';

interface KanbanBoardProps {
  level: FlightLevel;
  issues: Issue[];
  filters: FilterState;
  config: RedmineConfig;
  onUpdateIssue?: (updatedIssue: Issue) => void;
  onSelectIssue?: (issue: Issue) => void;
  onAddIssue?: (level: FlightLevel) => void;
}

const STAGES: KanbanStage[] = ['Backlog', 'To Do', 'In Progress', 'Done'];

export default function KanbanBoard({
  level,
  issues,
  filters,
  config,
  onUpdateIssue,
  onSelectIssue,
  onAddIssue
}: KanbanBoardProps) {
  
  // Swimlane support for Level 2
  const [useSwimlanes, setUseSwimlanes] = useState(false);
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Record<string, boolean>>({});

  // Get active configurations based on levels
  const levelDetails = useMemo(() => {
    switch (level) {
      case FlightLevel.L3:
        return {
          title: 'Configuração Estratégica (L3)',
          subtitle: 'Visão Geral das Iniciativas e Objetivos de Portfólio',
          icon: Satellite,
          accentColor: 'border-purple-600 bg-purple-50 text-purple-855',
          bulletColor: 'bg-purple-600',
          levelLabel: 'Estratégico'
        };
      case FlightLevel.L2:
        return {
          title: 'Configuração Tática (L2)',
          subtitle: 'Gestão de Fluxos de Valor e Sincronização entre Equipes',
          icon: Plane,
          accentColor: 'border-blue-600 bg-blue-50 text-blue-800',
          bulletColor: 'bg-blue-600',
          levelLabel: 'Coordenação'
        };
      case FlightLevel.L1:
      default:
        return {
          title: 'Configuração Operacional (L1)',
          subtitle: 'Quadro de Tarefas Granulares, Erros e Entregas Diárias',
          icon: Monitor,
          accentColor: 'border-emerald-600 bg-emerald-50 text-emerald-800',
          bulletColor: 'bg-emerald-600',
          levelLabel: 'Operacional'
        };
    }
  }, [level]);

  // Filter Issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Must match active Flight Level
      if (issue.level !== level) return false;

      // Match Search Terms
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!issue.subject.toLowerCase().includes(query) && !issue.id.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Match Project Name
      if (filters.project && issue.project !== filters.project) {
        return false;
      }

      // Match Team / Area — team is on the Issue directly (from assigned_to)
      if (filters.team) {
        const issueTeamVal = issue.team || '';
        if (issueTeamVal.toLowerCase() !== filters.team.toLowerCase()) {
          return false;
        }
      }

      // Match Blocked state
      if (filters.blockedOnly && !issue.blocked) {
        return false;
      }

      // Match custom grouping values (uses l2 groupingField)
      if (filters.selectedGroupFieldVal) {
        const groupVal = issue.customFields[config.fieldsMap.l2.groupingField] || '';
        if (!groupVal.toLowerCase().includes(filters.selectedGroupFieldVal.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [issues, level, filters, config]);

  // Extract unique teams/areas representing grouping option for Swimlanes
  const uniqueGroups = useMemo(() => {
    const list = new Set<string>();
    issues.forEach(i => {
      if (i.level === level) {
        // Group by user designated grouping field in configs
        const gFieldVal = i.customFields[config.fieldsMap.l2.groupingField] || i.team || 'Não Categorizado';
        list.add(gFieldVal);
      }
    });
    return Array.from(list);
  }, [issues, level, config]);

  // CALCULATE SPECIAL LEVEL KPIs
  const kpis = useMemo(() => {
    const levelIssues = issues.filter(i => i.level === level);
    const completed = levelIssues.filter(i => i.status === 'Done');
    const active = levelIssues.filter(i => i.status !== 'Done' && i.status !== 'Backlog');
    const blockedCount = levelIssues.filter(i => i.blocked).length;

    // Calculate simulated active lead times
    const totalLeadTime = completed.length ? completed.reduce((acc, curr) => acc + (curr.age || 5), 0) : 0;
    const avgLeadTime = completed.length ? Math.round(totalLeadTime / completed.length) : 18;

    // WIP Age
    const totalWipAge = active.length ? active.reduce((acc, curr) => acc + (curr.age || 0), 0) : 0;
    const avgWipAge = active.length ? Math.round(totalWipAge / active.length) : 0;

    return {
      leadTime: avgLeadTime,
      throughput: completed.length,
      wipAge: avgWipAge,
      blocked: blockedCount,
      activeWip: active.length
    };
  }, [issues, level]);

  const toggleSwimlane = (group: string) => {
    setCollapsedSwimlanes(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Helper to move issues along columns directly in simulator modes
  const handleMoveIssue = (issue: Issue, newStage: KanbanStage) => {
    if (onUpdateIssue) {
      onUpdateIssue({
        ...issue,
        status: newStage,
        redmineStatus: newStage === 'Done' ? 'Fechada' : newStage === 'In Progress' ? 'Em Desenvolvimento' : 'Nova'
      });
    }
  };

  // Quick Block/Unblock toggle to simulate real impediments resolution and triggers
  const handleToggleBlock = (e: React.MouseEvent, issue: Issue) => {
    e.stopPropagation();
    if (onUpdateIssue) {
      onUpdateIssue({
        ...issue,
        blocked: !issue.blocked,
        blockedReason: !issue.blocked ? 'Remoção temporária de infraestrutura ou falta de validação de equipe.' : undefined
      });
    }
  };

  // Render individual task card
  const renderCard = (issue: Issue) => {
    return (
      <div
        key={issue.id}
        onClick={() => onSelectIssue?.(issue)}
        className={`bg-white border ${issue.blocked ? 'border-red-300 bg-red-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300'} rounded p-3 text-xs shadow-xs hover:shadow-md transition-all cursor-pointer select-none space-y-3 relative group`}
      >
        {/* Level border accent */}
        <div className={`absolute top-0 left-0 bottom-0 w-[4px] rounded-l ${level === FlightLevel.L3 ? 'bg-purple-600' : level === FlightLevel.L2 ? 'bg-blue-600' : 'bg-emerald-600'}`} />

        <div className="flex items-start justify-between gap-1 pl-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-bold text-slate-500 hover:underline">{issue.id}</span>
            {issue.parentId && (
              <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 rounded flex items-center gap-0.5">
                Pai: {issue.parentId}
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => handleToggleBlock(e, issue)}
            className={`p-1 rounded text-[9px] font-bold ${issue.blocked ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity'}`}
            title={issue.blocked ? 'Remover bloqueio' : 'Marcar como bloqueado'}
          >
            🚫 {issue.blocked ? 'Bloqueado' : 'Bloquear'}
          </button>
        </div>

        <div className="pl-1">
          <p className="font-semibold text-slate-800 leading-snug hover:text-indigo-600 line-clamp-2">
            {issue.subject}
          </p>
          {issue.description && (
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{issue.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between pl-1 pt-2 border-t border-slate-105 text-[10px]">
          {/* Custom field and area mappings display */}
          <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[140px]">
            <User className="w-3 h-3 flex-shrink-0 text-slate-400" />
            <span className="truncate">{issue.assignee || 'Selecione'}</span>
          </div>

          <div className="flex items-center gap-1">
            {issue.points && (
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                {issue.points}{level === FlightLevel.L1 ? 'pts' : 'h'}
              </span>
            )}
            <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-full font-semibold">
              {issue.team || 'Squad'}
            </span>
          </div>
        </div>

        {/* Quick Simulator Transitions */}
        <div className="flex items-center justify-end gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] text-slate-400 mr-1.5">Mover:</span>
          {STAGES.filter(s => s !== issue.status).map(stage => (
            <button
              key={stage}
              onClick={(e) => {
                e.stopPropagation();
                handleMoveIssue(issue, stage);
              }}
              className="px-1.5 py-0.5 bg-slate-100 rounded hover:bg-indigo-100 text-slate-600 font-mono text-[9px] transition-colors"
            >
              {stage === 'Backlog' ? 'Bk' : stage === 'To Do' ? 'To' : stage === 'In Progress' ? 'Ip' : 'Dn'}
            </button>
          ))}
        </div>

        {/* Blocked Alert Banner banner */}
        {issue.blocked && issue.blockedReason && (
          <div className="p-2 bg-red-100/70 text-red-900 text-[10px] rounded border border-red-300 flex items-start gap-1">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-600" />
            <p className="leading-tight"><b>Bloqueio: </b>{issue.blockedReason}</p>
          </div>
        )}
      </div>
    );
  };

  const LevelIcon = levelDetails.icon;

  return (
    <div className="space-y-6">
      
      {/* KANBAN HEADER AND BRIEFING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${levelDetails.accentColor}`}>
            <LevelIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {levelDetails.title}
            </h2>
            <p className="text-xs text-slate-400">{levelDetails.subtitle}</p>
          </div>
        </div>

        {/* Option for Level 2 Swimlanes toggle */}
        {level === FlightLevel.L2 && (
          <div className="flex items-center gap-2 bg-slate-50 border p-1 rounded-lg">
            <button
              onClick={() => setUseSwimlanes(false)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold ${!useSwimlanes ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Colunas Normais</span>
            </button>
            <button
              onClick={() => setUseSwimlanes(true)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold ${useSwimlanes ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}
              title="Agrupar por campo personalizado 'Área de Atuação'"
            >
              <Group className="w-3.5 h-3.5" />
              <span>Swimlanes por Área ({config.fieldsMap.l2.groupingField})</span>
            </button>
          </div>
        )}

        {onAddIssue && (
          <button
            onClick={() => onAddIssue(level)}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded text-xs font-bold text-white bg-[#8a2d46] hover:bg-[#80253e] shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Registro {levelDetails.levelLabel}</span>
          </button>
        )}
      </div>

      {/* --- LEVEL HIGH END INTERACTIVE MINI KPIS PANEL --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-pink-100/50 text-pink-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead Time Médio</p>
            <h3 className="text-xl font-black text-slate-800">
              {kpis.leadTime} dias
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Média de conclusão histórica</p>
          </div>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-100/50 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Throughput</p>
            <h3 className="text-xl font-black text-slate-800">
              {kpis.throughput} entregas
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Fechados em Done</p>
          </div>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-100/50 text-amber-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">WIP Age Ativo</p>
            <h3 className="text-xl font-black text-slate-800">
              {kpis.wipAge} dias
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Idade do WIP em processamento</p>
          </div>
        </div>

        <div className="bg-white border p-4 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className={`p-2.5 rounded-lg ${kpis.blocked > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bloqueios Ativos</p>
            <h3 className="text-xl font-black text-slate-800">
              {kpis.blocked} impedimentos
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Itens parados no fluxo</p>
          </div>
        </div>

      </div>

      {/* --- STANDARD REGULAR VERTICAL COLUMNS KANBAN --- */}
      {!useSwimlanes ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const laneIssues = filteredIssues.filter(i => i.status === stage);
            return (
              <div 
                key={stage}
                className="flex flex-col bg-slate-50 rounded-xl p-3 border border-slate-200/70 min-h-[500px]"
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3 border-b mb-3 font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${levelDetails.bulletColor}`} />
                    <span className="text-sm font-bold">{stage}</span>
                  </div>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {laneIssues.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[800px] scrollbar-thin">
                  {laneIssues.length === 0 ? (
                    <div className="h-28 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-350">
                      <span className="text-xs italic text-slate-400">Vazio</span>
                    </div>
                  ) : (
                    laneIssues.map(issue => renderCard(issue))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- LEVEL 2 ONLY: ADVANCED SWIMLANES KANBAN --- */
        <div className="space-y-6">
          <div className="bg-slate-100 p-2 rounded-lg text-xs font-mono text-slate-500 border">
            💡 <b>Modo Swimlanes:</b> Agrupando todas as raias horizontais pelo campo customizado <b>{config.fieldsMap.l2.groupingField}</b>.
          </div>

          <div className="space-y-4">
            {uniqueGroups.map(groupName => {
              const groupIssues = filteredIssues.filter(i => {
                const cfVal = i.customFields[config.fieldsMap.l2.groupingField] || i.team || 'Não Categorizado';
                return cfVal === groupName;
              });

              const isCollapsed = collapsedSwimlanes[groupName] || false;
              const groupBlockedCount = groupIssues.filter(i => i.blocked).length;

              return (
                <div 
                  key={groupName}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                >
                  {/* Swimlane Header bar */}
                  <div 
                    onClick={() => toggleSwimlane(groupName)}
                    className="p-3 bg-slate-50 border-b flex items-center justify-between cursor-pointer hover:bg-slate-100 select-none"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? <ChevronRight className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      <span className="font-bold text-sm text-slate-800 uppercase tracking-wider font-mono">
                        📁 {groupName}
                      </span>
                      <span className="text-xs bg-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                        {groupIssues.length} Itens
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {groupBlockedCount > 0 && (
                        <span className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {groupBlockedCount} Bloqueado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Columns Grid inside Swimlane */}
                  {!isCollapsed && (
                    <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-50">
                      {STAGES.map(stage => {
                        const stageGroupIssues = groupIssues.filter(i => i.status === stage);
                        return (
                          <div key={stage} className="space-y-3 bg-white/70 p-2.5 rounded border border-slate-150">
                            {/* Short Label */}
                            <p className="text-[10px] uppercase font-bold text-slate-400 pb-1.5 border-b flex justify-between items-center">
                              <span>{stage}</span>
                              <span className="font-mono bg-slate-100 px-1.5 rounded">{stageGroupIssues.length}</span>
                            </p>
                            
                            <div className="space-y-2.5 min-h-[80px]">
                              {stageGroupIssues.length === 0 ? (
                                <p className="text-[11px] text-center italic text-slate-350 pt-4">Nenhum</p>
                              ) : (
                                stageGroupIssues.map(issue => renderCard(issue))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
