import React, { useState } from 'react';
import { FolderLock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { RedmineConfig, KanbanStage } from '../../types';
import { fetchRedmineTrackersWithStatuses } from '../../api/redmine';
import { useLanguage } from '../../i18n/LanguageContext';

interface KanbanStageSettingsProps {
  localConfig: RedmineConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<RedmineConfig>>;
}

const STAGE_OPTIONS: KanbanStage[] = ['Backlog', 'To Do', 'In Progress', 'Done'];

const STAGE_COLORS: Record<KanbanStage, { bg: string; border: string; text: string; dot: string }> = {
  'Backlog': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  'To Do': { bg: 'bg-indigo-50/50', border: 'border-indigo-100', text: 'text-indigo-850', dot: 'bg-indigo-500' },
  'In Progress': { bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-850', dot: 'bg-blue-500' },
  'Done': { bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-850', dot: 'bg-emerald-550' },
};

export default function KanbanStageSettings({
  localConfig,
  setLocalConfig,
}: KanbanStageSettingsProps) {
  const { t } = useLanguage();

  const [detectingStatuses, setDetectingStatuses] = useState(false);
  const [autoMapFeedback, setAutoMapFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState<KanbanStage | 'all'>('all');

  const handleAutoMapStatuses = async () => {
    setDetectingStatuses(true);
    setAutoMapFeedback(null);
    try {
      const trackerList = await fetchRedmineTrackersWithStatuses(localConfig);
      let addedCount = 0;
      const updatedStagesMap = JSON.parse(JSON.stringify(localConfig.stagesMap));

      trackerList.forEach((tr) => {
        const trackerName = tr.name;
        if (!updatedStagesMap[trackerName]) {
          updatedStagesMap[trackerName] = {};
        }
        const trackerMap = updatedStagesMap[trackerName];

        tr.statuses.forEach((status) => {
          const name = status.name.trim();
          const alreadyMapped = !!trackerMap[name];
          if (!alreadyMapped) {
            let assignedStage: KanbanStage = 'To Do';
            const lowerName = name.toLowerCase();
            if ((status as any).is_closed) assignedStage = 'Done';
            else if ((status as any).is_default) assignedStage = 'Backlog';
            else if (lowerName.includes('resolv') || lowerName.includes('fech') || lowerName.includes('done') || lowerName.includes('conclu') || lowerName.includes('rejeit') || lowerName.includes('entreg')) assignedStage = 'Done';
            else if (lowerName.includes('desen') || lowerName.includes('prog') || lowerName.includes('andam') || lowerName.includes('doing') || lowerName.includes('test') || lowerName.includes('homolog') || lowerName.includes('valida') || lowerName.includes('review') || lowerName.includes('revis') || lowerName.includes('imped') || lowerName.includes('bloq')) assignedStage = 'In Progress';
            else if (lowerName.includes('todo') || lowerName.includes('aprov') || lowerName.includes('prior') || lowerName.includes('discuss') || lowerName.includes('analis') || lowerName.includes('planej')) assignedStage = 'To Do';
            else assignedStage = 'Backlog';

            trackerMap[name] = assignedStage;
            addedCount++;
          }
        });
      });

      if (addedCount > 0) {
        setLocalConfig(prev => ({ ...prev, stagesMap: updatedStagesMap }));
        setAutoMapFeedback({ success: true, message: `${t.autoMappedSuccess} ${addedCount} novos status do Redmine mapeados por tracker.` });
      } else {
        setAutoMapFeedback({ success: true, message: t.allStatusesMapped });
      }
    } catch (err: any) {
      setAutoMapFeedback({ success: false, message: err.message || 'Falha ao conectar com o Redmine para listar status por tracker.' });
    } finally {
      setDetectingStatuses(false);
    }
  };

  const handleRemoveStatusMapping = (trackerName: string, statusName: string) => {
    const updatedStages = JSON.parse(JSON.stringify(localConfig.stagesMap));
    if (updatedStages[trackerName]) {
      delete updatedStages[trackerName][statusName];
      if (Object.keys(updatedStages[trackerName]).length === 0) {
        delete updatedStages[trackerName];
      }
    }
    setLocalConfig(prev => ({ ...prev, stagesMap: updatedStages }));
  };

  const handleUpdateStatusMapping = (trackerName: string, statusName: string, newStage: KanbanStage) => {
    setLocalConfig(prev => {
      const updatedStages = JSON.parse(JSON.stringify(prev.stagesMap));
      if (!updatedStages[trackerName]) {
        updatedStages[trackerName] = {};
      }
      updatedStages[trackerName][statusName] = newStage;
      return { ...prev, stagesMap: updatedStages };
    });
  };

  // Derived stages mapping data
  const flatStageEntries = Object.entries(localConfig.stagesMap || {}).flatMap(([trackerName, statusMap]) => {
    if (!statusMap || typeof statusMap !== 'object') return [];
    return Object.entries(statusMap).map(([statusName, stage]) => ({
      trackerName,
      statusName,
      stage: stage as KanbanStage,
    }));
  });

  const filteredStageEntries = flatStageEntries.filter(({ trackerName, statusName, stage }) => {
    const matchesText =
      statusName.toLowerCase().includes(statusFilter.toLowerCase()) ||
      trackerName.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesStage = activeStageFilter === 'all' || stage === activeStageFilter;
    return matchesText && matchesStage;
  });

  const stageCounts = STAGE_OPTIONS.reduce((acc, s) => {
    acc[s] = flatStageEntries.filter(({ stage }) => stage === s).length;
    return acc;
  }, {} as Record<KanbanStage, number>);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
        <FolderLock className="w-4 h-4 text-indigo-500" /> {t.section5Title}
      </h3>

      {/* Auto-map helper CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-150 p-4 rounded-xl">
        <div className="space-y-1">
          <p className="text-slate-750 font-extrabold text-xs sm:text-sm">{t.autoMapTitle}</p>
          <p className="text-slate-400 text-[10.5px] leading-snug">{t.autoMapDesc}</p>
        </div>
        <button
          type="button"
          onClick={handleAutoMapStatuses}
          disabled={detectingStatuses}
          className="py-2 px-4 rounded-lg bg-[#8a2d46] hover:bg-[#80253e] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${detectingStatuses ? 'animate-spin' : ''}`} />
          <span>{detectingStatuses ? t.autoMapDetecting : t.autoMapButton}</span>
        </button>
      </div>

      {autoMapFeedback && (
        <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${autoMapFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-950'
          }`}>
          {autoMapFeedback.success
            ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
          <p className="font-semibold">{autoMapFeedback.message}</p>
        </div>
      )}

      {/* Filter stages row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveStageFilter('all')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${activeStageFilter === 'all'
            ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
            }`}
        >
          Todos ({flatStageEntries.length})
        </button>
        {STAGE_OPTIONS.map(stage => {
          const col = STAGE_COLORS[stage];
          const isActive = activeStageFilter === stage;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => setActiveStageFilter(stage)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${isActive
                ? `${col.bg} ${col.border} ${col.text} shadow-xs`
                : 'bg-white text-slate-550 border-slate-200 hover:bg-slate-50'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              {stage} ({stageCounts[stage] ?? 0})
            </button>
          );
        })}

        {/* Status query search */}
        <div className="relative ml-auto">
          <input
            type="text"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            placeholder="Buscar status..."
            className="pl-3 pr-7 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-[#8a2d46] bg-slate-50 w-36"
          />
          {statusFilter && (
            <button type="button" onClick={() => setStatusFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Internal scrolling block to satisfy "Organize sem rolar a tela toda" */}
      <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/40">
        <div className="max-h-76 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {filteredStageEntries.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">Nenhum status Redmine mapeado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredStageEntries.map(({ trackerName, statusName, stage }) => {
                const col = STAGE_COLORS[stage];
                const itemKey = `${trackerName}---${statusName}`;
                return (
                  <div
                    key={itemKey}
                    className="rounded-xl border p-3 flex flex-col justify-between transition-all bg-white border-slate-250 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{trackerName}</span>
                        <span className="font-mono font-bold text-[11px] text-slate-800 truncate" title={statusName}>{statusName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStatusMapping(trackerName, statusName)}
                        className="text-slate-400 hover:text-red-650 transition-colors flex-shrink-0 text-[10px] font-bold"
                        title={t.removeMapping || 'Remover mapeamento'}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Selector pills row */}
                    <div className="grid grid-cols-4 gap-1">
                      {STAGE_OPTIONS.map(opt => {
                        const optCol = STAGE_COLORS[opt];
                        const isSelected = stage === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleUpdateStatusMapping(trackerName, statusName, opt)}
                            className={`py-1 text-[9px] font-extrabold rounded-md border transition-all truncate px-0.5 ${isSelected
                              ? `${optCol.bg} ${optCol.border} ${optCol.text} ring-1 ring-slate-200`
                              : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:text-slate-600'
                              }`}
                            title={opt}
                          >
                            {opt === 'In Progress' ? 'WIP' : opt === 'Backlog' ? 'BL' : opt === 'To Do' ? 'TODO' : 'Done'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
