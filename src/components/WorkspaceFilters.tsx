import React from 'react';
import { Filter, X, RefreshCw, Search, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { FilterState, RedmineConfig } from '../types';

interface WorkspaceFiltersProps {
  filters: FilterState;
  onChange: (update: Partial<FilterState>) => void;
  projects: string[];
  teams: string[];
  config: RedmineConfig;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function WorkspaceFilters({
  filters,
  onChange,
  projects,
  teams,
  config,
  isOpen,
  onClose,
  onRefresh,
  isRefreshing = false
}: WorkspaceFiltersProps) {

  const resetFilters = () => {
    onChange({
      project: '',
      team: '',
      status: '',
      blockedOnly: false,
      search: '',
      selectedGroupFieldVal: ''
    });
  };

  const hasActiveFilters = 
    filters.project !== '' || 
    filters.team !== '' || 
    filters.status !== '' || 
    filters.blockedOnly || 
    filters.search !== '' ||
    filters.selectedGroupFieldVal !== '';

  const getThemeClass = () => {
    if (config.activeTheme === 'contrast') {
      return 'bg-[#fffcfc] text-slate-900 border-l-2 border-[#8a2d46] shadow-xl';
    }
    if (config.activeTheme === 'classic') {
      return 'bg-[#fcf8f9] text-slate-900 border-l border-slate-300 shadow';
    }
    return 'bg-white text-slate-800 border-l border-slate-100 shadow-xl';
  };

  if (!isOpen) return null;

  return (
    <div className={`w-80 h-full flex flex-col justify-between absolute right-0 top-0 z-40 transition-all ${getThemeClass()}`}>
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-pink-600" />
          <h2 className="font-bold text-lg">Filtros Avançados</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-200 text-slate-400"
          title="Fechar painel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* FILTER BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* SEARCH FILTER */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Buscar por Termo</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              placeholder="Assunto ou ID..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded border border-slate-300 bg-white focus:ring-2 focus:ring-[#8a2d46]"
            />
          </div>
        </div>

        {/* PROJECTS FILTER */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Projetos Redmine</label>
          <select
            value={filters.project}
            onChange={(e) => onChange({ project: e.target.value })}
            className="w-full p-2.5 text-sm rounded bg-white border border-slate-300 focus:ring-2 focus:ring-[#8a2d46]"
          >
            <option value="">Todos os Projetos</option>
            {projects.map((proj) => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
        </div>

        {/* TEAMS/AREA FILTER (BASED ON MAPPED TEAM FIELD) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Equipe / Área (assigned_to)
          </label>
          <select
            value={filters.team}
            onChange={(e) => onChange({ team: e.target.value })}
            className="w-full p-2.5 text-sm rounded bg-white border border-slate-300 focus:ring-2 focus:ring-[#8a2d46]"
          >
            <option value="">Todas as Equipes</option>
            {teams.filter(t => t !== 'All Teams').map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* WORK GROUP / GROUP BY TEAM SWANTED FIELD */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Agrupador L2 ({config.fieldsMap.l2.groupingField || '—'})
          </label>
          <input
            type="text"
            value={filters.selectedGroupFieldVal}
            onChange={(e) => onChange({ selectedGroupFieldVal: e.target.value })}
            placeholder="Ex: Finanças, Banco de Dados..."
            className="w-full p-2.5 text-sm rounded bg-white border border-slate-300 focus:ring-2 focus:ring-[#8a2d46]"
          />
        </div>

        {/* BLOCKED TOGGLE */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200">
            <input
              type="checkbox"
              checked={filters.blockedOnly}
              onChange={(e) => onChange({ blockedOnly: e.target.checked })}
              className="w-4.5 h-4.5 text-[#8a2d46] rounded border-slate-300 focus:ring-[#8a2d46]"
            />
            <div className="text-sm">
              <span className="font-semibold text-red-600 block flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Somente Bloqueados
              </span>
              <span className="text-xs text-slate-400 block">Exibir apenas itens com gargalos ativos</span>
            </div>
          </label>
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-slate-200/60 space-y-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sincronizar Redmine
          </button>
        )}
        
        <button
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="w-full py-2 bg-[#8a2d46] hover:bg-[#80253e] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded text-sm font-medium transition-colors"
        >
          Limpar Filtros
        </button>
      </div>

    </div>
  );
}
