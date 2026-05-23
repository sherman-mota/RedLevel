import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  GitMerge, 
  Satellite, 
  Plane, 
  Monitor, 
  ShieldAlert, 
  ArrowRight,
  Info,
  HelpCircle,
  TrendingDown,
  Search,
  Bell,
  ExternalLink,
  Link2,
  AlertTriangle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle
} from 'lucide-react';
import { FlightLevel, Issue, Dependency, RedmineConfig, FilterState } from '../types';

interface DependencyMapProps {
  issues: Issue[];
  filters: FilterState;
  config: RedmineConfig;
}

export default function DependencyMap({
  issues,
  filters: globalFilters,
  config
}: DependencyMapProps) {
  // Extract unique projects dynamically from issues
  const projectOptions = useMemo(() => {
    const list = new Set<string>();
    issues.forEach(i => {
      if (i.project) list.add(i.project);
    });
    return ['All Projects', ...Array.from(list)];
  }, [issues]);

  // Local active filters to match the design prototype
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Blocked' | 'Healthy'>('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');

  // Interactive state for showing details drawer of selected initiatives
  const [activeCard, setActiveCard] = useState<string | null>(null);

  // Zoom & Pan Interactive State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clickStartPos, setClickStartPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Filter issues based on active local filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // 1. Project filter
      if (selectedProject !== 'All Projects' && issue.project !== selectedProject) {
        return false;
      }
      // 2. Status filter
      if (selectedStatus === 'Blocked' && !issue.blocked) return false;
      if (selectedStatus === 'Healthy' && issue.blocked) return false;
      
      // 3. Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = issue.subject.toLowerCase().includes(q);
        const matchesId = issue.id.toLowerCase().includes(q);
        const matchesAssignee = issue.assignee?.toLowerCase().includes(q) || false;
        if (!matchesSubject && !matchesId && !matchesAssignee) return false;
      }
      
      return true;
    });
  }, [issues, selectedProject, selectedStatus, searchQuery]);

  // Group filtered issues by flight levels
  const l3List = useMemo(() => {
    return filteredIssues.filter(i => i.level === FlightLevel.L3 && (selectedLevel === 'All Levels' || selectedLevel === 'L3 Strategic'));
  }, [filteredIssues, selectedLevel]);

  const l2List = useMemo(() => {
    return filteredIssues.filter(i => i.level === FlightLevel.L2 && (selectedLevel === 'All Levels' || selectedLevel === 'L2 Coordination'));
  }, [filteredIssues, selectedLevel]);

  const l1List = useMemo(() => {
    return filteredIssues.filter(i => i.level === FlightLevel.L1 && (selectedLevel === 'All Levels' || selectedLevel === 'L1 Operational'));
  }, [filteredIssues, selectedLevel]);

  // Dynamic SVG Connections state
  const [connections, setConnections] = useState<{ fromId: string; toId: string; path: string; isBlocked: boolean }[]>([]);

  // Function to calculate SVG paths dynamically relative to canvas parent element
  const updatePaths = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rectCanvas = canvas.getBoundingClientRect();
    const newConnections: typeof connections = [];

    const getPoint = (elId: string, side: 'left' | 'right') => {
      const el = document.getElementById(elId);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      
      const x = (side === 'left' ? rect.left : rect.right) - rectCanvas.left;
      const y = (rect.top + rect.height / 2) - rectCanvas.top;
      
      return {
        x: (x - pan.x) / zoom,
        y: (y - pan.y) / zoom
      };
    };

    // L2 -> L3 connections
    l2List.forEach(l2 => {
      if (!l2.parentId) return;
      const l3 = l3List.find(item => item.id === l2.parentId);
      if (!l3) return;

      const pFrom = getPoint(`card-${l2.id}`, 'left');
      const pTo = getPoint(`card-${l3.id}`, 'right');

      if (pFrom && pTo) {
        const dx = pFrom.x - pTo.x;
        const cp1x = pTo.x + dx / 2;
        const cp1y = pTo.y;
        const cp2x = pTo.x + dx / 2;
        const cp2y = pFrom.y;
        const path = `M ${pTo.x} ${pTo.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pFrom.x} ${pFrom.y}`;

        newConnections.push({
          fromId: l2.id,
          toId: l3.id,
          path,
          isBlocked: l2.blocked || l3.blocked
        });
      }
    });

    // L1 -> L2 connections
    l1List.forEach(l1 => {
      if (!l1.parentId) return;
      const l2 = l2List.find(item => item.id === l1.parentId);
      if (!l2) return;

      const pFrom = getPoint(`card-${l1.id}`, 'left');
      const pTo = getPoint(`card-${l2.id}`, 'right');

      if (pFrom && pTo) {
        const dx = pFrom.x - pTo.x;
        const cp1x = pTo.x + dx / 2;
        const cp1y = pTo.y;
        const cp2x = pTo.x + dx / 2;
        const cp2y = pFrom.y;
        const path = `M ${pTo.x} ${pTo.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pFrom.x} ${pFrom.y}`;

        newConnections.push({
          fromId: l1.id,
          toId: l2.id,
          path,
          isBlocked: l1.blocked || l2.blocked
        });
      }
    });

    setConnections(newConnections);
  };

  // Wheel zoom with native listener for passive: false compatibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      
      const zoomFactor = 0.08;
      const direction = e.deltaY < 0 ? 1 : -1;
      
      setZoom(prevZoom => {
        const newZoom = Math.min(Math.max(prevZoom + direction * zoomFactor, 0.4), 2.5);
        
        setPan(prevPan => {
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          const newPanX = mouseX - (mouseX - prevPan.x) * (newZoom / prevZoom);
          const newPanY = mouseY - (mouseY - prevPan.y) * (newZoom / prevZoom);
          
          return { x: newPanX, y: newPanY };
        });
        
        return newZoom;
      });
    };

    canvas.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  // Update dynamic connection paths when data, zoom or pan changes
  useEffect(() => {
    updatePaths();
    window.addEventListener('resize', updatePaths);
    const timer = setTimeout(updatePaths, 100);
    return () => {
      window.removeEventListener('resize', updatePaths);
      clearTimeout(timer);
    };
  }, [l3List, l2List, l1List, zoom, pan]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('select') || 
      target.closest('input') || 
      target.closest('a')
    ) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setClickStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setPan({ x: dx, y: dy });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setZoom(prevZoom => {
      const newZoom = Math.min(prevZoom + 0.15, 2.5);
      setPan(prevPan => {
        const canvas = canvasRef.current;
        if (!canvas) return prevPan;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const newPanX = centerX - (centerX - prevPan.x) * (newZoom / prevZoom);
        const newPanY = centerY - (centerY - prevPan.y) * (newZoom / prevZoom);
        
        return { x: newPanX, y: newPanY };
      });
      return newZoom;
    });
  };

  const zoomOut = () => {
    setZoom(prevZoom => {
      const newZoom = Math.max(prevZoom - 0.15, 0.4);
      setPan(prevPan => {
        const canvas = canvasRef.current;
        if (!canvas) return prevPan;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const newPanX = centerX - (centerX - prevPan.x) * (newZoom / prevZoom);
        const newPanY = centerY - (centerY - prevPan.y) * (newZoom / prevZoom);
        
        return { x: newPanX, y: newPanY };
      });
      return newZoom;
    });
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCardClick = (cardId: string, e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - clickStartPos.x);
    const dy = Math.abs(e.clientY - clickStartPos.y);
    if (dx > 5 || dy > 5) {
      return;
    }
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  const selectedIssueData = useMemo(() => {
    return issues.find(i => i.id === activeCard);
  }, [issues, activeCard]);

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. TOP HEADER & SEARCH MOCKUP */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Redmine Sync</h1>
        </div>
        
        {/* Search input in the middle */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dependencies..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#8a2d46] focus:outline-none transition-all placeholder:text-slate-400 font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right side icons & user avatar profile */}
        <div className="flex items-center gap-4">
          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors relative" title="Notificações">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors" title="Ajuda">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" 
              alt="User profile" 
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* 2. FILTER CARD BOX (PROJECT, STATUS, FLIGHT LEVEL) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Project parameter */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8a2d46]"
            >
              {projectOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status buttons */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Status</label>
            <div className="flex items-center gap-1.5">
              {(['All', 'Blocked', 'Healthy'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border ${
                    selectedStatus === st
                      ? 'bg-[#8a2d46] text-white border-[#8a2d46] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'All' ? 'All' : st === 'Blocked' ? 'Blocked' : 'Healthy'}
                </button>
              ))}
            </div>
          </div>

          {/* Flight level selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Flight Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8a2d46]"
            >
              <option value="All Levels">All Levels</option>
              <option value="L3 Strategic">L3 Strategic</option>
              <option value="L2 Coordination">L2 Coordination</option>
              <option value="L1 Operational">L1 Operational</option>
            </select>
          </div>

        </div>

        {/* Legend strip below filters */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>L3 Strategic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8a2d46]" />
            <span>L2 Coordination</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>L1 Operational</span>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 bg-slate-300 inline-block" />
            <span>Direct Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 border-t border-dashed border-red-500 inline-block animate-pulse" />
            <span>Blocked Flow (Gargalo)</span>
          </div>
        </div>

      </div>      {/* 3. DIAGRAM CANVAS AREA */}
      <div 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`p-6 bg-[#f8fafc] border border-slate-200 rounded-2xl min-h-[550px] flex flex-col justify-start relative overflow-hidden select-none transition-shadow duration-300 ${
          isDragging ? 'cursor-grabbing shadow-inner' : 'cursor-grab hover:shadow-sm'
        }`}
      >
        {/* Floating Zoom Controls HUD */}
        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1.5 shadow-lg select-none">
          <button
            onClick={zoomOut}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-[11px] font-bold text-slate-700 min-w-[36px] text-center px-1">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-slate-200 mx-1" />
          
          <button
            onClick={resetZoom}
            className="p-1.5 text-slate-500 hover:text-[#8a2d46] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            title="Resetar Visualização"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-[10px] font-semibold pr-0.5">Reset</span>
          </button>
        </div>

        {/* Pan/Zoom Transform Content Wrapper */}
        <div 
          id="transform-wrapper"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
          className="w-full h-full flex flex-col justify-center relative pointer-events-auto origin-top-left"
        >
          {/* SVG Connections Overlay */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ minWidth: '100%', minHeight: '100%' }}
          >
            {connections.map((conn, index) => (
              <path
                key={index}
                d={conn.path}
                stroke={conn.isBlocked ? '#dc2626' : '#94a3b8'}
                strokeWidth={conn.isBlocked ? '3' : '2'}
                strokeDasharray={conn.isBlocked ? '4 4' : 'none'}
                fill="none"
                className={conn.isBlocked ? 'animate-pulse' : ''}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
            ))}
          </svg>

          {/* Connection columns container */}
          <div className="flex flex-row justify-between gap-16 relative z-10 w-full px-4 py-8">
            
            {/* COLUMN L3 - STRATEGIC */}
            <div className="flex-1 flex flex-col gap-4 max-w-xs md:max-w-sm">
              <div className="px-3 py-1.5 bg-purple-100/60 rounded-lg text-purple-800 text-[11px] font-bold tracking-wider uppercase flex items-center justify-between border border-purple-200/40">
                <span>STRATEGIC L3</span>
                <span className="bg-purple-100 text-purple-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {l3List.length} ATIVOS
                </span>
              </div>
              
              {l3List.map(issue => (
                <div
                  key={issue.id}
                  id={`card-${issue.id}`}
                  onClick={(e) => handleCardClick(issue.id, e)}
                  className={`p-3 bg-white rounded-xl border transition-all cursor-pointer relative ${
                    issue.blocked 
                      ? 'border-red-300 shadow-sm shadow-red-50/50 bg-red-50/5' 
                      : activeCard === issue.id 
                        ? 'border-[#8a2d46] ring-1 ring-[#8a2d46]/20 shadow-md' 
                        : 'border-slate-100 shadow-xs hover:border-slate-250 hover:shadow-sm'
                  }`}
                >
                  <div className={`absolute top-2 bottom-2 left-0 w-0.75 rounded-r ${
                    issue.blocked 
                      ? 'bg-red-500' 
                      : 'bg-purple-500'
                  }`} />
                  
                  <div className="pl-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                        {issue.id}
                      </span>
                      {issue.blocked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Bloqueado" />
                      )}
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-xs tracking-tight leading-snug">
                      {issue.subject}
                    </h3>
                  </div>
                </div>
              ))}
              
              {l3List.length === 0 && (
                <div className="py-12 border border-dashed border-slate-250 text-center text-xs text-slate-400 italic rounded-xl bg-white/40">
                  Nenhuma iniciativa L3
                </div>
              )}
            </div>

            {/* COLUMN L2 - COORDINATION */}
            <div className="flex-1 flex flex-col gap-4 max-w-xs md:max-w-sm">
              <div className="px-3 py-1.5 bg-[#8a2d46]/10 rounded-lg text-[#8a2d46] text-[11px] font-bold tracking-wider uppercase flex items-center justify-between border border-[#8a2d46]/20">
                <span>COORDINATION L2</span>
                <span className="bg-[#8a2d46] text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {l2List.length} ATIVOS
                </span>
              </div>
              
              {l2List.map(issue => (
                <div
                  key={issue.id}
                  id={`card-${issue.id}`}
                  onClick={(e) => handleCardClick(issue.id, e)}
                  className={`p-3 bg-white rounded-xl border transition-all cursor-pointer relative ${
                    issue.blocked 
                      ? 'border-red-300 shadow-sm shadow-red-50/50 bg-red-50/5' 
                      : activeCard === issue.id 
                        ? 'border-[#8a2d46] ring-1 ring-[#8a2d46]/20 shadow-md' 
                        : 'border-slate-100 shadow-xs hover:border-slate-250 hover:shadow-sm'
                  }`}
                >
                  <div className={`absolute top-2 bottom-2 left-0 w-0.75 rounded-r ${
                    issue.blocked 
                      ? 'bg-red-500' 
                      : 'bg-[#8a2d46]'
                  }`} />
                  
                  <div className="pl-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                          {issue.id}
                        </span>
                        {issue.parentId && (
                          <span className="text-[8px] font-semibold text-slate-350 flex items-center gap-0.5">
                            <Link2 className="w-2.5 h-2.5" /> {issue.parentId}
                          </span>
                        )}
                      </div>
                      {issue.blocked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Bloqueado" />
                      )}
                    </div>
                    
                    <h4 className="font-bold text-slate-800 text-xs tracking-tight leading-snug">
                      {issue.subject}
                    </h4>
                  </div>
                </div>
              ))}
              
              {l2List.length === 0 && (
                <div className="py-12 border border-dashed border-slate-250 text-center text-xs text-slate-400 italic rounded-xl bg-white/40">
                  Nenhuma iniciativa L2
                </div>
              )}
            </div>

            {/* COLUMN L1 - OPERATIONAL */}
            <div className="flex-1 flex flex-col gap-4 max-w-xs md:max-w-sm">
              <div className="px-3 py-1.5 bg-emerald-100/60 rounded-lg text-emerald-800 text-[11px] font-bold tracking-wider uppercase flex items-center justify-between border border-emerald-250/40">
                <span>OPERATIONAL L1</span>
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                  {l1List.length} ATIVOS
                </span>
              </div>
              
              {l1List.map(issue => (
                <div
                  key={issue.id}
                  id={`card-${issue.id}`}
                  onClick={(e) => handleCardClick(issue.id, e)}
                  className={`p-3 bg-white rounded-xl border transition-all cursor-pointer relative ${
                    issue.blocked 
                      ? 'border-red-300 shadow-sm shadow-red-50/50 bg-red-50/5' 
                      : activeCard === issue.id 
                        ? 'border-[#8a2d46] ring-1 ring-[#8a2d46]/20 shadow-md' 
                        : 'border-slate-100 shadow-xs hover:border-slate-250 hover:shadow-sm'
                  }`}
                >
                  <div className={`absolute top-2 bottom-2 left-0 w-0.75 rounded-r ${
                    issue.blocked 
                      ? 'bg-red-500' 
                      : 'bg-emerald-500'
                  }`} />
                  
                  <div className="pl-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                          {issue.id}
                        </span>
                        {issue.parentId && (
                          <span className="text-[8px] font-semibold text-slate-350 flex items-center gap-0.5">
                            <Link2 className="w-2.5 h-2.5" /> {issue.parentId}
                          </span>
                        )}
                      </div>
                      {issue.blocked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Bloqueado" />
                      )}
                    </div>
                    
                    <h4 className="font-medium text-slate-700 text-xs tracking-tight leading-snug">
                      {issue.subject}
                    </h4>
                  </div>
                </div>
              ))}
              
              {l1List.length === 0 && (
                <div className="py-12 border border-dashed border-slate-250 text-center text-xs text-slate-400 italic rounded-xl bg-white/40">
                  Nenhuma tarefa L1
                </div>
              )}
            </div>

          </div> </div>

        </div>

      {/* 4. SELECTION DETAILS PANEL IN BASE ACCORDING TO USER INTERACTIONS */}
      {activeCard && selectedIssueData && (
        <div className="p-5 bg-[#fffcfc] text-slate-800 rounded-xl border border-[#8a2d46]/30 shadow-md space-y-4 animate-fade-in relative z-20 text-left">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#8a2d46]">
                Inspeção Detalhada: Flight Level {selectedIssueData.level}
              </p>
              <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                <span className="font-mono bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {selectedIssueData.id}
                </span>
                <span>{selectedIssueData.subject}</span>
              </h3>
            </div>
            <button 
              onClick={() => setActiveCard(null)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="space-y-2">
              <p className="font-bold text-slate-500">Mapeamento de Dependências Relacionadas</p>
              <ul className="space-y-2 text-[11px] text-slate-600">
                <li className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <b>Projeto:</b> <span className="font-semibold text-[#8a2d46]">{selectedIssueData.project}</span>
                </li>
                {selectedIssueData.parentId && (
                  <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>
                      <b>Vínculo de Parentesco:</b> Pertence à demanda-pai <b className="font-mono text-indigo-650">{selectedIssueData.parentId}</b>
                    </span>
                  </li>
                )}
                {/* Find children */}
                {(() => {
                  const children = issues.filter(i => i.parentId === selectedIssueData.id);
                  if (children.length > 0) {
                    return (
                      <li className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                        <span className="font-bold block text-slate-600">Demandas Vinculadas ({children.length}):</span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {children.map(child => (
                            <span 
                              key={child.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                child.blocked 
                                  ? 'bg-red-50 text-red-700 border border-red-200' 
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              }`}
                            >
                              {child.id}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  }
                  return null;
                })()}
              </ul>
            </div>

            <div className="space-y-2 text-[11px] text-slate-650 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-700 mb-1">Status de Resolução de Risco</p>
              {selectedIssueData.blocked ? (
                <div className="space-y-1.5">
                  <p className="text-red-700 font-extrabold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-650" />
                    🚨 Gargalo Crítico Detectado (Bloqueado)
                  </p>
                  <p className="bg-red-50/50 p-2 rounded text-red-950 border border-red-100 italic">
                    "{selectedIssueData.blockedReason || 'Impedimento sem descrição específica.'}"
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ✓ Fluxo de Entrega Estável e Saudável
                  </p>
                  <p className="text-slate-500">
                    Esta iniciativa está ativa e reportando progresso sem impedimentos de terceiros.
                  </p>
                </div>
              )}
              
              <div className="pt-2 mt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block">Responsável</span>
                  <span className="font-bold text-slate-700">{selectedIssueData.assignee || 'Não atribuído'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Esforço (Pontos)</span>
                  <span className="font-bold text-slate-700">{selectedIssueData.points || 'N/A'} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
