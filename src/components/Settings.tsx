import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  Layout, 
  Tag, 
  FolderLock, 
  Sliders, 
  HelpCircle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Palette,
  Plus
} from 'lucide-react';
import { RedmineConfig, KanbanStage } from '../types';
import { testConnection, fetchRedmineTrackers, fetchRedmineCustomFields, DEFAULT_CONFIG } from '../api/redmine';

interface SettingsProps {
  config: RedmineConfig;
  onSaveConfig: (updated: RedmineConfig) => void;
}

const STAGE_OPTIONS: KanbanStage[] = ['Backlog', 'To Do', 'In Progress', 'Done'];

export default function Settings({
  config,
  onSaveConfig
}: SettingsProps) {
  // Local state copy
  const [localConfig, setLocalConfig] = useState<RedmineConfig>(() => {
    const configTrackers = config?.trackers || {};
    const mergedTrackers = {
      l3: Array.isArray(configTrackers.l3) ? configTrackers.l3 : (DEFAULT_CONFIG?.trackers?.l3 || []),
      l2: Array.isArray(configTrackers.l2) ? configTrackers.l2 : (DEFAULT_CONFIG?.trackers?.l2 || []),
      l1: Array.isArray(configTrackers.l1) ? configTrackers.l1 : (DEFAULT_CONFIG?.trackers?.l1 || []),
    };

    return {
      ...DEFAULT_CONFIG,
      ...config,
      trackers: mergedTrackers,
      fieldsMap: {
        ...DEFAULT_CONFIG.fieldsMap,
        ...(config?.fieldsMap || {})
      },
      stagesMap: {
        ...DEFAULT_CONFIG.stagesMap,
        ...(config?.stagesMap || {})
      }
    };
  });
  
  // Connection tester states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // New status mapping creator states
  const [newRedmineStatus, setNewRedmineStatus] = useState('');
  const [newKanbanStage, setNewKanbanStage] = useState<KanbanStage>('To Do');

  // Dynamic tracker states
  const [trackers, setTrackers] = useState<string[]>([]);
  const [loadingTrackers, setLoadingTrackers] = useState(false);
  const [customTrackerName, setCustomTrackerName] = useState('');

  // Dynamic custom fields states
  const [customFields, setCustomFields] = useState<{ id: string; name: string }[]>([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);

  const loadTrackers = async (cfgToUse = localConfig) => {
    setLoadingTrackers(true);
    try {
      const list = await fetchRedmineTrackers(cfgToUse);
      // Mesclar os trackers do servidor com os mapeamentos já existentes de forma ultra-segura
      const configTrackers = cfgToUse?.trackers || {};
      const l3 = Array.isArray(configTrackers.l3) ? configTrackers.l3 : [];
      const l2 = Array.isArray(configTrackers.l2) ? configTrackers.l2 : [];
      const l1 = Array.isArray(configTrackers.l1) ? configTrackers.l1 : [];

      const combined = Array.from(new Set([
        ...list,
        ...l3,
        ...l2,
        ...l1
      ]));
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
    // Carrega trackers e campos personalizados apenas na montagem ou quando o workspace de demonstração muda
    loadTrackers();
    loadCustomFields();
  }, [localConfig.useDemoWorkspace]);

  const handleSave = () => {
    onSaveConfig({
      ...localConfig,
      isConnected: localConfig.useDemoWorkspace ? false : localConfig.isConnected
    });
    alert('Configurações salvas com sucesso no armazenamento local!');
  };

  const handleTestConnection = async () => {
    if (!localConfig.serverUrl || !localConfig.token) {
      setTestResult({
        success: false,
        message: 'Por favor, preencha a URL do Redmine e o Token de API.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const isOk = await testConnection(localConfig.serverUrl, localConfig.token);
      if (isOk) {
        setTestResult({
          success: true,
          message: 'Conectado com sucesso ao Redmine! Suas credenciais são válidas.'
        });
        const updatedConfig = { ...localConfig, isConnected: true, useDemoWorkspace: false };
        setLocalConfig(updatedConfig);
        // Carrega trackers e campos personalizados automaticamente com as novas credenciais válidas
        loadTrackers(updatedConfig);
        loadCustomFields(updatedConfig);
      } else {
        setTestResult({
          success: false,
          message: 'O servidor retornou um código de erro. Verifique sua chave de autenticação.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha de requisição de rede (Erro CORS comum em Redmines locais).'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleAddStatusMapping = () => {
    if (!newRedmineStatus.trim()) return;
    
    setLocalConfig(prev => ({
      ...prev,
      stagesMap: {
        ...prev.stagesMap,
        [newRedmineStatus.trim()]: newKanbanStage
      }
    }));
    setNewRedmineStatus('');
  };

  const handleRemoveStatusMapping = (redmineStatus: string) => {
    const updatedStages = { ...localConfig.stagesMap };
    delete updatedStages[redmineStatus];
    setLocalConfig(prev => ({ ...prev, stagesMap: updatedStages }));
  };

  const handleSetTrackerLevel = (trackerName: string, level: 'l3' | 'l2' | 'l1' | 'none') => {
    setLocalConfig(prev => {
      const l1 = prev.trackers.l1.filter(t => t !== trackerName);
      const l2 = prev.trackers.l2.filter(t => t !== trackerName);
      const l3 = prev.trackers.l3.filter(t => t !== trackerName);

      if (level === 'l1') l1.push(trackerName);
      else if (level === 'l2') l2.push(trackerName);
      else if (level === 'l3') l3.push(trackerName);

      return {
        ...prev,
        trackers: { l1, l2, l3 }
      };
    });
  };

  const handleAddCustomTracker = () => {
    if (!customTrackerName.trim()) return;
    const name = customTrackerName.trim();
    if (!trackers.includes(name)) {
      setTrackers(prev => [...prev, name]);
    }
    handleSetTrackerLevel(name, 'l1');
    setCustomTrackerName('');
  };

  const renderFieldMapper = (
    label: string, 
    valueKey: 'blockedFlag' | 'blockedReason' | 'team' | 'groupingField', 
    placeholder: string
  ) => {
    const currentValue = localConfig.fieldsMap[valueKey] || '';
    // Check if current value matches any loaded custom field (by name or id)
    const matchedField = customFields.find(cf => cf.id === currentValue || cf.name === currentValue);
    const selectValue = matchedField ? (matchedField.name) : (currentValue ? '__manual__' : '');
    
    // Ordena os campos em ordem alfabética para facilitar a busca visual
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
                fieldsMap: { ...prev.fieldsMap, [valueKey]: '' }
              }));
            } else {
              setLocalConfig(prev => ({
                ...prev,
                fieldsMap: { ...prev.fieldsMap, [valueKey]: val }
              }));
            }
          }}
          className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#8a2d46] text-slate-700 transition-all"
        >
          <option value="">-- Selecionar Campo --</option>
          {sortedCustomFields.map(cf => (
            <option key={cf.id} value={cf.name}>
              {cf.name} (ID: {cf.id})
            </option>
          ))}
          <option value="__manual__">✍️ Outro / Digitar Manualmente...</option>
        </select>

        {(selectValue === '__manual__' || (!matchedField && currentValue)) && (
          <div className="space-y-1 mt-1">
            <span className="text-[10px] text-slate-400 font-medium uppercase">Valor Mapeado (ID ou Nome)</span>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                fieldsMap: { ...prev.fieldsMap, [valueKey]: e.target.value }
              }))}
              placeholder={placeholder}
              className="w-full p-2 text-xs font-normal rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#8a2d46] bg-white text-slate-800 transition-all placeholder:text-slate-350"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-left">
      
      {/* SETTINGS HEADER */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#8a2d46] text-white flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Painel de Ajustes & Integrações</h2>
          <p className="text-xs text-slate-400">Configure mapeamento de campos personalizados, conexão de servidores e preferências visuais do Flight Levels</p>
        </div>
      </div>

      {/* SECTION 1: REDMINE CONNECTION SETTINGS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <Server className="w-5 h-5 text-indigo-600" /> 1. Conexão com Servidor Redmine
        </h3>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-1.5Packed">
              <label className="text-slate-500 block mb-1">URL Oficial do Servidor Redmine</label>
              <input
                type="text"
                value={localConfig.serverUrl}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                placeholder="Ex: https://meu-redmine.empresa.com"
                className="w-full p-2 text-sm font-normal rounded-md border text-slate-800 focus:ring-2 focus:ring-[#8a2d46]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 block mb-1">API Access Token (Chave de Acesso)</label>
              <input
                type="password"
                value={localConfig.token}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, token: e.target.value }))}
                placeholder="Inserir hash de chave rest..."
                className="w-full p-2 text-sm font-normal rounded-md border text-slate-800 focus:ring-2 focus:ring-[#8a2d46]"
              />
            </div>
          </div>

          {/* Test Connection Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md border flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>Testar Conexão</span>
            </button>
          </div>

          {/* Connection Status Tester Response feedback block */}
          {testResult && (
            <div className={`p-4.5 rounded-lg border text-xs leading-loose ${testResult.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">✕</div>}
                <span className="font-bold">{testResult.success ? 'Conexão Estabelecida!' : 'Falha na Validação'}</span>
              </div>
              <p className="mt-1.5 text-[11px] opacity-90">{testResult.message}</p>
              {!testResult.success && (
                <div className="pt-2 text-[10px] text-slate-500">
                  💡 <b>Como resolver erro CORS do Redmine:</b> Adicione as seguintes configurações de cabeçalho no arquivo <code>additional_environment.rb</code> de seu Redmine: <br/>
                  <code>config.middleware.insert_before 0, Rack::Cors do |allows| allows.allow do origins '*'; resource '*', headers: :any, methods: [:get, :post, :options] end end</code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: BRAND THEME OPTIONS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <Palette className="w-5 h-5 text-indigo-600" /> 2. Temas Visuais (Enterprise Palette)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Theme Modern */}
          <button
            onClick={() => setLocalConfig(prev => ({ ...prev, activeTheme: 'modern' }))}
            className={`p-4 rounded-xl border text-left space-y-2.5 transition-all outline-hidden ${
              localConfig.activeTheme === 'modern' 
                ? 'border-[#8a2d46] ring-2 ring-[#8a2d46]/30 bg-purple-50/50' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-sm block text-slate-800">Modern RedLevels</span>
            <span className="text-[11px] text-slate-400 block line-clamp-2">Visual elegante baseado em bordas limpas e paleta de corporação Deep Crimson.</span>
            <div className="flex gap-1.5 pt-1">
              <span className="w-4 h-4 rounded-full bg-[#8a2d46]" />
              <span className="w-4 h-4 rounded-full bg-indigo-600" />
              <span className="w-4 h-4 rounded-full bg-[#f8f9ff] border" />
            </div>
          </button>

          {/* Theme Classic */}
          <button
            onClick={() => setLocalConfig(prev => ({ ...prev, activeTheme: 'classic' }))}
            className={`p-4 rounded-xl border text-left space-y-2.5 transition-all outline-hidden ${
              localConfig.activeTheme === 'classic' 
                ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/40' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-sm block text-slate-800">Classic Redmine</span>
            <span className="text-[11px] text-slate-400 block line-clamp-2">Relembra a identidade estética azul rústica tradicional da comunidade Redmine.</span>
            <div className="flex gap-1.5 pt-1">
              <span className="w-4 h-4 rounded-full bg-[#2b5d8f]" />
              <span className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="w-4 h-4 rounded-full bg-[#edf2f7] border" />
            </div>
          </button>

          {/* Theme High Contrast */}
          <button
            onClick={() => setLocalConfig(prev => ({ ...prev, activeTheme: 'contrast' }))}
            className={`p-4 rounded-xl border text-left space-y-2.5 transition-all outline-hidden ${
              localConfig.activeTheme === 'contrast' 
                ? 'border-[#8a2d46] ring-2 ring-[#8a2d46]/30 bg-[#fffcfc]' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="font-bold text-sm block text-slate-800">High Contrast Red (Light)</span>
            <span className="text-[11px] text-slate-400 block line-clamp-2">Contraste claro purista com a paleta corporativa vermelha e bordas marcadas.</span>
            <div className="flex gap-1.5 pt-1">
              <span className="w-4 h-4 rounded-full bg-[#8a2d46]" />
              <span className="w-4 h-4 rounded-full bg-white border border-[#8a2d46]" />
              <span className="w-4 h-4 rounded-full bg-slate-100" />
            </div>
          </button>

        </div>
      </div>

      {/* SECTION 3: TRACKER SETTINGS PER FLIGHT LEVEL */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" /> 3. Mapeador de Trackers por Nível de Voo
          </h3>
          <div className="flex items-center gap-2">
            {localConfig.useDemoWorkspace ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Modo de Demonstração (Trackers Fictícios)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Conectado ao Redmine
              </span>
            )}
            <button
              onClick={loadTrackers}
              disabled={loadingTrackers}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
              title="Recarregar trackers do Redmine"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTrackers ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          Associe cada Tipo de Tarefa (Tracker) do seu Redmine ao seu respectivo nível do Flight Levels do modelo Klaus Leopold. Isso ditará em quais quadros e visões cada tarefa será agrupada.
        </p>

        {loadingTrackers ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-[#8a2d46]" />
            <span className="text-xs font-medium">Carregando trackers do Redmine...</span>
          </div>
        ) : trackers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Nenhum tracker localizado. Use o formulário abaixo para adicionar trackers manualmente.
          </div>
        ) : (
          <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="divide-y divide-slate-150">
              {trackers.map((tracker) => {
                // Determine current level mapping
                let currentLevel: 'l3' | 'l2' | 'l1' | 'none' = 'none';
                const configTrackers = localConfig?.trackers || {};
                const l3 = Array.isArray(configTrackers.l3) ? configTrackers.l3 : [];
                const l2 = Array.isArray(configTrackers.l2) ? configTrackers.l2 : [];
                const l1 = Array.isArray(configTrackers.l1) ? configTrackers.l1 : [];

                if (l3.includes(tracker)) currentLevel = 'l3';
                else if (l2.includes(tracker)) currentLevel = 'l2';
                else if (l1.includes(tracker)) currentLevel = 'l1';

                return (
                  <div key={tracker} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/40 transition-colors">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">{tracker}</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          currentLevel === 'l3' ? 'bg-purple-600 animate-pulse' :
                          currentLevel === 'l2' ? 'bg-blue-600' :
                          currentLevel === 'l1' ? 'bg-emerald-600' : 'bg-slate-300'
                        }`} />
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {currentLevel === 'l3' ? 'N3 Estratégico' :
                           currentLevel === 'l2' ? 'N2 Tático' :
                           currentLevel === 'l1' ? 'N1 Operacional' : 'Ignorado'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {/* L3 Pill Button */}
                      <button
                        type="button"
                        onClick={() => handleSetTrackerLevel(tracker, 'l3')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${
                          currentLevel === 'l3'
                            ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs font-semibold'
                            : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-slate-200 font-medium'
                        }`}
                      >
                        N3 Estratégico
                      </button>

                      {/* L2 Pill Button */}
                      <button
                        type="button"
                        onClick={() => handleSetTrackerLevel(tracker, 'l2')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${
                          currentLevel === 'l2'
                            ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-xs font-semibold'
                            : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-slate-200 font-medium'
                        }`}
                      >
                        N2 Tático
                      </button>

                      {/* L1 Pill Button */}
                      <button
                        type="button"
                        onClick={() => handleSetTrackerLevel(tracker, 'l1')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${
                          currentLevel === 'l1'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs font-semibold'
                            : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-slate-200 font-medium'
                        }`}
                      >
                        N1 Operacional
                      </button>

                      {/* Ignorar Pill Button */}
                      <button
                        type="button"
                        onClick={() => handleSetTrackerLevel(tracker, 'none')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${
                          currentLevel === 'none'
                            ? 'bg-slate-100 text-slate-800 border-slate-350 shadow-xs font-semibold'
                            : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-200 font-medium'
                        }`}
                      >
                        Ignorar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add custom tracker manually */}
        <div className="flex items-end gap-3 max-w-md pt-2 border-t border-slate-100">
          <div className="flex-1 space-y-1.5 font-semibold text-xs">
            <label className="text-slate-500 block">Adicionar Tracker Personalizado Manualmente</label>
            <input
              type="text"
              value={customTrackerName}
              onChange={(e) => setCustomTrackerName(e.target.value)}
              placeholder="Ex: Epic, Sub-tarefa"
              className="w-full p-2 text-xs font-normal border rounded-md focus:ring-2 focus:ring-[#8a2d46]"
            />
          </div>
          <button
            onClick={handleAddCustomTracker}
            type="button"
            className="p-2 bg-[#8a2d46] hover:bg-[#80253e] text-white rounded-md text-xs font-bold border border-[#8a2d46] transition-all flex items-center justify-center w-9 h-9"
            title="Adicionar tracker personalizado"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 4: CUSTOM FIELDS MAP */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 flex items-center justify-between border-b pb-2">
          <span className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" /> 4. Mapeador de Campos Personalizados
          </span>
          <button
            type="button"
            onClick={() => loadCustomFields()}
            disabled={loadingCustomFields}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-50 transition-colors"
            title="Recarregar campos do Redmine"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCustomFields ? 'animate-spin' : ''}`} />
          </button>
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed mb-2">
          Selecione os campos personalizados (Custom Fields) carregados do seu Redmine ou escolha "Outro" para digitar o nome/ID manualmente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          {renderFieldMapper(
            'Marcador de Bloqueio (Custom Block Flag)',
            'blockedFlag',
            'Ex: Impedimento, blocked_flag, 12'
          )}
          {renderFieldMapper(
            'Razão de Bloqueios (Block Reason Field)',
            'blockedReason',
            'Ex: blocked_reason, Causa de impedimento, 13'
          )}
          {renderFieldMapper(
            'Dono / Time Operacional (Squad Field ID)',
            'team',
            'Ex: squad_responsável, squad_id, 14'
          )}
          {renderFieldMapper(
            'Mapeador de Área L2 (Agrupador de Kanban)',
            'groupingField',
            'Ex: area_coordenacao, cluster_valor, 15'
          )}
        </div>
      </div>

      {/* SECTION 5: KANBAN STATUS STAGES MAPPING */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <FolderLock className="w-5 h-5 text-indigo-600" /> 5. Mapeador de Ciclos e Estágios Kanban
        </h3>

        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-slate-400">Associe o nome exato dos status cadastrados no seu servidor Redmine correspondente a um dos estágios consolidados de agilidade:</p>
          
          <div className="border rounded-lg overflow-hidden max-w-lg bg-zinc-50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">Status Redmine</th>
                  <th className="p-2.5">Mapeado Para</th>
                  <th className="p-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                {Object.entries(localConfig.stagesMap).map(([redmineSt, kanbanSg]) => (
                  <tr key={redmineSt} className="hover:bg-slate-100/50">
                    <td className="p-2.5 font-mono text-[11px] font-bold">{redmineSt}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        kanbanSg === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                        kanbanSg === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100'
                      }`}>
                        {kanbanSg}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button 
                        onClick={() => handleRemoveStatusMapping(redmineSt)}
                        className="text-red-500 hover:text-red-700 hover:underline"
                      >
                        Desfazer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form to add tracking stages */}
          <div className="flex flex-col sm:flex-row items-end gap-3 max-w-lg pt-3 border-t">
            <div className="flex-1 space-y-1.5 font-semibold">
              <label className="text-slate-500 text-[11px] block">Registrar Novo Status Redmine</label>
              <input
                type="text"
                value={newRedmineStatus}
                onChange={(e) => setNewRedmineStatus(e.target.value)}
                placeholder="Ex: Em Homologação"
                className="w-full p-2 text-xs font-normal border rounded-md"
              />
            </div>

            <div className="space-y-1.5 font-semibold">
              <label className="text-slate-500 text-[11px] block">Mapear Para Kanban</label>
              <select
                value={newKanbanStage}
                onChange={(e) => setNewKanbanStage(e.target.value as KanbanStage)}
                className="p-2 text-xs font-normal rounded-md border"
              >
                {STAGE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddStatusMapping}
              type="button"
              className="py-2 px-4 bg-[#8a2d46] hover:bg-[#80253e] text-white rounded-md text-xs font-bold transition-all border border-[#8a2d46]"
            >
              Vincular
            </button>
          </div>
        </div>
      </div>

      {/* FINAL SAVE ACTION BUTTONS BUTTON */}
      <div className="p-4 bg-slate-50 rounded-xl border border-dashed flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <span>Configurações persistidas nativamente em seu navegador local (LocalStorage).</span>
        </div>
        <button
          onClick={handleSave}
          className="py-2 px-6 bg-[#8a2d46] hover:bg-[#80253e] text-white font-bold text-xs rounded-md shadow-xs active:scale-[0.98] transition-all"
        >
          Salvar Todas as Configurações
        </button>
      </div>

    </div>
  );
}
