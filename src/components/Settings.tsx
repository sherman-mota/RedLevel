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
  Layers
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
  'Backlog':     { bg: 'bg-slate-100',   border: 'border-slate-300',   text: 'text-slate-700',   dot: 'bg-slate-400' },
  'To Do':       { bg: 'bg-indigo-100',  border: 'border-indigo-300',  text: 'text-indigo-800',  dot: 'bg-indigo-500' },
  'In Progress': { bg: 'bg-blue-100',    border: 'border-blue-300',    text: 'text-blue-800',    dot: 'bg-blue-500' },
  'Done':        { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' },
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
    return {
      ...DEFAULT_CONFIG,
      ...config,
      trackers: mergedTrackers,
      fieldsMap: { ...DEFAULT_CONFIG.fieldsMap, ...(config?.fieldsMap || {}) },
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

  // Trackers
  const [trackers, setTrackers] = useState<string[]>([]);
  const [loadingTrackers, setLoadingTrackers] = useState(false);
  const [customTrackerName, setCustomTrackerName] = useState('');

  // Custom fields
  const [customFields, setCustomFields] = useState<{ id: string; name: string }[]>([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);

  // Auto-map
  const [detectingStatuses, setDetectingStatuses] = useState(false);
  const [autoMapFeedback, setAutoMapFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Tracker filter
  const [trackerFilter, setTrackerFilter] = useState('');

  // Status filter
  const [statusFilter, setStatusFilter] = useState('');

  // Active kanban column filter (for stage view)
  const [activeStageFilter, setActiveStageFilter] = useState<KanbanStage | 'all'>('all');

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

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' }
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

  const handleSetTrackerLevel = (trackerName: string, level: 'l3' | 'l2' | 'l1' | 'none') => {
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

  const handleAddCustomTracker = () => {
    if (!customTrackerName.trim()) return;
    const name = customTrackerName.trim();
    if (!trackers.includes(name)) setTrackers(prev => [...prev, name]);
    handleSetTrackerLevel(name, 'l1');
    setCustomTrackerName('');
  };

  const renderFieldMapper = (
    label: string,
    valueKey: 'blockedFlag' | 'blockedReason' | 'team' | 'groupingField',
    placeholder: string
  ) => {
    const currentValue = localConfig.fieldsMap[valueKey] || '';
    const matchedField = customFields.find(cf => cf.id === currentValue || cf.name === currentValue);
    const selectValue = matchedField ? matchedField.name : (currentValue ? '__manual__' : '');
    const sortedCustomFields = [...customFields].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return (
      <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-150 transition-all hover:border-slate-300">
        <div className="flex justify-between items-center">
          <label className="text-slate-700 font-bold block text-xs">{label}</label>
          {loadingCustomFields && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8a2d46]" />}
        </div>
        <select
          value={selectValue}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '__manual__') {
              setLocalConfig(prev => ({ ...prev, fieldsMap: { ...prev.fieldsMap, [valueKey]: '' } }));
            } else {
              setLocalConfig(prev => ({ ...prev, fieldsMap: { ...prev.fieldsMap, [valueKey]: val } }));
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
              onChange={(e) => setLocalConfig(prev => ({ ...prev, fieldsMap: { ...prev.fieldsMap, [valueKey]: e.target.value } }))}
              placeholder={placeholder}
              className="w-full p-2 text-xs font-normal rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#8a2d46] bg-white text-slate-800 transition-all"
            />
          </div>
        )}
      </div>
    );
  };

  // Section navigator config
  const navSections = [
    { id: 'connection', icon: Server,      label: t.section1Title.replace(/^\d+\.\s*/, '') },
    { id: 'themes',     icon: Palette,     label: t.section2Title.replace(/^\d+\.\s*/, '') },
    { id: 'trackers',   icon: Tag,         label: t.section3Title.replace(/^\d+\.\s*/, '') },
    { id: 'fields',     icon: Sliders,     label: t.section4Title.replace(/^\d+\.\s*/, '') },
    { id: 'kanban',     icon: FolderLock,  label: t.section5Title.replace(/^\d+\.\s*/, '') },
    { id: 'language',   icon: Globe,       label: t.section6Title.replace(/^\d+\.\s*/, '') },
  ];

  // Derived data for compact tracker view
  const configTrackers = localConfig?.trackers || {};
  const tl3 = Array.isArray(configTrackers.l3) ? configTrackers.l3 : [];
  const tl2 = Array.isArray(configTrackers.l2) ? configTrackers.l2 : [];
  const tl1 = Array.isArray(configTrackers.l1) ? configTrackers.l1 : [];

  const getTrackerLevel = (tracker: string): 'l3' | 'l2' | 'l1' | 'none' => {
    if (tl3.includes(tracker)) return 'l3';
    if (tl2.includes(tracker)) return 'l2';
    if (tl1.includes(tracker)) return 'l1';
    return 'none';
  };

  const filteredTrackers = trackers.filter(tr =>
    tr.toLowerCase().includes(trackerFilter.toLowerCase())
  );

  // Derived data for compact stages view
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
    <div className="max-w-4xl mx-auto pb-16 text-left">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#8a2d46] text-white flex items-center justify-center flex-shrink-0">
          <SettingsIcon className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{t.settingsTitle}</h2>
          <p className="text-xs text-slate-400">{t.settingsSubtitle}</p>
        </div>
      </div>

      {/* ── SECTION NAVIGATOR (sticky) ──────────────────────────────── */}
      <div className="sticky top-0 z-20 mb-6">
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm px-2 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {navSections.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeSection === id
                  ? 'bg-[#8a2d46] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          {/* Save shortcut */}
          <div className="ml-auto flex-shrink-0 pl-2 border-l border-slate-200">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#8a2d46] text-white hover:bg-[#80253e] transition-all whitespace-nowrap shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.saveAllSettings}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── SECTION 1: CONNECTION ──────────────────────────────────── */}
        <div
          id="connection"
          ref={el => { sectionRefs.current['connection'] = el; }}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-20"
        >
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Server className="w-5 h-5 text-indigo-600" /> {t.section1Title}
          </h3>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500 block mb-1">{t.labelServerUrl}</label>
                <input
                  type="text"
                  value={localConfig.serverUrl}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                  placeholder={t.placeholderServerUrl}
                  className="w-full p-2 text-sm font-normal rounded-md border text-slate-800 focus:ring-2 focus:ring-[#8a2d46]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-500 block mb-1">{t.labelApiToken}</label>
                <input
                  type="password"
                  value={localConfig.token}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, token: e.target.value }))}
                  placeholder={t.placeholderToken}
                  className="w-full p-2 text-sm font-normal rounded-md border text-slate-800 focus:ring-2 focus:ring-[#8a2d46]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md border flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? t.testingConnection : t.testConnection}</span>
              </button>
            </div>
            {testResult && (
              <div className={`p-4 rounded-lg border text-xs leading-loose ${testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
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

        {/* ── SECTION 2: THEMES ─────────────────────────────────────── */}
        <div
          id="themes"
          ref={el => { sectionRefs.current['themes'] = el; }}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-20"
        >
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Palette className="w-5 h-5 text-indigo-600" /> {t.section2Title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { key: 'modern',   name: t.themeModernName,   desc: t.themeModernDesc,   colors: ['bg-[#8a2d46]', 'bg-indigo-600', 'bg-[#f8f9ff] border'], ring: 'border-[#8a2d46] ring-[#8a2d46]/30 bg-purple-50/50' },
              { key: 'classic',  name: t.themeClassicName,  desc: t.themeClassicDesc,  colors: ['bg-[#2b5d8f]', 'bg-yellow-500', 'bg-[#edf2f7] border'],  ring: 'border-blue-600 ring-blue-600/30 bg-blue-50/40' },
              { key: 'contrast', name: t.themeContrastName, desc: t.themeContrastDesc, colors: ['bg-[#8a2d46]', 'bg-white border border-[#8a2d46]', 'bg-slate-100'], ring: 'border-[#8a2d46] ring-[#8a2d46]/30 bg-[#fffcfc]' },
            ] as const).map(theme => (
              <button
                key={theme.key}
                onClick={() => setLocalConfig(prev => ({ ...prev, activeTheme: theme.key as any }))}
                className={`p-4 rounded-xl border text-left space-y-2.5 transition-all outline-hidden ${
                  localConfig.activeTheme === theme.key
                    ? `ring-2 ${theme.ring}`
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-bold text-sm block text-slate-800">{theme.name}</span>
                <span className="text-[11px] text-slate-400 block line-clamp-2">{theme.desc}</span>
                <div className="flex gap-1.5 pt-1">
                  {theme.colors.map((c, i) => <span key={i} className={`w-4 h-4 rounded-full ${c}`} />)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: TRACKERS ───────────────────────────────────── */}
        <div
          id="trackers"
          ref={el => { sectionRefs.current['trackers'] = el; }}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-20"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" /> {t.section3Title}
            </h3>
            <div className="flex items-center gap-2">
              {localConfig.useDemoWorkspace ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{t.sectionDemoMode}</span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{t.sectionConnectedMode}</span>
              )}
              <button onClick={() => loadTrackers()} disabled={loadingTrackers} className="p-1 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-50 transition-colors" title={t.reloadTrackers}>
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTrackers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">{t.trackersDescription}</p>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-2">
            {([
              { level: 'l3', label: t.levelStrategic, count: tl3.length, bg: 'bg-purple-100 text-purple-800 border-purple-200' },
              { level: 'l2', label: t.levelTactical,  count: tl2.length, bg: 'bg-blue-100 text-blue-800 border-blue-200' },
              { level: 'l1', label: t.levelOperational, count: tl1.length, bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              { level: 'none', label: t.levelIgnore, count: trackers.length - tl3.length - tl2.length - tl1.length, bg: 'bg-slate-100 text-slate-600 border-slate-200' },
            ] as const).map(({ level, label, count, bg }) => (
              <span key={level} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${bg}`}>
                <span>{label}</span>
                <span className="opacity-60">({count})</span>
              </span>
            ))}
          </div>

          {/* Search filter */}
          <div className="relative">
            <input
              type="text"
              value={trackerFilter}
              onChange={e => setTrackerFilter(e.target.value)}
              placeholder="Filtrar trackers..."
              className="w-full pl-3 pr-8 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-[#8a2d46] bg-slate-50"
            />
            {trackerFilter && (
              <button onClick={() => setTrackerFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
            )}
          </div>

          {/* Tracker cards grid */}
          {loadingTrackers ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-[#8a2d46]" />
              <span className="text-xs font-medium">{t.loadingTrackers}</span>
            </div>
          ) : filteredTrackers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              {trackerFilter ? 'Nenhum tracker encontrado para este filtro.' : t.noTrackers}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredTrackers.map((tracker) => {
                const currentLevel = getTrackerLevel(tracker);
                const levelMeta = {
                  l3:   { label: t.levelStrategic,   dot: 'bg-purple-500', cardBg: 'border-purple-200 bg-purple-50/40' },
                  l2:   { label: t.levelTactical,     dot: 'bg-blue-500',   cardBg: 'border-blue-200 bg-blue-50/40' },
                  l1:   { label: t.levelOperational,  dot: 'bg-emerald-500',cardBg: 'border-emerald-200 bg-emerald-50/40' },
                  none: { label: t.levelIgnore,        dot: 'bg-slate-300',  cardBg: 'border-slate-200 bg-white' },
                }[currentLevel];

                return (
                  <div
                    key={tracker}
                    className={`rounded-xl border p-3 transition-all ${levelMeta.cardBg}`}
                  >
                    {/* Tracker name + level */}
                    <div className="flex items-start justify-between gap-1 mb-2.5">
                      <span className="font-bold text-slate-800 text-xs leading-tight truncate flex-1">{tracker}</span>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${levelMeta.dot}`} />
                    </div>
                    {/* 4 quick-assign buttons in a row */}
                    <div className="grid grid-cols-4 gap-1">
                      {([
                        { level: 'l3' as const, short: 'L3', activeClass: 'bg-purple-600 text-white border-purple-600' },
                        { level: 'l2' as const, short: 'L2', activeClass: 'bg-blue-600 text-white border-blue-600' },
                        { level: 'l1' as const, short: 'L1', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
                        { level: 'none' as const, short: '—', activeClass: 'bg-slate-500 text-white border-slate-500' },
                      ]).map(({ level, short, activeClass }) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleSetTrackerLevel(tracker, level)}
                          className={`py-1 text-[10px] font-bold rounded border transition-all ${
                            currentLevel === level
                              ? activeClass
                              : 'bg-white text-slate-500 hover:text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {short}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add custom tracker */}
          <div className="flex items-end gap-2 max-w-sm pt-2 border-t border-slate-100">
            <div className="flex-1 space-y-1 text-xs font-semibold">
              <label className="text-slate-500 block">{t.addCustomTracker}</label>
              <input
                type="text"
                value={customTrackerName}
                onChange={(e) => setCustomTrackerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomTracker()}
                placeholder={t.placeholderCustomTracker}
                className="w-full p-2 text-xs font-normal border rounded-md focus:ring-2 focus:ring-[#8a2d46]"
              />
            </div>
            <button
              onClick={handleAddCustomTracker}
              type="button"
              className="p-2 bg-[#8a2d46] hover:bg-[#80253e] text-white rounded-md border border-[#8a2d46] transition-all flex items-center justify-center w-9 h-9 flex-shrink-0"
              title={t.addCustomTracker}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── SECTION 4: CUSTOM FIELDS ──────────────────────────────── */}
        <div
          id="fields"
          ref={el => { sectionRefs.current['fields'] = el; }}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-20"
        >
          <h3 className="text-base font-bold text-slate-800 flex items-center justify-between border-b pb-2">
            <span className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" /> {t.section4Title}
            </span>
            <button
              type="button"
              onClick={() => loadCustomFields()}
              disabled={loadingCustomFields}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-50 transition-colors"
              title={t.reloadCustomFields}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCustomFields ? 'animate-spin' : ''}`} />
            </button>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-2">{t.customFieldsDesc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            {renderFieldMapper(t.fieldBlockedFlag,   'blockedFlag',    t.placeholderBlockedFlag)}
            {renderFieldMapper(t.fieldBlockedReason, 'blockedReason',  t.placeholderBlockedReason)}
            {renderFieldMapper(t.fieldTeam,          'team',           t.placeholderTeam)}
            {renderFieldMapper(t.fieldGrouping,      'groupingField',  t.placeholderGrouping)}
          </div>
        </div>

        {/* ── SECTION 5: KANBAN STAGES ──────────────────────────────── */}
        <div
          id="kanban"
          ref={el => { sectionRefs.current['kanban'] = el; }}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-20"
        >
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <FolderLock className="w-5 h-5 text-indigo-600" /> {t.section5Title}
          </h3>

          {/* Auto-map CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-150 p-4 rounded-xl">
            <div className="space-y-1">
              <p className="text-slate-700 font-bold text-xs sm:text-sm">{t.autoMapTitle}</p>
              <p className="text-slate-400 text-[11px] leading-snug">{t.autoMapDesc}</p>
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
            <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
              autoMapFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-950'
            }`}>
              {autoMapFeedback.success
                ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                : <XCircle    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
              <p className="font-semibold">{autoMapFeedback.message}</p>
            </div>
          )}

          {/* Stats row + filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stage filter pills */}
            <button
              onClick={() => setActiveStageFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                activeStageFilter === 'all'
                  ? 'bg-slate-700 text-white border-slate-700'
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    isActive
                      ? `${col.bg} ${col.border} ${col.text}`
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  {stage} ({stageCounts[stage] ?? 0})
                </button>
              );
            })}

            {/* Text search */}
            <div className="relative ml-auto">
              <input
                type="text"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                placeholder="Buscar status..."
                className="pl-3 pr-7 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-[#8a2d46] bg-slate-50 w-40"
              />
              {statusFilter && (
                <button onClick={() => setStatusFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
              )}
            </div>
          </div>

          {/* Compact cards grid — one card per Redmine status */}
          {filteredStageEntries.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">Nenhum status encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredStageEntries.map(([redmineSt, kanbanSg]) => {
                const col = STAGE_COLORS[kanbanSg as KanbanStage];
                return (
                  <div
                    key={redmineSt}
                    className={`rounded-xl border p-3 transition-all ${col.bg} ${col.border}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`font-mono font-bold text-[11px] leading-tight ${col.text} truncate flex-1`}>{redmineSt}</span>
                      <button
                        onClick={() => handleRemoveStatusMapping(redmineSt)}
                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0 text-[10px] font-bold"
                        title={t.removeMapping}
                      >
                        ✕
                      </button>
                    </div>
                    {/* Inline stage selector as pill buttons */}
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
                            className={`py-0.5 text-[9px] font-bold rounded border transition-all truncate px-0.5 ${
                              isSelected
                                ? `${optCol.bg} ${optCol.border} ${optCol.text}`
                                : 'bg-white/60 text-slate-400 border-white/60 hover:bg-white hover:text-slate-600'
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

          {/* Add new status form */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">{t.addStatusMapping}</p>
            <div className="flex flex-wrap items-end gap-2">
              <input
                type="text"
                value={newRedmineStatus}
                onChange={(e) => setNewRedmineStatus(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddStatusMapping()}
                placeholder={t.placeholderRedmineStatus}
                className="flex-1 min-w-[160px] p-2 text-xs border rounded-md focus:ring-2 focus:ring-[#8a2d46]"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newKanbanStage}
                  onChange={(e) => setNewKanbanStage(e.target.value as KanbanStage)}
                  className="p-2 text-xs border rounded-md focus:ring-2 focus:ring-[#8a2d46]"
                >
                  {STAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <button
                  onClick={handleAddStatusMapping}
                  type="button"
                  className="py-2 px-4 bg-[#8a2d46] hover:bg-[#80253e] text-white rounded-md text-xs font-bold border border-[#8a2d46] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.linkStatus}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 6: LANGUAGE ───────────────────────────────────── */}
        <div
          id="language"
          ref={el => { sectionRefs.current['language'] = el; }}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs scroll-mt-20"
        >
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Globe className="w-5 h-5 text-indigo-600" /> {t.section6Title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">{t.section6Desc}</p>
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
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all outline-hidden ${
                  localConfig.language === code
                    ? 'border-[#8a2d46] ring-2 ring-[#8a2d46]/30 bg-rose-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{flag}</span>
                <div>
                  <span className="font-bold text-sm block text-slate-800">{label}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{code}</span>
                </div>
                {localConfig.language === code && (
                  <CheckCircle className="w-4 h-4 text-[#8a2d46] ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── FOOTER SAVE ───────────────────────────────────────────── */}
        <div className="p-4 bg-slate-50 rounded-xl border border-dashed flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span>{t.settingsStorageNote}</span>
          </div>
          <button
            onClick={handleSave}
            className="py-2 px-6 bg-[#8a2d46] hover:bg-[#80253e] text-white font-bold text-xs rounded-md shadow-xs active:scale-[0.98] transition-all"
          >
            {t.saveAllSettings}
          </button>
        </div>

      </div>
    </div>
  );
}
