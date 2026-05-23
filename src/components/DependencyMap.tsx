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
  Maximize2
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
  // Local active filters to match the top bar in the design prototype
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('Global Expansion 2024');
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

  // Hardcode the target path metrics for high fidelity with the mockup prototype
  const isL3MatchesFilters = useMemo(() => {
    if (searchQuery && !'Global Market Expansion'.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedLevel !== 'All Levels' && selectedLevel !== 'L3 Strategic') return false;
    if (selectedStatus === 'Blocked') return false; // L3 is healthy
    return true;
  }, [searchQuery, selectedStatus, selectedLevel]);

  const isL2UpperMatchesFilters = useMemo(() => {
    if (searchQuery && !'Cloud Infra Migration'.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedLevel !== 'All Levels' && selectedLevel !== 'L2 Coordination') return false;
    if (selectedStatus === 'Blocked') return false; // L2 Upper is healthy
    return true;
  }, [searchQuery, selectedStatus, selectedLevel]);

  const isL2LowerMatchesFilters = useMemo(() => {
    if (searchQuery && !'Data Compliance Hub'.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedLevel !== 'All Levels' && selectedLevel !== 'L2 Coordination') return false;
    if (selectedStatus === 'Healthy') return false; // L2 Lower is blocked
    return true;
  }, [searchQuery, selectedStatus, selectedLevel]);

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
              <option value="Global Expansion 2024">Global Expansion 2024</option>
              <option value="Infrastructure Migration">Infrastructure Migration</option>
              <option value="Growth Initiatives">Growth Initiatives</option>
              <option value="Core Billing Engine">Core Billing Engine</option>
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
            <span className="w-5 h-0.5 bg-slate-350 inline-block" />
            <span>Direct Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 border-t border-dashed border-slate-350 inline-block" />
            <span>Cross-Team Path</span>
          </div>
        </div>

      </div>

      {/* 3. DIAGRAM CANVAS AREA */}
      <div 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`p-6 bg-[#f8fafc] border border-slate-200 rounded-2xl min-h-[520px] flex flex-col justify-start relative overflow-hidden select-none transition-shadow duration-300 ${
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
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
          className="w-full h-full flex flex-col justify-center relative pointer-events-auto origin-top-left"
        >
          {/* Connection system paths container */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_120px_1fr_100px] items-center gap-2 relative z-10">
            
            {/* COLUMN L3 */}
            <div className="space-y-4 flex flex-col justify-center h-full">
              <div className="px-3 py-1 bg-purple-100/50 rounded-lg text-purple-800 text-[11px] font-bold tracking-wider uppercase flex items-center justify-between border border-purple-200/40">
                <span>STRATEGIC L3</span>
                <span className="bg-purple-100 text-purple-900 text-[10px] px-1.5 py-0.2 rounded font-bold">1 ACTIVE</span>
              </div>

              {isL3MatchesFilters ? (
                <div 
                  onClick={(e) => handleCardClick('l3', e)}
                  className={`p-4 bg-white rounded-xl border transition-all cursor-pointer relative shadow-sm hover:translate-y-[-1px] hover:shadow-md ${
                    activeCard === 'l3' ? 'border-[#8a2d46] ring-2 ring-[#8a2d46]/10' : 'border-slate-200'
                  }`}
                >
                  {/* Purple vertical accent bar inside the card */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.2 bg-purple-600 rounded-l-xl" />
                  
                  <div className="pl-2 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-[#8a2d46] text-sm tracking-tight leading-snug">
                        Global Market Expansion
                      </h3>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Abrir no Redmine">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Representative Person Info Block */}
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" 
                        alt="Sarah Jenkins" 
                        className="w-6 h-6 rounded-full border border-slate-100 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px] font-semibold text-slate-500">Sarah Jenkins (CEO)</span>
                    </div>

                    {/* Summary Metric Footer Line */}
                    <div className="pt-2 border-t border-slate-100/70 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Linked L2 Projects</span>
                      <span className="font-bold text-[#8a2d46]">2 Projects</span>
                    </div>
                  </div>

                  {/* Solid bottom accent highlight */}
                  <div className="absolute bottom-0 left-1.2 right-0 h-1.2 bg-purple-500 rounded-b-xl opacity-80" />
                </div>
              ) : (
                <div className="py-12 border border-dashed border-slate-200 text-center text-xs text-slate-400 italic rounded-xl bg-white/40">
                  Ocultado por filtros
                </div>
              )}
            </div>

            {/* CONNECTOR PATHS AREA (SVG GRID OVERLAY) */}
            <div className="hidden lg:block relative h-full w-full select-none">
              {/* SVG paths rendering dependencies lines dynamically */}
              {isL3MatchesFilters && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 400" preserveAspectRatio="none">
                  {/* Curve to L2 upper */}
                  {isL2UpperMatchesFilters && (
                    <path 
                      d="M 0 200 C 60 200, 60 100, 120 100" 
                      stroke="#cbd5e1" 
                      strokeWidth="2.5" 
                      fill="none" 
                      className="transition-all"
                    />
                  )}
                  {/* Curve to L2 lower */}
                  {isL2LowerMatchesFilters && (
                    <path 
                      d="M 0 200 C 60 200, 60 300, 120 300" 
                      stroke="#cbd5e1" 
                      strokeWidth="2.5" 
                      fill="none" 
                      className="transition-all"
                    />
                  )}
                </svg>
              )}
            </div>

            {/* COLUMN L2 */}
            <div className="space-y-6 flex flex-col justify-around h-full">
              <div className="px-3 py-1 bg-[#8a2d46]/10 rounded-lg text-[#8a2d46] text-[11px] font-bold tracking-wider uppercase flex items-center justify-between border border-[#8a2d46]/20">
                <span>COORDINATION L2</span>
                <span className="bg-[#8a2d46] text-white text-[10px] px-1.5 py-0.2 rounded font-bold">2 ACTIVE</span>
              </div>

              <div className="space-y-4">
                
                {/* L2 UPPER CARD: HEALTHY */}
                {isL2UpperMatchesFilters ? (
                  <div 
                    onClick={(e) => handleCardClick('l2_upper', e)}
                    className={`p-4 bg-white rounded-xl border transition-all cursor-pointer relative shadow-sm hover:translate-y-[-1px] hover:shadow-md ${
                      activeCard === 'l2_upper' ? 'border-[#8a2d46] ring-2 ring-[#8a2d46]/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-1.2 bg-[#8a2d46] rounded-l-xl" />
                    
                    <div className="pl-2 space-y-3">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-extrabold text-slate-800 text-xs tracking-tight leading-snug">
                          Cloud Infra Migration
                        </h4>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Abrir no Redmine">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                        <Link2 className="w-3 h-3 text-[#8a2d46]" />
                        <span>L3: Global Market Expansion</span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Linked L1 Tasks</span>
                        <span className="font-bold text-slate-700">14 Tasks</span>
                      </div>

                      {/* Completion bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                        <div className="bg-[#8a2d46]/60 h-1 rounded-full w-[70%]" />
                      </div>
                    </div>
                  </div>
                ) : searchQuery && !'Cloud Infra Migration'.toLowerCase().includes(searchQuery.toLowerCase()) ? null : (
                  <div className="p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400 italic rounded-xl bg-white/40">
                    Ocultado por filtros
                  </div>
                )}

                {/* L2 LOWER CARD: BLOCKED */}
                {isL2LowerMatchesFilters ? (
                  <div 
                    onClick={(e) => handleCardClick('l2_lower', e)}
                    className={`p-4 bg-white rounded-xl border-2 transition-all cursor-pointer relative shadow-sm hover:translate-y-[-1px] hover:shadow-md ${
                      activeCard === 'l2_lower' ? 'border-red-600 ring-2 ring-red-100' : 'border-red-600'
                    }`}
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-1.2 bg-red-600 rounded-l-xl" />
                    
                    <div className="pl-2 space-y-3">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <h4 className="font-extrabold text-slate-800 text-xs tracking-tight leading-snug">
                            Data Compliance Hub
                          </h4>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Abrir no Redmine">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                        <Link2 className="w-3 h-3 text-[#8a2d46]" />
                        <span>L3: Global Market Expansion</span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between text-[11px]">
                        <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-extrabold font-sans">
                          BLOCKED BY L1
                        </span>
                        <span className="font-bold text-slate-700">3 Tasks</span>
                      </div>

                      {/* Red warning progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                        <div className="bg-red-500 h-1 rounded-full w-[45%]" />
                      </div>
                    </div>
                  </div>
                ) : searchQuery && !'Data Compliance Hub'.toLowerCase().includes(searchQuery.toLowerCase()) ? null : (
                  <div className="p-4 border border-dashed border-slate-200 text-center text-xs text-slate-400 italic rounded-xl bg-white/40">
                    Ocultado por filtros
                  </div>
                )}

              </div>
            </div>

            {/* SECOND CONNECTOR PATHS */}
            <div className="hidden lg:block relative h-full w-full select-none">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 400" preserveAspectRatio="none">
                {/* Healthy connection going further right */}
                {isL2UpperMatchesFilters && (
                  <path d="M 0 100 L 100 60" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                )}
                {isL2UpperMatchesFilters && (
                  <path d="M 0 100 L 100 120" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                )}
                {/* Blocked/red line from lower L2 going right */}
                {isL2LowerMatchesFilters && (
                  <path d="M 0 300 Q 50 280, 100 270" stroke="#dc2626" strokeWidth="2.5" fill="none" className="animate-pulse" />
                )}
              </svg>
            </div>

          </div>

        </div>

      </div>

      {/* 4. SELECTION DETAILS PANEL IN BASE ACCORDING TO USER INTERACTIONS */}
      {activeCard && (
        <div className="p-5 bg-[#fffcfc] text-slate-800 rounded-xl border border-[#8a2d46]/30 shadow-md space-y-4 animate-fade-in relative z-20">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#8a2d46]">Inspeção Detalhada de Rotas</p>
              <h3 className="text-sm font-bold text-slate-800">
                {activeCard === 'l3' && 'Global Market Expansion'}
                {activeCard === 'l2_upper' && 'Cloud Infra Migration'}
                {activeCard === 'l2_lower' && 'Data Compliance Hub'}
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
                {activeCard === 'l3' && (
                  <>
                    <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8a2d46]" />
                      <span><b>Origem:</b> Global Market Expansion ➡️ <b>Projeto Filho:</b> Cloud Infra Migration</span>
                    </li>
                    <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span><b>Origem:</b> Global Market Expansion ➡️ <b>Projeto Filho (Bloqueado):</b> Data Compliance Hub</span>
                    </li>
                  </>
                )}
                {activeCard === 'l2_upper' && (
                  <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span><b>Objetivo Geral (Pai):</b> Global Market Expansion (Conexão Direta Ativa)</span>
                  </li>
                )}
                {activeCard === 'l2_lower' && (
                  <>
                    <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded text-red-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      <span><b>Aviso de Gargalo:</b> Bloqueado por 3 tarefas operacionais de Segurança do Q2.</span>
                    </li>
                    <li className="flex items-center gap-1.5 bg-slate-50 p-2 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span><b>Objetivo Geral (Pai):</b> Global Market Expansion</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg">
              <p className="font-bold text-slate-700 mb-1">Status de Resolução de Risco</p>
              {activeCard === 'l2_lower' ? (
                <div className="space-y-1.5">
                  <p className="text-red-700 font-semibold">🚨 Risco Crítico de Atraso Detectado (SLA Q2 Excedido)</p>
                  <p>A iniciativa está retida aguardando as tarefas L1 em segurança de dados da equipe DevOps e do comitê corporativo de LGPD.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-emerald-700 font-semibold">✓ Fluxo de Entrega Estável e Saudável</p>
                  <p>Todos os projetos sincronizados e em andamento reportam dependências diretas integradas sem gargalos corporativos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
