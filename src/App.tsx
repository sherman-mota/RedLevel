import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { 
  Menu, 
  Filter as FilterIcon, 
  RefreshCw, 
  ArrowLeftRight, 
  HelpCircle, 
  Plus, 
  ShieldAlert, 
  CheckCircle, 
  Trash2, 
  Info,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  GitPullRequest
} from 'lucide-react';

import { FlightLevel, Issue, RedmineConfig, FilterState, KanbanStage } from './types';
import { loadConfig, saveConfig, fetchRedmineIssues } from './api/redmine';
import { getMockIssues } from './mockData';

// Component Imports
import Sidebar from './components/Sidebar';
import WorkspaceFilters from './components/WorkspaceFilters';

// Lazy-loaded Component Views
const Overview = lazy(() => import('./components/Overview'));
const KanbanBoard = lazy(() => import('./components/KanbanBoard'));
const DependencyMap = lazy(() => import('./components/DependencyMap'));
const MetricsDashboard = lazy(() => import('./components/MetricsDashboard'));
const Settings = lazy(() => import('./components/Settings'));

const ViewLoader = () => (
  <div className="w-full py-20 flex flex-col items-center justify-center space-y-3">
    <RefreshCw className="w-8 h-8 animate-spin text-[#8a2d46]" />
    <span className="text-xs font-bold text-[#8a2d46] animate-pulse">Carregando módulo de visualização...</span>
  </div>
);

const STAGE_OPTIONS: KanbanStage[] = ['Backlog', 'To Do', 'In Progress', 'Done'];

