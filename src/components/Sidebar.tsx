import React from 'react';
import {
  BarChart3,
  Settings as SettingsIcon,
  Satellite,
  Plane,
  Monitor,
  GitMerge,
  Layers,
  Server,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { RedmineConfig } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  config: RedmineConfig;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onNewInitiative?: () => void;
}

export default function Sidebar({
  currentTab,
  setTab,
  config,
  collapsed,
  setCollapsed,
  onNewInitiative
}: SidebarProps) {

  const getThemeClasses = () => {
    switch (config.activeTheme) {
      case 'classic':
        return 'bg-red-50/10 text-slate-800 border-r border-red-100';
      case 'contrast':
        return 'bg-white text-[#8a2d46] border-r-2 border-[#8a2d46]';
      case 'modern':
      default:
        return 'bg-slate-50 text-slate-800 border-r border-slate-250';
    }
  };

  const getActiveTabClass = (tabId: string) => {
    const isClassic = config.activeTheme === 'classic';
    const isContrast = config.activeTheme === 'contrast';

    if (currentTab === tabId) {
      if (isClassic) {
        return 'bg-[#8a2d46]/10 text-[#8a2d46] font-semibold border-l-4 border-l-[#8a2d46]';
      }
      if (isContrast) {
        return 'bg-[#8a2d46]/20 text-[#8a2d46] font-extrabold border-l-4 border-l-[#8a2d46]';
      }
      return 'bg-[#8a2d46]/10 text-[#8a2d46] font-medium border-l-4 border-l-[#8a2d46]';
    }

    // Hover styles
    if (isClassic) return 'hover:bg-red-50/80 text-slate-700';
    if (isContrast) return 'hover:bg-[#8a2d46]/5 text-slate-800';
    return 'hover:bg-slate-200/50 text-slate-700';
  };

  const { t } = useLanguage();

  const navItems = [
    { id: 'overview', name: t.navOverview, icon: Layers, meta: t.navMetaOverview },
    { id: 'l3', name: t.navL3, icon: Satellite, meta: t.navMetaL3 },
    { id: 'l2', name: t.navL2, icon: Plane, meta: t.navMetaL2 },
    { id: 'l1', name: t.navL1, icon: Monitor, meta: t.navMetaL1 },
    { id: 'dependencies', name: t.navDependencies, icon: GitMerge, meta: t.navMetaDep },
    { id: 'metrics', name: t.navMetrics, icon: BarChart3, meta: t.navMetaMetrics },
    { id: 'settings', name: t.navSettings, icon: SettingsIcon, meta: t.navMetaSettings },
  ];

  return (
    <div
      className={`h-screen flex flex-col justify-between transition-all duration-350 relative ${collapsed ? 'w-20' : 'w-64'} ${getThemeClasses()}`}
    >
      {/* BRAND HEADER */}
      <div className={`p-4 border-b ${config.activeTheme === 'classic' ? 'border-red-100' : config.activeTheme === 'contrast' ? 'border-[#8a2d46]' : 'border-slate-200'} flex items-center justify-between`}>
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-[#8a2d46]">
                <span className="font-bold text-white text-sm">RL</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#8a2d46]">
                {t.appName}
              </h1>
            </div>
            <p className="text-xs mt-0.5 text-slate-500 font-mono">
              {t.appSubtitle}
            </p>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded flex items-center justify-center bg-[#8a2d46]">
            <span className="font-bold text-white text-base">RL</span>
          </div>
        )}
      </div>

      {/* NAVIGATION ITEMS */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded text-left text-sm transition-all relative group ${getActiveTabClass(item.id)}`}
              title={collapsed ? `${item.name} (${item.meta})` : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${currentTab === item.id ? 'stroke-[2.5px] text-[#8a2d46]' : 'stroke-[1.5px] text-slate-500'}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate font-sans">{item.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${currentTab === item.id
                    ? 'bg-[#8a2d46]/20 text-[#8a2d46] font-bold'
                    : 'bg-slate-200/50 text-slate-500 font-mono'
                    }`}>
                    {item.meta}
                  </span>
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-white border border-slate-200 text-slate-800 text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md">
                  {item.name} <span className="text-slate-400 font-mono">({item.meta})</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* COLLAPSE CONTROL & STATE STATUS */}
      <div className={`p-3 border-t ${config.activeTheme === 'classic' ? 'border-red-100' : config.activeTheme === 'contrast' ? 'border-[#8a2d46]' : 'border-slate-250'} space-y-3`}>
        {/* Connection Status Indicator */}
        <div className={`text-xs rounded p-2 flex items-center gap-2 ${config.isConnected
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : 'bg-amber-50 text-amber-800 border border-amber-250'
          }`}>
          <Server className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <p className="font-semibold leading-3">
                {config.isConnected ? t.redmineConnected : t.connectionOffline}
              </p>
              <p className="text-[9px] opacity-70 truncate mt-0.5">
                {config.isConnected ? config.serverUrl.replace(/^https?:\/\//, '') : t.demoWorkspace}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full hidden md:flex items-center justify-center gap-2 py-2 px-2 rounded-md hover:bg-slate-200/50 text-slate-500 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-500" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-medium">{t.collapseMenu}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
