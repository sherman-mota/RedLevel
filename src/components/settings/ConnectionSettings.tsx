import React, { useState } from 'react';
import { Server, RefreshCw, CheckCircle } from 'lucide-react';
import { RedmineConfig } from '../../types';
import { testConnection } from '../../api/redmine';
import { useLanguage } from '../../i18n/LanguageContext';

interface ConnectionSettingsProps {
  localConfig: RedmineConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<RedmineConfig>>;
  onConnectionSuccess: (updatedConfig: RedmineConfig) => void;
}

export default function ConnectionSettings({
  localConfig,
  setLocalConfig,
  onConnectionSuccess,
}: ConnectionSettingsProps) {
  const { t } = useLanguage();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
        onConnectionSuccess(updatedConfig);
      } else {
        setTestResult({ success: false, message: t.connectionFailed });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Falha de requisição de rede.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
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
  );
}
