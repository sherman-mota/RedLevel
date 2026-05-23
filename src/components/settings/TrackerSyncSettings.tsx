import React, { useState } from 'react';
import { Tag, RefreshCw } from 'lucide-react';
import { RedmineConfig } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface TrackerSyncSettingsProps {
  localConfig: RedmineConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<RedmineConfig>>;
  trackers: string[];
  loadingTrackers: boolean;
  loadTrackers: () => Promise<void>;
}

export default function TrackerSyncSettings({
  localConfig,
  setLocalConfig,
  trackers,
  loadingTrackers,
  loadTrackers,
}: TrackerSyncSettingsProps) {
  const { t } = useLanguage();
  const [trackerFilter, setTrackerFilter] = useState('');

  const handleToggleTrackerSync = (trackerName: string) => {
    setLocalConfig(prev => {
      const syncedTrackers = [...prev.syncedTrackers];
      if (syncedTrackers.includes(trackerName)) {
        return {
          ...prev,
          syncedTrackers: syncedTrackers.filter(t => t !== trackerName),
          // Also remove it from L3/L2/L1 mappings since it won't be synced anymore
          trackers: {
            l3: prev.trackers.l3.filter(t => t !== trackerName),
            l2: prev.trackers.l2.filter(t => t !== trackerName),
            l1: prev.trackers.l1.filter(t => t !== trackerName),
          }
        };
      } else {
        syncedTrackers.push(trackerName);
        return {
          ...prev,
          syncedTrackers,
          // Default mapped to L1
          trackers: {
            ...prev.trackers,
            l1: [...prev.trackers.l1, trackerName]
          }
        };
      }
    });
  };

  const handleSetTrackerLevel = (trackerName: string, level: 'l3' | 'l2' | 'l1') => {
    setLocalConfig(prev => {
      const l1 = prev.trackers.l1.filter(tr => tr !== trackerName);
      const l2 = prev.trackers.l2.filter(tr => tr !== trackerName);
      const l3 = prev.trackers.l3.filter(tr => tr !== trackerName);
      if (level === 'l1') l1.push(trackerName);
      else if (level === 'l2') l2.push(trackerName);
      else if (level === 'l3') l3.push(trackerName);
      return { ...prev, trackers: { l1, l2, l3 } };
    });
  };

  const configTrackers = localConfig?.trackers || { l3: [], l2: [], l1: [] };
  const tl3 = Array.isArray(configTrackers.l3) ? configTrackers.l3 : [];
  const tl2 = Array.isArray(configTrackers.l2) ? configTrackers.l2 : [];
  const tl1 = Array.isArray(configTrackers.l1) ? configTrackers.l1 : [];
  const syncedList = localConfig.syncedTrackers || [];

  const getTrackerLevel = (tracker: string): 'l3' | 'l2' | 'l1' | 'none' => {
    if (tl3.includes(tracker)) return 'l3';
    if (tl2.includes(tracker)) return 'l2';
    if (tl1.includes(tracker)) return 'l1';
    return 'none';
  };

  const filteredTrackers = trackers.filter(tr =>
    tr.toLowerCase().includes(trackerFilter.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-500" /> {t.section3Title}
        </h3>
        <div className="flex items-center gap-2">
          {localConfig.useDemoWorkspace ? (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{t.sectionDemoMode}</span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{t.sectionConnectedMode}</span>
          )}
          <button onClick={() => loadTrackers()} disabled={loadingTrackers} className="p-1 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-50 transition-colors" title={t.reloadTrackers}>
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTrackers ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{t.trackersDescription}</p>

      {/* Sync status metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Sincronizados</span>
          <span className="text-lg font-black text-emerald-600">{syncedList.length}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.levelStrategic} (N3)</span>
          <span className="text-lg font-black text-purple-600">{tl3.length}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.levelTactical} (N2)</span>
          <span className="text-lg font-black text-blue-600">{tl2.length}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.levelOperational} (N1)</span>
          <span className="text-lg font-black text-teal-600">{tl1.length}</span>
        </div>
      </div>

      {/* Tracker search filter */}
      <div className="relative">
        <input
          type="text"
          value={trackerFilter}
          onChange={e => setTrackerFilter(e.target.value)}
          placeholder="Buscar trackers do Redmine..."
          className="w-full pl-3 pr-8 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-[#8a2d46] bg-slate-50"
        />
        {trackerFilter && (
          <button onClick={() => setTrackerFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
        )}
      </div>

      {/* Scrollable grid to contain huge lists */}
      <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/40">
        <div className="max-h-76 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {loadingTrackers ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin text-[#8a2d46]" />
              <span className="text-[11px] font-medium">{t.loadingTrackers}</span>
            </div>
          ) : filteredTrackers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              {trackerFilter ? 'Nenhum tracker encontrado.' : t.noTrackers}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredTrackers.map((tracker) => {
                const isSynced = syncedList.includes(tracker);
                const currentLevel = getTrackerLevel(tracker);

                return (
                  <div
                    key={tracker}
                    className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${isSynced
                      ? 'border-slate-200 bg-white shadow-xs'
                      : 'border-slate-100 bg-slate-100/40 opacity-70 hover:opacity-100'
                      }`}
                  >
                    {/* Top part: Switch / Toggle Sync */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-700 text-xs truncate flex-1" title={tracker}>{tracker}</span>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSynced}
                          onChange={() => handleToggleTrackerSync(tracker)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {/* Bottom part: Choose flight level if synced */}
                    {isSynced ? (
                      <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-100">
                        {([
                          { level: 'l3' as const, label: 'L3 / N3', activeClass: 'bg-purple-600 text-white border-purple-600' },
                          { level: 'l2' as const, label: 'L2 / N2', activeClass: 'bg-blue-600 text-white border-blue-600' },
                          { level: 'l1' as const, label: 'L1 / N1', activeClass: 'bg-teal-600 text-white border-teal-600' },
                        ]).map(({ level, label, activeClass }) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleSetTrackerLevel(tracker, level)}
                            className={`py-1 text-[9px] font-bold rounded-lg border transition-all truncate px-0.5 ${currentLevel === level
                              ? activeClass
                              : 'bg-white text-slate-500 border-slate-150 hover:bg-slate-50'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-medium leading-none py-1">Não Sincronizado</span>
                    )}
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
