import React, { useState } from 'react';
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
  Palette
} from 'lucide-react';
import { RedmineConfig, KanbanStage } from '../types';
import { testConnection } from '../api/redmine';

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
  const [localConfig, setLocalConfig] = useState<RedmineConfig>({ ...config });
  
  // Connection tester states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // New status mapping creator states
  const [newRedmineStatus, setNewRedmineStatus] = useState('');
  const [newKanbanStage, setNewKanbanStage] = useState<KanbanStage>('To Do');

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
        setLocalConfig(prev => ({ ...prev, isConnected: true, useDemoWorkspace: false }));
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

  const updateTrackerList = (level: 'l3' | 'l2' | 'l1', csvValue: string) => {
    const arr = csvValue.split(',').map(s => s.trim()).filter(Boolean);
    setLocalConfig(prev => ({
      ...prev,
      trackers: {
        ...prev.trackers,
        [level]: arr
      }
    }));
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

        {/* Use Demo Workspace toggle switch */}
        <div className="p-3 bg-indigo-50 border rounded-lg flex items-center justify-between">
          <div className="space-y-0.5 text-xs">
            <span className="font-bold text-indigo-950 block">Ativar Modo Simulador (Demo Workspace)</span>
            <span className="text-slate-500 text-[11px] block">Ignora o Redmine externo e ativa um ecossistema offline populado com cards e dependências.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={localConfig.useDemoWorkspace}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, useDemoWorkspace: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
          </label>
        </div>

        {!localConfig.useDemoWorkspace && (
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
                  {testResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
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
        )}
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
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <Tag className="w-5 h-5 text-indigo-600" /> 3. Mapeador de Trackers por Nível de Voo
        </h3>
        
        <p className="text-xs text-slate-400">Classifica os trackers do Redmine em níveis Flight Levels do modelo Klaus Leopold (valores separados por vírgula).</p>

        <div className="space-y-3 pt-1 text-xs font-semibold">
          <div className="space-y-1">
            <span className="text-purple-800 block text-[11px] uppercase tracking-wider font-bold">📡 N3 Estratégico (Iniciativas Globais)</span>
            <input
              type="text"
              defaultValue={localConfig.trackers.l3.join(', ')}
              onBlur={(e) => updateTrackerList('l3', e.target.value)}
              placeholder="Ex: Strategic Initiative, Portfolio Goal"
              className="w-full p-2 text-sm font-normal rounded-md border focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1">
            <span className="text-blue-800 block text-[11px] uppercase tracking-wider font-bold">✈️ N2 Tático (Coordenação de Projetos)</span>
            <input
              type="text"
              defaultValue={localConfig.trackers.l2.join(', ')}
              onBlur={(e) => updateTrackerList('l2', e.target.value)}
              placeholder="Ex: Value Stream, Feature Epic"
              className="w-full p-2 text-sm font-normal rounded-md border focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <span className="text-emerald-800 block text-[11px] uppercase tracking-wider font-bold">💻 N1 Operacional (Ações Squad)</span>
            <input
              type="text"
              defaultValue={localConfig.trackers.l1.join(', ')}
              onBlur={(e) => updateTrackerList('l1', e.target.value)}
              placeholder="Ex: Task, Bug, Support Request"
              className="w-full p-2 text-sm font-normal rounded-md border focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: CUSTOM FIELDS MAP */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <Sliders className="w-5 h-5 text-indigo-600" /> 4. Mapeador de Campos Personalizados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-500 block">Marcador de Bloqueio (Custom Block Flag)</label>
            <input
              type="text"
              value={localConfig.fieldsMap.blockedFlag}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                fieldsMap: { ...prev.fieldsMap, blockedFlag: e.target.value }
              }))}
              placeholder="Ex: Impedimento, blocked_flag"
              className="w-full p-2 text-sm font-normal rounded-md border focus:ring-2 focus:ring-[#8a2d46]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 block">Razão de Bloqueios (Block Reason Field)</label>
            <input
              type="text"
              value={localConfig.fieldsMap.blockedReason}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                fieldsMap: { ...prev.fieldsMap, blockedReason: e.target.value }
              }))}
              placeholder="Ex: blocked_reason, Causa de impedimento"
              className="w-full p-2 text-sm font-normal rounded-md border focus:ring-2 focus:ring-[#8a2d46]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 block">Dono / Time Operacional (Squad Field ID)</label>
            <input
              type="text"
              value={localConfig.fieldsMap.team}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                fieldsMap: { ...prev.fieldsMap, team: e.target.value }
              }))}
              placeholder="Ex: squad_responsável, squad_id"
              className="w-full p-2 text-sm font-normal rounded-md border focus:ring-2 focus:ring-[#8a2d46]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 block">Mapeador de Área L2 (Agrupador de Kanban)</label>
            <input
              type="text"
              value={localConfig.fieldsMap.groupingField}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                fieldsMap: { ...prev.fieldsMap, groupingField: e.target.value }
              }))}
              placeholder="Ex: area_coordenacao, cluster_valor"
              className="w-full p-2 text-sm font-normal rounded-md border focus:ring-2 focus:ring-[#8a2d46]"
            />
          </div>
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