export default function App() {
  // --- STATE SYSTEM ---
  const [config, setConfig] = useState<RedmineConfig>(() => loadConfig());
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentTab, setTab] = useState<string>('overview');
  
  // Layout Controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Dialogs
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [newIssueLevel, setNewIssueLevel] = useState<FlightLevel>(FlightLevel.L3);

  // New Issue Form states
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    project: 'América Portfolio',
    assignee: 'Sarah Jenkins',
    points: 5,
    team: 'Platform Team',
    parentId: '',
    blocked: false,
    blockedReason: ''
  });

  // Global Filters
  const [filters, setFilters] = useState<FilterState>({
    project: '',
    team: '',
    status: '',
    blockedOnly: false,
    search: '',
    selectedGroupFieldVal: ''
  });

  // --- DATA BOOTSTRAPPER ---
  const loadData = async (currentConfig: RedmineConfig) => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const data = await fetchRedmineIssues(currentConfig);
      setIssues(data);
      if (!currentConfig.useDemoWorkspace) {
        setStatusMessage({
          type: 'success',
          text: `Sincronizado! Carregadas ${data.length} demandas diretamente do servidor Redmine.`
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao sincronizar. Ativando Modo Simulador Offline para evitar travamento.'
      });
      // Silent fallback so user can still test the interface
      setIssues(getMockIssues());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(config);
  }, [config]);

  // Handle saving modified configuration from settings panel
  const handleSaveConfig = (newConfig: RedmineConfig) => {
    saveConfig(newConfig);
    setConfig(newConfig);
  };

  // --- SIMULATION MUTATORS (INTERACTIVE KANBAN MOVEMENT) ---
  const handleUpdateIssue = (updatedIssue: Issue) => {
    setIssues(prev => prev.map(i => i.id === updatedIssue.id ? updatedIssue : i));
  };

  // Add issue dynamically inside simulation state
  const handleCreateIssue = () => {
    if (!formData.subject.trim()) {
      alert('Por favor, digite o título da demanda.');
      return;
    }

    const randomId = `${newIssueLevel === FlightLevel.L3 ? 'STR' : newIssueLevel === FlightLevel.L2 ? 'PRJ' : 'TSK'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIssueCard: Issue = {
      id: randomId,
      subject: formData.subject,
      description: formData.description,
      status: 'To Do',
      redmineStatus: 'Nova',
      project: formData.project,
      tracker: newIssueLevel === FlightLevel.L3 ? config.trackers.l3[0] : newIssueLevel === FlightLevel.L2 ? config.trackers.l2[0] : config.trackers.l1[0],
      assignee: formData.assignee,
      assigneeAvatar: formData.assignee.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      level: newIssueLevel,
      parentId: formData.parentId ? formData.parentId : undefined,
      blocked: formData.blocked,
      blockedReason: formData.blocked ? (formData.blockedReason || 'Aguarda validação interna de recursos.') : undefined,
      creationDate: new Date().toISOString().split('T')[0],
      age: 1,
      points: Number(formData.points),
      team: formData.team,
      customFields: {}
    };

    setIssues(prev => [newIssueCard, ...prev]);
    setIsNewIssueModalOpen(false);
    
    // Toast Alert feedback
    setStatusMessage({
      type: 'success',
      text: `Excelente! ${newIssueLevel} adicionada com código de voo: ${randomId}`
    });

    // Reset Form
    setFormData({
      subject: '',
      description: '',
      project: 'Infrastructure Migration',
      assignee: 'Sarah Jenkins',
      points: 5,
      team: 'Platform Team',
      parentId: '',
      blocked: false,
      blockedReason: ''
    });
  };

  // --- EXTRACT METADATA FOR UNIQUE FILTER OPTION VALUES ---
  const uniqueProjects = useMemo(() => {
    const list = new Set<string>();
    issues.forEach(i => {
      if (i.project) list.add(i.project);
    });
    return Array.from(list);
  }, [issues]);

  const uniqueTeams = useMemo(() => {
    const list = new Set<string>();
    issues.forEach(i => {
      if (i.team) list.add(i.team);
    });
    return Array.from(list);
  }, [issues]);

  // --- THEME BACKGROUND ASSIGNERS ---
  const getAppStyleWrapper = () => {
    switch (config.activeTheme) {
      case 'contrast':
        return 'bg-[#fffcfc] text-slate-900 border-2 border-[#8a2d46] min-h-screen';
      case 'classic':
        return 'bg-[#fcf8f9] text-slate-900 theme-classic min-h-screen';
      case 'modern':
      default:
        return 'bg-[#fafbfc] text-slate-800 min-h-screen';
    }
  };

  const getNavBarStyle = () => {
    if (config.activeTheme === 'classic') {
      return 'bg-white border-b border-[#8a2d46]/10 px-6 py-4';
    }
    if (config.activeTheme === 'contrast') {
      return 'bg-white border-b-2 border-[#8a2d46] px-6 py-4';
    }
    return 'bg-white border-b border-slate-100 px-6 py-4 shadow-xs';
  };

  const handleOpenNewIssueModal = (level: FlightLevel) => {
    setNewIssueLevel(level);
    setIsNewIssueModalOpen(true);
  };

  return (
    <div className={`flex ${getAppStyleWrapper()} font-sans overflow-hidden antialiased`}>
      
      {/* SIDE NAVIGATION DRAWER BAR */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab} 
        config={config} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onNewInitiative={() => handleOpenNewIssueModal(FlightLevel.L3)}
      />

      {/* CORE FRAME CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TOP STATUS BAR */}
        <header className={`flex items-center justify-between ${getNavBarStyle()} z-10 flex-shrink-0`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-left">
              <h2 className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                {currentTab === 'overview' && 'Overview Geral de Fluxo'}
                {currentTab === 'l3' && 'Kanban Estratégico (L3)'}
                {currentTab === 'l2' && 'Kanban tático de Coordenação (L2)'}
                {currentTab === 'l1' && 'Kanban Operacional (L1)'}
                {currentTab === 'dependencies' && 'Mapa de Conexões'}
                {currentTab === 'metrics' && 'Performance & CFD'}
                {currentTab === 'settings' && 'Preferências do RedLevels'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Redmine Flight Levels • Klaus Leopold Value Stream Alignment
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS TOOL ACTIONS */}
          <div className="flex items-center gap-3">
            
            {/* Quick Sunc button */}
            <button
              onClick={() => loadData(config)}
              disabled={isRefreshing}
              className={`p-2 rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-50 transition-colors flex items-center justify-center`}
              title="Sincronizar dados agora"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-pink-600' : ''}`} />
            </button>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all relative ${
                filtersOpen 
                  ? 'bg-pink-50 border-pink-200 text-pink-700' 
                  : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
              }`}
              title="Filtros do Kanban"
            >
              <FilterIcon className="w-4 h-4 text-pink-600" />
              <span>Filtros Rápidos</span>
              {filtersOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-600 animate-ping" />
              )}
            </button>

            {/* Live status badge */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200/90">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500">{config.isConnected ? 'Redmine Conectado' : 'Conexão Offline (Cache)'}</span>
            </div>
          </div>
        </header>

        {/* NOTIFICATIONS BAR */}
        {statusMessage && (
          <div className={`p-3 text-xs flex items-center justify-between transition-all ${
            statusMessage.type === 'success' ? 'bg-emerald-50/90 border-b border-emerald-200 text-emerald-800' : 'bg-rose-50/90 border-b border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              <Info className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="font-semibold">{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="font-bold text-slate-400 hover:text-slate-600 px-1 text-[11px]">
              Ocultar
            </button>
          </div>
        )}

        {/* WORKSPACE CENTRAL WORKPAD SCREEN */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          
          <div className="max-w-7xl mx-auto h-full">
            <Suspense fallback={<ViewLoader />}>
              {currentTab === 'overview' && (
                <Overview 
                  issues={issues} 
                  filters={filters} 
                  config={config} 
                  onSelectIssue={setSelectedIssue}
                />
              )}

              {currentTab === 'l3' && (
                <KanbanBoard 
                  level={FlightLevel.L3} 
                  issues={issues} 
                  filters={filters} 
                  config={config}
                  onUpdateIssue={handleUpdateIssue}
                  onSelectIssue={setSelectedIssue}
                />
              )}

              {currentTab === 'l2' && (
                <KanbanBoard 
                  level={FlightLevel.L2} 
                  issues={issues} 
                  filters={filters} 
                  config={config}
                  onUpdateIssue={handleUpdateIssue}
                  onSelectIssue={setSelectedIssue}
                />
              )}

              {currentTab === 'l1' && (
                <KanbanBoard 
                  level={FlightLevel.L1} 
                  issues={issues} 
                  filters={filters} 
                  config={config}
                  onUpdateIssue={handleUpdateIssue}
                  onSelectIssue={setSelectedIssue}
                />
              )}

              {currentTab === 'dependencies' && (
                <DependencyMap 
                  issues={issues} 
                  filters={filters} 
                  config={config} 
                />
              )}

              {currentTab === 'metrics' && (
                <MetricsDashboard 
                  issues={issues} 
                  filters={filters} 
                  config={config} 
                />
              )}

              {currentTab === 'settings' && (
                <Settings 
                  config={config} 
                  onSaveConfig={handleSaveConfig} 
                />
              )}
            </Suspense>
          </div>

          {/* BACKGROUND LOADER OVERLAY */}
          {isRefreshing && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-xs">
              <div className="p-5 bg-white border border-[#8a2d46]/20 text-[#8a2d46] rounded-xl shadow-xl flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-pink-500" />
                <span className="font-bold text-xs">Aguardando Sincronização Redmine...</span>
              </div>
            </div>
          )}

        </main>

        {/* RIGHT DRAWER COLLAPSIBLE FILTERS BAR BAR */}
        <WorkspaceFilters
          filters={filters}
          onChange={(u) => setFilters(prev => ({ ...prev, ...u }))}
          projects={uniqueProjects}
          teams={uniqueTeams}
          config={config}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          onRefresh={() => loadData(config)}
          isRefreshing={isRefreshing}
        />

      </div>

      {/* --- DETAIL OVERLAY SIDE PANEL (CARD DRAWER DETAIL) --- */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          {/* Dismiss Click-away area */}
          <div className="flex-1" onClick={() => setSelectedIssue(null)} />
          
          <div className="w-full max-w-xl h-full bg-white shadow-2xl border-l relative flex flex-col justify-between text-left">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
                  {selectedIssue.level} Link
                </span>
                <span className="font-bold text-xs text-slate-400 font-mono">{selectedIssue.id}</span>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="p-1 px-3 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-xs font-bold"
              >
                Voltar
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-indigo-600 font-mono">{selectedIssue.project}</p>
                <h3 className="text-lg font-extrabold text-slate-800 leading-snug">{selectedIssue.subject}</h3>
              </div>

              {/* Status & Attributes Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl border border-dashed bg-slate-50/50 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium mb-1">Status do Voo</span>
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => {
                      const newStg = e.target.value as KanbanStage;
                      handleUpdateIssue({
                        ...selectedIssue,
                        status: newStg,
                        redmineStatus: newStg === 'Done' ? 'Fechada' : newStg === 'In Progress' ? 'Em Desenvolvimento' : 'Nova'
                      });
                      setSelectedIssue(prev => prev ? { ...prev, status: newStg } : null);
                    }}
                    className="p-1.5 border rounded bg-white text-slate-800 font-bold"
                  >
                    {STAGE_OPTIONS.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-1">Dono Principal</span>
                  <span className="font-bold text-slate-700 block mt-1.5">{selectedIssue.assignee || 'Unassigned'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-1">Impacto / Horas</span>
                  <span className="font-bold text-slate-700 block mt-1.5">{selectedIssue.points ? `${selectedIssue.points} pts` : 'Não Configurado'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-1">Squad Responsável</span>
                  <span className="font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded block text-center mt-1 w-max">
                    {selectedIssue.team || 'Todas'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-1">Nível de Voo</span>
                  <span className="font-semibold block mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-205 rounded w-max text-[11px]">
                    Flight Level {selectedIssue.level}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium mb-1">Ativo Há (WIP Age)</span>
                  <span className="font-extrabold text-slate-800 mt-1 block font-mono">
                    {selectedIssue.age} dias no ar
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest block">Detalhes da Demanda</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border">
                  {selectedIssue.description || 'Sem descrição cadastrada neste cartão do Redmine.'}
                </p>
              </div>

              {/* Linking parent strategically */}
              <div className="space-y-2 text-xs pt-1">
                <span className="font-bold text-slate-400 uppercase tracking-widest block">Trilhas de Parentesco</span>
                <div className="p-3 border rounded-lg bg-indigo-50/20 text-indigo-950 space-y-1">
                  <p>Código Pai: <b className="font-bold text-indigo-700">{selectedIssue.parentId || 'Sem nível superior vinculado'}</b></p>
                  <p className="text-slate-400 text-[11px]">No modelo Flight Levels, cada L2 pertence a L3 anual correspondente. De igual modo, itens operacionais L1 nascem para realizar fatias de L2.</p>
                </div>
              </div>

              {/* Blocked state edit button */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-400 uppercase tracking-widest block">Gargalos e Impedimentos</span>
                
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIssue.blocked}
                      onChange={(e) => {
                        const isBlock = e.target.checked;
                        handleUpdateIssue({
                          ...selectedIssue,
                          blocked: isBlock,
                          blockedReason: isBlock ? (selectedIssue.blockedReason || 'Impedimento de infraestrutura.') : undefined
                        });
                        setSelectedIssue(prev => prev ? { ...prev, blocked: isBlock, blockedReason: isBlock ? (prev.blockedReason || 'Impedimento') : undefined } : null);
                      }}
                      className="w-4.5 h-4.5 text-red-600 focus:ring-red-500 rounded border-slate-300"
                    />
                    <label className="text-xs font-bold text-red-700">Esta demanda está sob bloqueio/gargalo externo?</label>
                  </div>

                  {selectedIssue.blocked && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Especificar Causa do Impedimento</span>
                      <textarea
                        value={selectedIssue.blockedReason || ''}
                        onChange={(e) => {
                          const rsn = e.target.value;
                          handleUpdateIssue({ ...selectedIssue, blockedReason: rsn });
                          setSelectedIssue(prev => prev ? { ...prev, blockedReason: rsn } : null);
                        }}
                        className="w-full p-2 border border-red-300 rounded text-xs bg-white text-slate-800"
                        rows={3}
                        placeholder="Ex: Aguardando liberação do comitê corporativo de conformidade técnica..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom block footer */}
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedIssue(null)}
                className="py-2 px-6 rounded-lg bg-[#8a2d46] border border-[#8a2d46] text-white text-xs font-bold hover:bg-[#80253e]"
              >
                Confirmar e Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE NEW INITIATIVE DIALOG POPUP MODAL --- */}
      {isNewIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl border shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-pink-600 animate-pulse" />
                <h3 className="font-extrabold text-base text-slate-800">
                  Adicionar Item de Voo: Flight Level {newIssueLevel}
                </h3>
              </div>
              <button 
                onClick={() => setIsNewIssueModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                Ocultar
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-500 block">Título do Item / Demanda</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ex: Migração Estrutural de Logs AWS"
                  className="w-full p-2.5 font-normal border rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 block">Descrição Detalhada de Contexto</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-2.5 font-normal border rounded-lg"
                  placeholder="Descreva de forma macro a meta e o que se espera de entrega..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Dono Atribuído</label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full p-2 font-normal border rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 block">Esforço Estimado ({newIssueLevel === FlightLevel.L1 ? 'Horas' : 'Esforço'})</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: Number(e.target.value) }))}
                    className="w-full p-2 font-normal border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 block">Time Executor / Squad</label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full p-2 font-normal border rounded-lg"
                  >
                    <option value="Platform Team">Platform Team</option>
                    <option value="Checkout & Pay">Checkout & Pay</option>
                    <option value="DevOps & Sec">DevOps & Sec</option>
                    <option value="UI/UX Experience">UI/UX Experience</option>
                    <option value="Data Insights">Data Insights</option>
                  </select>
                </div>

                {newIssueLevel !== FlightLevel.L3 && (
                  <div className="space-y-1">
                    <label className="text-purple-800 font-bold block">Código do Item Pai ({newIssueLevel === FlightLevel.L2 ? 'L3' : 'L2'})</label>
                    <input
                      type="text"
                      value={formData.parentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                      placeholder={newIssueLevel === FlightLevel.L2 ? 'Ex: STR-01' : 'Ex: PRJ-101'}
                      className="w-full p-2 font-normal border border-purple-300 rounded-lg bg-purple-50/20"
                    />
                  </div>
                )}
              </div>

              {/* Blocker creation attributes */}
              <div className="p-3 bg-red-50 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.blocked}
                    onChange={(e) => setFormData(prev => ({ ...prev, blocked: e.target.checked }))}
                    className="w-4.5 h-4.5 rounded text-red-650"
                  />
                  <label className="text-red-700 font-bold">Nascer bloqueado? (Identificar gargalo preliminar)</label>
                </div>
                {formData.blocked && (
                  <input
                    type="text"
                    value={formData.blockedReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, blockedReason: e.target.value }))}
                    placeholder="Especifique a razão (e.g. Falta aprovação regulatória)"
                    className="w-full p-2 font-normal border border-red-300 rounded bg-white text-xs"
                  />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setIsNewIssueModalOpen(false)}
                className="py-2 px-4 rounded border font-bold text-slate-500 hover:bg-slate-50 text-xs"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateIssue}
                className="py-2 px-6 bg-[#8a2d46] hover:bg-[#80253e] text-white font-bold rounded text-xs shadow"
              >
                Criar Demanda de Voo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
