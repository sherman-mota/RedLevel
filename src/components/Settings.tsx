import React, { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Tag,
  FolderLock,
  Sliders,
  HelpCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Palette,
  Plus,
  Globe,
  ChevronRight,
  Layers,
  Trash2,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { RedmineConfig, KanbanStage } from '../types';
import { testConnection, fetchRedmineTrackers, fetchRedmineCustomFields, fetchRedmineStatuses, DEFAULT_CONFIG } from '../api/redmine';
import { useLanguage } from '../i18n/LanguageContext';

interface SettingsProps {
  config: RedmineConfig;
  onSaveConfig: (updated: RedmineConfig) => void;
}

const STAGE_OPTIONS: KanbanStage[] = ['Backlog', 'To Do', 'In Progress', 'Done'];

const STAGE_COLORS: Record<KanbanStage, { bg: string; border: string; text: string; dot: string }> = {
  'Backlog':     { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700',   dot: 'bg-slate-400' },
  'To Do':       { bg: 'bg-indigo-50/50',  border: 'border-indigo-100',  text: 'text-indigo-850',  dot: 'bg-indigo-500' },
  'In Progress': { bg: 'bg-blue-50/50',    border: 'border-blue-100',    text: 'text-blue-850',    dot: 'bg-blue-500' },
  'Done':        { bg: 'bg-emerald-50/50', border: 'border-emerald-100', text: 'text-emerald-850', dot: 'bg-emerald-550' },
};

export default function Settings({ config, onSaveConfig }: SettingsProps) {
  const { t } = useLanguage();

  // Local state copy
  const [localConfig, setLocalConfig] = useState<RedmineConfig>(() => {
    const configTrackers = (config?.trackers || {}) as Partial<RedmineConfig['trackers']>;
    const mergedTrackers = {
      l3: Array.isArray(configTrackers.l3) ? configTrackers.l3 : (DEFAULT_CONFIG?.trackers?.l3 || []),
      l2: Array.isArray(configTrackers.l2) ? configTrackers.l2 : (DEFAULT_CONFIG?.trackers?.l2 || []),
      l1: Array.isArray(configTrackers.l1) ? configTrackers.l1 : (DEFAULT_CONFIG?.trackers?.l1 || []),
    };

    const syncedTrackers = Array.isArray(config?.syncedTrackers)
      ? config.syncedTrackers
      : (DEFAULT_CONFIG?.syncedTrackers || []);

    const filterFields = {
      l3: Array.isArray(config?.filterFields?.l3) ? config.filterFields.l3 : [],
      l2: Array.isArray(config?.filterFields?.l2) ? config.filterFields.l2 : [],
      l1: Array.isArray(config?.filterFields?.l1) ? config.filterFields.l1 : [],
    };

    return {
      ...DEFAULT_CONFIG,
      ...config,
      trackers: mergedTrackers,
      syncedTrackers,
      filterFields,
      fieldsMap: {
        l3: { ...DEFAULT_CONFIG.fieldsMap.l3, ...(config?.fieldsMap?.l3 || {}) },
        l2: { ...DEFAULT_CONFIG.fieldsMap.l2, ...(config?.fieldsMap?.l2 || {}) },
        l1: { ...DEFAULT_CONFIG.fieldsMap.l1, ...(config?.fieldsMap?.l1 || {}) },
      },
      stagesMap: { ...DEFAULT_CONFIG.stagesMap, ...(config?.stagesMap || {}) },
    };
  });

  // Section refs for scroll-navigation
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('connection');

  // Connection tester
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Kanban mapping form
  const [newRedmineStatus, setNewRedmineStatus] = useState('');
  const [newKanbanStage, setNewKanbanStage] = useState<KanbanStage>('To Do');

  // Trackers from Redmine API
  const [trackers, setTrackers] = useState<string[]>([]);
  const [loadingTrackers, setLoadingTrackers] = useState(false);

  // Custom fields from Redmine API
  const [customFields, setCustomFields] = useState<{ id: string; name: string }[]>([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);

  // Auto-map
  const [detectingStatuses, setDetectingStatuses] = useState(false);
  const [autoMapFeedback, setAutoMapFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Filters for scroll-items
  const [trackerFilter, setTrackerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Active kanban column filter (for status map)
  const [activeStageFilter, setActiveStageFilter] = useState<KanbanStage | 'all'>('all');

  // Demo status checking
  const [isDemoCleared, setIsDemoCleared] = useState(() => {
    return localStorage.getItem('redlevels_clear_demo') === 'true';
  });

  const loadTrackers = async (cfgToUse = localConfig) => {
    setLoadingTrackers(true);
    try {
      const list = await fetchRedmineTrackers(cfgToUse);
      const configTrackers = cfgToUse?.trackers || {};
      const l3 = Array.isArray(configTrackers.l3) ? configTrackers.l3 : [];
      const l2 = Array.isArray(configTrackers.l2) ? configTrackers.l2 : [];
      const l1 = Array.isArray(configTrackers.l1) ? configTrackers.l1 : [];
      const combined = Array.from(new Set([...list, ...l3, ...l2, ...l1]));
      setTrackers(combined);
    } catch (err) {
      console.error('Erro ao carregar trackers:', err);
    } finally {
      setLoadingTrackers(false);
    }
  };

  const loadCustomFields = async (cfgToUse = localConfig) => {
    setLoadingCustomFields(true);
    try {
      const list = await fetchRedmineCustomFields(cfgToUse);
      setCustomFields(list);
    } catch (err) {
      console.error('Erro ao carregar campos personalizados:', err);
    } finally {
      setLoadingCustomFields(false);
    }
  };

  const handleAutoMapStatuses = async () => {
    setDetectingStatuses(true);
    setAutoMapFeedback(null);
    try {
      const serverStatuses = await fetchRedmineStatuses(localConfig);
      let addedCount = 0;
      const updatedStagesMap = { ...localConfig.stagesMap };

      serverStatuses.forEach((status) => {
        const name = status.name.trim();
        const alreadyMapped = Object.keys(updatedStagesMap).some(k => k.toLowerCase() === name.toLowerCase());
        if (!alreadyMapped) {
          let assignedStage: KanbanStage = 'To Do';
          const lowerName = name.toLowerCase();
          if (status.is_closed) assignedStage = 'Done';
          else if (status.is_default) assignedStage = 'Backlog';
          else if (lowerName.includes('resolv') || lowerName.includes('fech') || lowerName.includes('done') || lowerName.includes('conclu') || lowerName.includes('rejeit') || lowerName.includes('entreg')) assignedStage = 'Done';
          else if (lowerName.includes('desen') || lowerName.includes('prog') || lowerName.includes('andam') || lowerName.includes('doing') || lowerName.includes('test') || lowerName.includes('homolog') || lowerName.includes('valida') || lowerName.includes('review') || lowerName.includes('revis') || lowerName.includes('imped') || lowerName.includes('bloq')) assignedStage = 'In Progress';
          else if (lowerName.includes('todo') || lowerName.includes('aprov') || lowerName.includes('prior') || lowerName.includes('discuss') || lowerName.includes('analis') || lowerName.includes('planej')) assignedStage = 'To Do';
          else assignedStage = 'Backlog';
          updatedStagesMap[name] = assignedStage;
          addedCount++;
        }
      });

      if (addedCount > 0) {
        setLocalConfig(prev => ({ ...prev, stagesMap: updatedStagesMap }));
        setAutoMapFeedback({ success: true, message: `${t.autoMappedSuccess} ${addedCount} novos status do Redmine.` });
      } else {
        setAutoMapFeedback({ success: true, message: t.allStatusesMapped });
      }
    } catch (err: any) {
      setAutoMapFeedback({ success: false, message: err.message || 'Falha ao conectar com o Redmine para listar status.' });
    } finally {
      setDetectingStatuses(false);
    }
  };

  useEffect(() => {
    loadTrackers();
    loadCustomFields();
  }, [localConfig.useDemoWorkspace]);

  // Intersection Observer for active section highlighting in side nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: '-60px 0px -50% 0px' }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el as HTMLDivElement); });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const handleSave = () => {
    onSaveConfig({ ...localConfig, isConnected: localConfig.useDemoWorkspace ? false : localConfig.isConnected });
    alert(t.settingsSaved);
  };

  const handleTestConnection = async () => {
    if (!localConfig.serverUrl || !localConfig.token) {
      setTestResult({ success: false, message: t.fillUrlAndToken });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const isOk = await testConnection(localConfig.serverUrl, localConfig.token);
      if (isOk) {
        setTestResult({ success: true, message: t.connectionEstablished });
        const updatedConfig = { ...localConfig, isConnected: true, useDemoWorkspace: false };
        setLocalConfig(updatedConfig);
        loadTrackers(updatedConfig);
        loadCustomFields(updatedConfig);
      } else {
        setTestResult({ success: false, message: t.connectionFailed });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Falha de requisição de rede.' });
    } finally {
      setTesting(false);
    }
  };

  const handleAddStatusMapping = () => {
    if (!newRedmineStatus.trim()) return;
    setLocalConfig(prev => ({ ...prev, stagesMap: { ...prev.stagesMap, [newRedmineStatus.trim()]: newKanbanStage } }));
    setNewRedmineStatus('');
  };

  const handleRemoveStatusMapping = (redmineStatus: string) => {
    const updatedStages = { ...localConfig.stagesMap };
    delete updatedStages[redmineStatus];
    setLocalConfig(prev => ({ ...prev, stagesMap: updatedStages }));
  };

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

  const handleClearDemoData = () => {
    if (confirm('Tem certeza que deseja excluir os dados simulados fictícios? Isso esvaziará os quadros Kanban até que você configure seu Redmine real.')) {
      localStorage.setItem('redlevels_clear_demo', 'true');
      setIsDemoCleared(true);
      alert('Dados simulados ocultados com sucesso! Recarregando aplicação.');
      window.location.reload();
    }
  };

  const handleRestoreDemoData = () => {
    localStorage.removeItem('redlevels_clear_demo');
    setIsDemoCleared(false);
    alert('Dados simulados restaurados com sucesso! Recarregando aplicação.');
    window.location.reload();
  };

  const handleResetAllSettings = () => {
    if (confirm('Atenção: Isso redefinirá TODOS os mapeamentos de trackers, campos personalizados e conexões para as opções padrões. Deseja prosseguir?')) {
      localStorage.removeItem('redlevels_redmine_config');
      localStorage.removeItem('redlevels_clear_demo');
      alert('Configurações redefinidas com sucesso! Recarregando.');
      window.location.reload();
    }
  };

  const renderFieldMapper = (
    level: 'l3' | 'l2' | 'l1',
    label: string,
    valueKey: 'blockedFlag' | 'blockedReason' | 'groupingField',
    placeholder: string
  ) => {
    const currentValue = localConfig.fieldsMap[level][valueKey] || '';
    const matchedField = customFields.find(cf => cf.id === currentValue || cf.name === currentValue);
    const selectValue = matchedField ? matchedField.name : (currentValue ? '__manual__' : '');
    const sortedCustomFields = [...customFields].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return (
      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-150 transition-all hover:border-slate-350">
        <div className="flex justify-between items-center">
          <label className="text-slate-700 font-bold block text-xs">{label}</label>
          {loadingCustomFields && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8a2d46]" />}
        </div>
        <select
          value={selectValue}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '__manual__') {
              setLocalConfig(prev => ({
                ...prev,
                fieldsMap: {
                  ...prev.fieldsMap,
                  [level]: { ...prev.fieldsMap[level], [valueKey]: '' }
                }
              }));
            } else {
              setLocalConfig(prev => ({
                ...prev,
                fieldsMap: {
                  ...prev.fieldsMap,
                  [level]: { ...prev.fieldsMap[level], [valueKey]: val }
                }
              }));
            }
          }}
          className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#8a2d46] text-slate-700 transition-all"
        >
          <option value="">{t.selectField}</option>
          {sortedCustomFields.map(cf => (
            <option key={cf.id} value={cf.name}>{cf.name} (ID: {cf.id})</option>
          ))}
          <option value="__manual__">{t.manualEntry}</option>
        </select>
        {(selectValue === '__manual__' || (!matchedField && currentValue)) && (
          <div className="space-y-1 mt-1">
            <span className="text-[10px] text-slate-400 font-medium uppercase">{t.mappedValue}</span>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                fieldsMap: {
                  ...prev.fieldsMap,
                  [level]: { ...prev.fieldsMap[level], [valueKey]: e.target.value }
                }
              }))}
              placeholder={placeholder}
              className="w-full p-2 text-xs font-normal rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#8a2d46] bg-white text-slate-800 transition-all"
            />
          </div>
        )}
      </div>
    );
  };

  // macOS system settings styled navigation
  const navSections = [
    { id: 'connection',     icon: Server,      label: 'Conexão',          color: 'bg-blue-500 text-white' },
    { id: 'themes',         icon: Palette,     label: 'Aparência',        color: 'bg-pink-500 text-white' },
    { id: 'trackers',       icon: Tag,         label: 'Trackers Sync',    color: 'bg-emerald-500 text-white' },
    { id: 'l3-level',       icon: Layers,      label: 'Nível N3 (Estrat)',color: 'bg-purple-500 text-white' },
    { id: 'l2-level',       icon: Layers,      label: 'Nível N2 (Tático)',color: 'bg-orange-500 text-white' },
    { id: 'l1-level',       icon: Layers,      label: 'Nível N1 (Oper)',  color: 'bg-teal-500 text-white' },
    { id: 'kanban-filters', icon: Sliders,     label: 'Filtros Kanban',   color: 'bg-amber-500 text-white' },
    { id: 'kanban-stages',  icon: FolderLock,  label: 'Estágios Kanban',  color: 'bg-indigo-500 text-white' },
    { id: 'data-reset',     icon: Trash2,      label: 'Dados & Reset',    color: 'bg-rose-500 text-white' },
  ];

  // Derived trackers data
  const configTrackers = localConfig?.trackers || {};
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

  // Derived stages mapping data
  const allStageEntries = Object.entries(localConfig.stagesMap);
  const filteredStageEntries = allStageEntries.filter(([status, stage]) => {
    const matchesText = status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesStage = activeStageFilter === 'all' || stage === activeStageFilter;
    return matchesText && matchesStage;
  });

  const stageCounts = STAGE_OPTIONS.reduce((acc, s) => {
    acc[s] = allStageEntries.filter(([, st]) => st === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto pb-16 text-left">
      {/* RedLevels Settings macOS inspired header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#8a2d46] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <SettingsIcon className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t.settingsTitle}</h2>
          <p className="text-xs text-slate-400">{t.settingsSubtitle}</p>
        </div>
      </div>

      {/* Side-by-side Layout (macOS System Settings Style) */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT STICKY SIDEBAR */}
        <div className="w-full md:w-68 flex-shrink-0 md:sticky md:top-4 self-start space-y-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-2 shadow-xs space-y-0.5">
            {navSections.map(({ id, icon: Icon, label, color }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all transition-colors ${
                  activeSection === id
                    ? 'bg-[#8a2d46]/10 text-[#8a2d46]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Visual colored icon container */}
                <div className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1 text-left truncate">{label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 ml-auto flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Quick Actions in Sidebar Footer */}
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 space-y-3">
            <button
              onClick={handleSave}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#8a2d46] hover:bg-[#80253e] text-white hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.saveAllSettings}</span>
            </button>
            
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed text-center">
              {t.settingsStorageNote}
            </p>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 w-full space-y-6">

          {/* ── SECTION 1: CONNECTION ──────────────────────────────────── */}
          <div
            id="connection"
            ref={el => { sectionRefs.current['connection'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
              <Server className="w-4 h-4 text-blue-500" /> {t.section1Title}
            </h3>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-slate-500 block mb-1">{t.labelServerUrl}</label>
                  <input
                    type="text"
                    value={localConfig.serverUrl}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                    placeholder={t.placeholderServerUrl}
                    className="w-full p-2.5 text-xs font-normal rounded-lg border text-slate-800 focus:ring-2 focus:ring-[#8a2d46]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 block mb-1">{t.labelApiToken}</label>
                  <input
                    type="password"
                    value={localConfig.token}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, token: e.target.value }))}
                    placeholder={t.placeholderToken}
                    className="w-full p-2.5 text-xs font-normal rounded-lg border text-slate-800 focus:ring-2 focus:ring-[#8a2d46]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? t.testingConnection : t.testConnection}</span>
                </button>
              </div>
              {testResult && (
                <div className={`p-4 rounded-xl border text-xs leading-loose ${testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
                  <div className="flex items-center gap-2">
                    {testResult.success
                      ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                      : <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">✕</div>}
                    <span className="font-bold">{testResult.success ? t.connectionEstablished : t.connectionFailed}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] opacity-90">{testResult.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 2: THEMES & LANGUAGE ─────────────────────────────────────── */}
          <div
            id="themes"
            ref={el => { sectionRefs.current['themes'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs scroll-mt-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Palette className="w-4 h-4 text-pink-500" /> {t.section2Title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { key: 'modern',   name: t.themeModernName,   desc: t.themeModernDesc,   colors: ['bg-[#8a2d46]', 'bg-indigo-600', 'bg-[#f8f9ff] border'], ring: 'border-[#8a2d46] ring-2 ring-[#8a2d46]/20 bg-rose-50/20' },
                  { key: 'classic',  name: t.themeClassicName,  desc: t.themeClassicDesc,  colors: ['bg-[#2b5d8f]', 'bg-yellow-500', 'bg-[#edf2f7] border'],  ring: 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20' },
                  { key: 'contrast', name: t.themeContrastName, desc: t.themeContrastDesc, colors: ['bg-[#8a2d46]', 'bg-white border border-[#8a2d46]', 'bg-slate-100'], ring: 'border-[#8a2d46] ring-2 ring-[#8a2d46]/20 bg-[#fffcfc]' },
                ] as const).map(theme => (
                  <button
                    key={theme.key}
                    onClick={() => setLocalConfig(prev => ({ ...prev, activeTheme: theme.key as any }))}
                    className={`p-4 rounded-xl border text-left space-y-2 transition-all outline-hidden ${
                      localConfig.activeTheme === theme.key
                        ? `ring-2 ${theme.ring}`
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs block text-slate-800">{theme.name}</span>
                    <span className="text-[10px] text-slate-400 block line-clamp-2 leading-relaxed">{theme.desc}</span>
                    <div className="flex gap-1.5 pt-1">
                      {theme.colors.map((c, i) => <span key={i} className={`w-3.5 h-3.5 rounded-full ${c}`} />)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#8a2d46]" /> {t.section6Title}
              </h4>
              <p className="text-[11px] text-slate-450">{t.section6Desc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { code: 'pt-BR' as const, label: t.langPtBr, flag: '🇧🇷' },
                  { code: 'en-US' as const, label: t.langEnUs, flag: '🇺🇸' },
                  { code: 'es-ES' as const, label: t.langEsEs, flag: '🇪🇸' },
                ]).map(({ code, label, flag }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLocalConfig(prev => ({ ...prev, language: code }))}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all outline-hidden ${
                      localConfig.language === code
                        ? 'border-[#8a2d46] ring-2 ring-[#8a2d46]/20 bg-rose-50/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{flag}</span>
                    <div className="truncate">
                      <span className="font-bold text-xs block text-slate-800">{label}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{code}</span>
                    </div>
                    {localConfig.language === code && (
                      <CheckCircle className="w-3.5 h-3.5 text-[#8a2d46] ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: TRACKERS Sync ───────────────────────────────────── */}
          <div
            id="trackers"
            ref={el => { sectionRefs.current['trackers'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
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

            {/* Scrollable grid to contain huge lists and satisfy "Organize sem rolar a tela toda" */}
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
                          className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                            isSynced
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
                                  className={`py-1 text-[9px] font-bold rounded-lg border transition-all truncate px-0.5 ${
                                    currentLevel === level
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

          {/* ── SECTION 4: NÍVEL N3 (ESTRATÉGICO) ─────────────────────────── */}
          <div
            id="l3-level"
            ref={el => { sectionRefs.current['l3-level'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" /> Nível N3 (Estratégico / L3)
              </span>
            </h3>
            
            {/* L3 Mode Selector (Tracker or Custom Field Value) */}
            <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-purple-950 block">Modo de Identificação de N3</span>
                  <span className="text-[10px] text-purple-800 leading-snug block">Escolha se o nível N3 é identificado por um tipo de tarefa (Tracker) ou por um campo personalizado específico nas tarefas.</span>
                </div>
                <div className="flex bg-white border rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setLocalConfig(prev => ({ ...prev, l3Mode: 'tracker' }))}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      localConfig.l3Mode === 'tracker'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tracker
                  </button>
                  <button
                    onClick={() => setLocalConfig(prev => ({ ...prev, l3Mode: 'customField' }))}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      localConfig.l3Mode === 'customField'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Campo Personalizado
                  </button>
                </div>
              </div>

              {localConfig.l3Mode === 'customField' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold">
                  <div className="space-y-1 bg-white p-3 rounded-lg border border-purple-100">
                    <label className="text-slate-600 block text-[10px] uppercase tracking-wider">Campo Personalizado para N3</label>
                    <select
                      value={localConfig.l3CustomField}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, l3CustomField: e.target.value }))}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="">Selecione o campo...</option>
                      {customFields.map(cf => (
                        <option key={cf.id} value={cf.name}>{cf.name} (ID: {cf.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 bg-white p-3 rounded-lg border border-purple-100">
                    <label className="text-slate-600 block text-[10px] uppercase tracking-wider">Valor que indica N3</label>
                    <input
                      type="text"
                      value={localConfig.l3CustomFieldValue}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, l3CustomFieldValue: e.target.value }))}
                      placeholder="Ex: Sim, L3, Strategic"
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 font-normal"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* L3 Custom fields */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mapeamento de Campos de N3</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {renderFieldMapper('l3', 'Campo Indicador de Bloqueio', 'blockedFlag', 'Ex: blocked_custom_field')}
                {renderFieldMapper('l3', 'Razão do Bloqueio', 'blockedReason', 'Ex: blocked_reason_custom_field')}
                {renderFieldMapper('l3', 'Agrupador de Kanban', 'groupingField', 'Ex: tema_estrategico')}
              </div>
            </div>
          </div>

          {/* ── SECTION 5: NÍVEL N2 (TÁTICO) ─────────────────────────────── */}
          <div
            id="l2-level"
            ref={el => { sectionRefs.current['l2-level'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" /> Nível N2 (Coordenação / L2)
              </span>
            </h3>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mapeamento de Campos de N2</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {renderFieldMapper('l2', 'Campo Indicador de Bloqueio', 'blockedFlag', 'Ex: blocked_custom_field')}
                {renderFieldMapper('l2', 'Razão do Bloqueio', 'blockedReason', 'Ex: blocked_reason_custom_field')}
                {renderFieldMapper('l2', 'Agrupador de Kanban', 'groupingField', 'Ex: area_coordenacao')}
              </div>
            </div>
          </div>

          {/* ── SECTION 6: NÍVEL N1 (OPERACIONAL) ─────────────────────────── */}
          <div
            id="l1-level"
            ref={el => { sectionRefs.current['l1-level'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-500" /> Nível N1 (Operacional / L1)
              </span>
            </h3>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mapeamento de Campos de N1</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {renderFieldMapper('l1', 'Campo Indicador de Bloqueio', 'blockedFlag', 'Ex: blocked_custom_field')}
                {renderFieldMapper('l1', 'Razão do Bloqueio', 'blockedReason', 'Ex: blocked_reason_custom_field')}
                {renderFieldMapper('l1', 'Agrupador de Kanban', 'groupingField', 'Ex: squad_responsavel')}
              </div>
            </div>
          </div>

          {/* ── SECTION 7: KANBAN FILTERS ─────────────────────────────────── */}
          <div
            id="kanban-filters"
            ref={el => { sectionRefs.current['kanban-filters'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
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

          {/* ── SECTION 8: KANBAN STAGES ──────────────────────────────── */}
          <div
            id="kanban-stages"
            ref={el => { sectionRefs.current['kanban-stages'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
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
              <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                autoMapFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-950'
              }`}>
                {autoMapFeedback.success
                  ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  : <XCircle    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
                <p className="font-semibold">{autoMapFeedback.message}</p>
              </div>
            )}

            {/* Filter stages row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveStageFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  activeStageFilter === 'all'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todos ({allStageEntries.length})
              </button>
              {STAGE_OPTIONS.map(stage => {
                const col = STAGE_COLORS[stage];
                const isActive = activeStageFilter === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => setActiveStageFilter(stage)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      isActive
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
                  <button onClick={() => setStatusFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
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
                    {filteredStageEntries.map(([redmineSt, kanbanSg]) => {
                      const col = STAGE_COLORS[kanbanSg as KanbanStage];
                      return (
                        <div
                          key={redmineSt}
                          className={`rounded-xl border p-3 flex flex-col justify-between transition-all bg-white border-slate-250 shadow-xs`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-mono font-bold text-[11px] text-slate-800 truncate flex-1" title={redmineSt}>{redmineSt}</span>
                            <button
                              onClick={() => handleRemoveStatusMapping(redmineSt)}
                              className="text-slate-400 hover:text-red-650 transition-colors flex-shrink-0 text-[10px] font-bold"
                              title={t.removeMapping}
                            >
                              ✕
                            </button>
                          </div>
                          
                          {/* Selector pills row */}
                          <div className="grid grid-cols-4 gap-1">
                            {STAGE_OPTIONS.map(opt => {
                              const optCol = STAGE_COLORS[opt];
                              const isSelected = kanbanSg === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => setLocalConfig(prev => ({
                                    ...prev,
                                    stagesMap: { ...prev.stagesMap, [redmineSt]: opt }
                                  }))}
                                  className={`py-1 text-[9px] font-extrabold rounded-md border transition-all truncate px-0.5 ${
                                    isSelected
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

          {/* ── SECTION 9: DATA & RESET ───────────────────────────────── */}
          <div
            id="data-reset"
            ref={el => { sectionRefs.current['data-reset'] = el; }}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-6"
          >
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
              <Trash2 className="w-4 h-4 text-rose-500" /> Administração de Dados & Reset
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Gerencie a carga de dados fictícios do simulador local ou redefina a base de preferências armazenadas do seu RedLevels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Demo Clear Card */}
              <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/60 flex flex-col justify-between gap-3 transition-all hover:bg-slate-50">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-slate-500" />
                    <span>Dados Fictícios de Demo</span>
                  </span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {isDemoCleared 
                      ? 'Os dados fictícios foram excluídos com sucesso. As tabelas ficarão limpas até a conexão real ser salva.'
                      : 'O app atualmente carrega um conjunto de dados simulado. Você pode excluí-lo para iniciar a ferramenta de forma limpa.'}
                  </p>
                </div>
                
                {isDemoCleared ? (
                  <button
                    onClick={handleRestoreDemoData}
                    className="self-start py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all"
                  >
                    Restaurar Dados Simulados
                  </button>
                ) : (
                  <button
                    onClick={handleClearDemoData}
                    className="self-start py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all"
                  >
                    Excluir Dados Fictícios
                  </button>
                )}
              </div>

              {/* Full Reset Card */}
              <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/60 flex flex-col justify-between gap-3 transition-all hover:bg-slate-50">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Apagar Preferências</span>
                  </span>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Apaga todas as chaves de API, mapeamento de trackers, status e preferências locais e retorna a aplicação para as configurações de fábrica.
                  </p>
                </div>
                <button
                  onClick={handleResetAllSettings}
                  className="self-start py-1.5 px-3 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all"
                >
                  Reset Geral de Configurações
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
