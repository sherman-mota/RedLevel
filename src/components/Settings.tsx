import React, { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Tag,
  FolderLock,
  Sliders,
  Palette,
  Trash2,
  CheckCircle,
  ChevronRight,
  Layers
} from 'lucide-react';
import { RedmineConfig } from '../types';
import { fetchRedmineTrackers, fetchRedmineCustomFields, DEFAULT_CONFIG } from '../api/redmine';
import { useLanguage } from '../i18n/LanguageContext';

// Import subcomponents
import ConnectionSettings from './settings/ConnectionSettings';
import TrackerSyncSettings from './settings/TrackerSyncSettings';
import KanbanStageSettings from './settings/KanbanStageSettings';
import { L3LevelSettings, L2LevelSettings, L1LevelSettings } from './settings/FlightLevelSettings';
import KanbanFiltersSettings from './settings/KanbanFiltersSettings';
import AppearanceSettings from './settings/AppearanceSettings';
import DataResetSettings from './settings/DataResetSettings';

interface SettingsProps {
  config: RedmineConfig;
  onSaveConfig: (updated: RedmineConfig) => void;
}

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
      stagesMap: JSON.parse(JSON.stringify(config?.stagesMap || DEFAULT_CONFIG.stagesMap)),
    };
  });

  // Section refs for scroll-navigation
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('connection');

  // Shared loaded assets
  const [trackers, setTrackers] = useState<string[]>([]);
  const [loadingTrackers, setLoadingTrackers] = useState(false);

  const [customFields, setCustomFields] = useState<{ id: string; name: string; possibleValues?: string[] }[]>([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);

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

  // macOS system settings styled navigation
  const navSections = [
    { id: 'connection', icon: Server, label: 'Conexão', color: 'bg-blue-500 text-white' },
    { id: 'trackers', icon: Tag, label: 'Trackers Sync', color: 'bg-emerald-500 text-white' },
    { id: 'kanban-stages', icon: FolderLock, label: 'Estágios Kanban', color: 'bg-indigo-500 text-white' },
    { id: 'l3-level', icon: Layers, label: 'Nível N3 (Estrat)', color: 'bg-purple-500 text-white' },
    { id: 'l2-level', icon: Layers, label: 'Nível N2 (Tático)', color: 'bg-orange-500 text-white' },
    { id: 'l1-level', icon: Layers, label: 'Nível N1 (Oper)', color: 'bg-teal-500 text-white' },
    { id: 'kanban-filters', icon: Sliders, label: 'Filtros Kanban', color: 'bg-amber-500 text-white' },
    { id: 'themes', icon: Palette, label: 'Aparência', color: 'bg-pink-500 text-white' },
    { id: 'data-reset', icon: Trash2, label: 'Dados & Reset', color: 'bg-rose-500 text-white' },
  ];

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
                type="button"
                onClick={() => scrollToSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all transition-colors ${activeSection === id
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
              type="button"
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
            className="scroll-mt-6"
          >
            <ConnectionSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              onConnectionSuccess={(updatedConfig) => {
                loadTrackers(updatedConfig);
                loadCustomFields(updatedConfig);
              }}
            />
          </div>

          {/* ── SECTION 3: TRACKERS Sync ───────────────────────────────────── */}
          <div
            id="trackers"
            ref={el => { sectionRefs.current['trackers'] = el; }}
            className="scroll-mt-6"
          >
            <TrackerSyncSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              trackers={trackers}
              loadingTrackers={loadingTrackers}
              loadTrackers={loadTrackers}
            />
          </div>

          {/* ── SECTION 8: KANBAN STAGES ──────────────────────────────── */}
          <div
            id="kanban-stages"
            ref={el => { sectionRefs.current['kanban-stages'] = el; }}
            className="scroll-mt-6"
          >
            <KanbanStageSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
            />
          </div>

          {/* ── SECTION 4: NÍVEL N3 (ESTRATÉGICO) ─────────────────────────── */}
          <div
            id="l3-level"
            ref={el => { sectionRefs.current['l3-level'] = el; }}
            className="scroll-mt-6"
          >
            <L3LevelSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              customFields={customFields}
              loadingCustomFields={loadingCustomFields}
            />
          </div>

          {/* ── SECTION 5: NÍVEL N2 (TÁTICO) ─────────────────────────────── */}
          <div
            id="l2-level"
            ref={el => { sectionRefs.current['l2-level'] = el; }}
            className="scroll-mt-6"
          >
            <L2LevelSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              customFields={customFields}
              loadingCustomFields={loadingCustomFields}
            />
          </div>

          {/* ── SECTION 6: NÍVEL N1 (OPERACIONAL) ─────────────────────────── */}
          <div
            id="l1-level"
            ref={el => { sectionRefs.current['l1-level'] = el; }}
            className="scroll-mt-6"
          >
            <L1LevelSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              customFields={customFields}
              loadingCustomFields={loadingCustomFields}
            />
          </div>

          {/* ── SECTION 7: KANBAN FILTERS ─────────────────────────────────── */}
          <div
            id="kanban-filters"
            ref={el => { sectionRefs.current['kanban-filters'] = el; }}
            className="scroll-mt-6"
          >
            <KanbanFiltersSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
              customFields={customFields}
            />
          </div>

          {/* ── SECTION 2: THEMES & LANGUAGE ─────────────────────────────────────── */}
          <div
            id="themes"
            ref={el => { sectionRefs.current['themes'] = el; }}
            className="scroll-mt-6"
          >
            <AppearanceSettings
              localConfig={localConfig}
              setLocalConfig={setLocalConfig}
            />
          </div>

          {/* ── SECTION 9: DATA & RESET ───────────────────────────────── */}
          <div
            id="data-reset"
            ref={el => { sectionRefs.current['data-reset'] = el; }}
            className="scroll-mt-6"
          >
            <DataResetSettings
              isDemoCleared={isDemoCleared}
              setIsDemoCleared={setIsDemoCleared}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
