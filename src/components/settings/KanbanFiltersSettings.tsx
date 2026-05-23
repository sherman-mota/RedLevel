import React from 'react';
import { Filter } from 'lucide-react';
import { RedmineConfig } from '../../types';

interface KanbanFiltersSettingsProps {
  localConfig: RedmineConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<RedmineConfig>>;
  customFields: { id: string; name: string; possibleValues?: string[] }[];
}

export default function KanbanFiltersSettings({
  localConfig,
  setLocalConfig,
  customFields,
}: KanbanFiltersSettingsProps) {
  const toggleFilterField = (level: 'l3' | 'l2' | 'l1', fieldIdOrName: string) => {
    setLocalConfig(prev => {
      const currentList = prev.filterFields[level] || [];
      const updatedList = currentList.includes(fieldIdOrName)
        ? currentList.filter(f => f !== fieldIdOrName)
        : [...currentList, fieldIdOrName];

      return {
        ...prev,
        filterFields: {
          ...prev.filterFields,
          [level]: updatedList
        }
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b pb-2">
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-500" /> Filtros Dinâmicos do Kanban
        </span>
      </h3>

      <p className="text-xs text-slate-450 leading-relaxed">
        Elenca os campos personalizados do seu Redmine que estarão disponíveis como chips de filtragem na tela de Kanban para cada nível de voo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* L3 Filters */}
        <div className="p-3 bg-purple-50/20 border border-purple-100 rounded-xl space-y-2">
          <span className="text-[11px] font-extrabold text-purple-900 block border-b border-purple-100 pb-1.5">
            Nível N3 (Estratégico)
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {customFields.length === 0 ? (
              <span className="text-[10px] text-slate-400 italic block py-4">Nenhum campo disponível</span>
            ) : (
              customFields.map(cf => {
                const isChecked = (localConfig.filterFields.l3 || []).includes(cf.name);
                return (
                  <label key={cf.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-50/50 cursor-pointer text-[11px] font-semibold text-slate-700 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFilterField('l3', cf.name)}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span className="truncate">{cf.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* L2 Filters */}
        <div className="p-3 bg-blue-50/20 border border-blue-100 rounded-xl space-y-2">
          <span className="text-[11px] font-extrabold text-blue-900 block border-b border-blue-100 pb-1.5">
            Nível N2 (Coordenação)
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {customFields.length === 0 ? (
              <span className="text-[10px] text-slate-400 italic block py-4">Nenhum campo disponível</span>
            ) : (
              customFields.map(cf => {
                const isChecked = (localConfig.filterFields.l2 || []).includes(cf.name);
                return (
                  <label key={cf.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-50/50 cursor-pointer text-[11px] font-semibold text-slate-700 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFilterField('l2', cf.name)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="truncate">{cf.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* L1 Filters */}
        <div className="p-3 bg-teal-50/20 border border-teal-100 rounded-xl space-y-2">
          <span className="text-[11px] font-extrabold text-teal-900 block border-b border-teal-100 pb-1.5">
            Nível N1 (Operacional)
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {customFields.length === 0 ? (
              <span className="text-[10px] text-slate-400 italic block py-4">Nenhum campo disponível</span>
            ) : (
              customFields.map(cf => {
                const isChecked = (localConfig.filterFields.l1 || []).includes(cf.name);
                return (
                  <label key={cf.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-50/50 cursor-pointer text-[11px] font-semibold text-slate-700 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFilterField('l1', cf.name)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span className="truncate">{cf.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
