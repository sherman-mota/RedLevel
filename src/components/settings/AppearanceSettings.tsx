import React from 'react';
import { Palette, Globe, CheckCircle } from 'lucide-react';
import { RedmineConfig } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface AppearanceSettingsProps {
  localConfig: RedmineConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<RedmineConfig>>;
}

export default function AppearanceSettings({
  localConfig,
  setLocalConfig,
}: AppearanceSettingsProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <Palette className="w-4 h-4 text-pink-500" /> {t.section2Title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { key: 'modern', name: t.themeModernName, desc: t.themeModernDesc, colors: ['bg-[#8a2d46]', 'bg-indigo-600', 'bg-[#f8f9ff] border'], ring: 'border-[#8a2d46] ring-2 ring-[#8a2d46]/20 bg-rose-50/20' },
            { key: 'classic', name: t.themeClassicName, desc: t.themeClassicDesc, colors: ['bg-[#2b5d8f]', 'bg-yellow-500', 'bg-[#edf2f7] border'], ring: 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20' },
            { key: 'contrast', name: t.themeContrastName, desc: t.themeContrastDesc, colors: ['bg-[#8a2d46]', 'bg-white border border-[#8a2d46]', 'bg-slate-100'], ring: 'border-[#8a2d46] ring-2 ring-[#8a2d46]/20 bg-[#fffcfc]' },
          ] as const).map(theme => (
            <button
              key={theme.key}
              type="button"
              onClick={() => setLocalConfig(prev => ({ ...prev, activeTheme: theme.key as any }))}
              className={`p-4 rounded-xl border text-left space-y-2 transition-all outline-hidden ${localConfig.activeTheme === theme.key
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
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all outline-hidden ${localConfig.language === code
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
  );
}
