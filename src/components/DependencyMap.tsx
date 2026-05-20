import React, { useState, useMemo } from 'react';
import { 
  GitMerge, 
  Satellite, 
  Plane, 
  Monitor, 
  ShieldAlert, 
  ArrowRight,
  Info,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { FlightLevel, Issue, Dependency, RedmineConfig, FilterState } from '../types';
import { getMockDependencies } from '../mockData';

interface DependencyMapProps {
  issues: Issue[];
  filters: FilterState;
  config: RedmineConfig;
}

export default function DependencyMap({
  issues,
  filters,
  config
}: DependencyMapProps) {
  // Local state for actively selected node to trace dependencies
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Retrieve dependencies
  const dependencies = useMemo(() => {
    return getMockDependencies();
  }, []);

  // Filter Issues based on global filter states
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!issue.subject.toLowerCase().includes(query) && !issue.id.toLowerCase().includes(query)) return false;
      }
      if (filters.project && issue.project !== filters.project) return false;
      if (filters.team) {
        const issueTeamVal = issue.team || issue.customFields[config.fieldsMap.team] || '';
        if (issueTeamVal.toLowerCase() !== filters.team.toLowerCase()) return false;
      }
      if (filters.blockedOnly && !issue.blocked) return false;
      return true;
    });
  }, [issues, filters, config]);

  // Group filtered issues by flight levels for structural column visualization
  const l3Issues = useMemo(() => filteredIssues.filter(i => i.level === FlightLevel.L3), [filteredIssues]);
  const l2Issues = useMemo(() => filteredIssues.filter(i => i.level === FlightLevel.L2), [filteredIssues]);
  const l1Issues = useMemo(() => filteredIssues.filter(i => i.level === FlightLevel.L1), [filteredIssues]);

  // Determine paths connected to selected issue ID for beautiful path highlighting
  const highlightedNetwork = useMemo(() => {
    if (!selectedIssueId) return { nodeIds: new Set<string>(), dependencyIds: new Set<string>() };

    const nodes = new Set<string>([selectedIssueId]);
    const deps = new Set<string>();

    // Bidirectional trace up to 3 levels deep
    let addedNew = true;
    while (addedNew) {
      addedNew = false;
      dependencies.forEach(d => {
        const hasSource = nodes.has(d.sourceId);
        const hasTarget = nodes.has(d.targetId);

        if ((hasSource || hasTarget) && !deps.has(d.id)) {
          deps.add(d.id);
          nodes.add(d.sourceId);
          nodes.add(d.targetId);
          addedNew = true;
        }
      });
    }

    return { nodeIds: nodes, dependencyIds: deps };
  }, [selectedIssueId, dependencies]);

  // Render individual Node Card
  const renderNode = (issue: Issue) => {
    const isHighlighted = selectedIssueId === null || highlightedNetwork.nodeIds.has(issue.id);
    const isSelected = selectedIssueId === issue.id;

    return (
      <div
        key={issue.id}
        onClick={() => setSelectedIssueId(isSelected ? null : issue.id)}
        className={`w-full p-3.5 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 shadow-xs ${
          isSelected 
            ? 'border-[#8a2d46] ring-2 ring-[#8a2d46] bg-[#8a2d46]/5 scale-[1.01] z-10' 
            : isHighlighted 
            ? 'border-slate-200 bg-white hover:border-slate-450 hover:shadow' 
            : 'border-slate-100 bg-white/55 opacity-40 hover:opacity-80'
        }`}
      >
        {/* Accented edge indicator */}
        <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-lg ${
          issue.level === FlightLevel.L3 ? 'bg-purple-600' : issue.level === FlightLevel.L2 ? 'bg-blue-600' : 'bg-emerald-600'
        }`} />

        <div className="pl-1">
          <div className="flex items-center justify-between gap-1 mb-1.5Packed">
            <span className="font-mono text-[10px] font-bold text-slate-400">{issue.id}</span>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm ${
                issue.status === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {issue.status}
              </span>
            </div>
          </div>
          
          <h4 className="font-bold text-slate-800 text-xs text-left leading-normal line-clamp-2">
            {issue.subject}
          </h4>
        </div>

        <div className="pl-1 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-50">
          <span className="text-slate-400 font-medium truncate max-w-[100px]">👤 {issue.assignee || 'Unassigned'}</span>
          <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">{issue.team || 'Todas'}</span>
        </div>

        {/* Highlight Blocker */}
        {issue.blocked && (
          <div className="p-2 bg-red-100 text-red-900 text-[10px] rounded flex items-start gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="leading-tight font-medium">Bloqueado! {issue.blockedReason?.slice(0, 40)}...</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* MAP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8a2d46] text-white flex items-center justify-center">
            <GitMerge className="w-5 h-5 text-pink-100" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Mapa das Dependências Globais</h2>
            <p className="text-xs text-slate-400">Rastreabilidade completa de ponta-a-ponta ligando metas de alta diretoria às tarefas operacionais</p>
          </div>
        </div>

        <div className="text-xs bg-slate-100 border text-slate-600 py-1.5 px-3.5 rounded-lg flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#8a2d46]" />
          <span>Clique em qualquer cartão para recalcular e destacar seu canal de conexões.</span>
        </div>
      </div>

      {/* THREE TIER MAP FLOW TREE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        
        {/* --- LEVEL 3 --- */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed space-y-4 min-h-[500px]">
          <div className="flex items-center gap-2 pb-2.5 border-b border-b-purple-200 text-purple-800">
            <Satellite className="w-4.5 h-4.5" />
            <h3 className="font-bold text-sm tracking-wider uppercase font-sans">L3 - Estratégico ({l3Issues.length})</h3>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {l3Issues.map(issue => renderNode(issue))}
            {l3Issues.length === 0 && (
              <p className="text-center italic text-slate-400 pt-16 text-xs">Nenhuma Iniciativa L3 Encontrada</p>
            )}
          </div>
        </div>

        {/* --- LEVEL 2 --- */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed space-y-4 min-h-[500px]">
          <div className="flex items-center gap-2 pb-2.5 border-b border-b-blue-200 text-blue-800">
            <Plane className="w-4.5 h-4.5" />
            <h3 className="font-bold text-sm tracking-wider uppercase font-sans">L2 - Coordenação ({l2Issues.length})</h3>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {l2Issues.map(issue => renderNode(issue))}
            {l2Issues.length === 0 && (
              <p className="text-center italic text-slate-400 pt-16 text-xs">Nenhum Projeto L2 Encontrado</p>
            )}
          </div>
        </div>

        {/* --- LEVEL 1 --- */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed space-y-4 min-h-[500px]">
          <div className="flex items-center gap-2 pb-2.5 border-b border-b-emerald-200 text-emerald-800">
            <Monitor className="w-4.5 h-4.5" />
            <h3 className="font-bold text-sm tracking-wider uppercase font-sans">L1 - Operacional ({l1Issues.length})</h3>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {l1Issues.map(issue => renderNode(issue))}
            {l1Issues.length === 0 && (
              <p className="text-center italic text-slate-400 pt-16 text-xs">Nenhuma Demanda L1 Encontrada</p>
            )}
          </div>
        </div>

      </div>

      {/* ACTIVE DEPENDENT LIST LEGEND SCREEN */}
      {selectedIssueId && (
        <div className="p-4 bg-white text-slate-800 rounded-xl border border-[#8a2d46]/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold font-mono text-[#8a2d46] flex items-center gap-1.5">
              <span className="animate-ping w-2 h-2 rounded-full bg-[#8a2d46] inline-block" />
              FLUXO DE DEPENDÊNCIAS ATIVO: {selectedIssueId}
            </p>
            <button 
              onClick={() => setSelectedIssueId(null)}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold px-2 py-1 rounded border"
            >
              Remover Filtro de Caminho
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-500 mb-2">Hierarquia Relacionada (Iniciativas / Tarefas)</p>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600">
                {dependencies
                  .filter(d => (d.sourceId === selectedIssueId || d.targetId === selectedIssueId) && d.type === 'parent-child')
                  .map(d => (
                    <li key={d.id}>
                      Origem: <b className="font-bold text-slate-800">{d.sourceId}</b> ➡️ Destino/Mãe: <b className="font-bold text-slate-800">{d.targetId}</b>
                    </li>
                  ))}
                {dependencies.filter(d => (d.sourceId === selectedIssueId || d.targetId === selectedIssueId) && d.type === 'parent-child').length === 0 && (
                  <p className="italic text-slate-400">Sem enlaces diretos registrados.</p>
                )}
              </ul>
            </div>

            <div>
              <p className="font-bold text-red-700 mb-2">Bloqueios & Gargalos (Blocked-By)</p>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600">
                {dependencies
                  .filter(d => (d.sourceId === selectedIssueId || d.targetId === selectedIssueId) && d.type === 'blocked-by')
                  .map(d => (
                    <li key={d.id} className="text-red-700">
                      Entrave: <b className="font-bold text-red-800">{d.sourceId}</b> está bloqueado por ➡️ <b className="font-bold text-red-800">{d.targetId}</b>
                    </li>
                  ))}
                {dependencies.filter(d => (d.sourceId === selectedIssueId || d.targetId === selectedIssueId) && d.type === 'blocked-by').length === 0 && (
                  <p className="italic text-slate-400">Nenhum impeditivo bloqueante inter-squad detectado nesta trilha.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
