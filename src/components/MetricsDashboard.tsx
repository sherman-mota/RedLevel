import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Zap, 
  Layers, 
  HelpCircle,
  Filter,
  Info
} from 'lucide-react';
import { FlightLevel, Issue, RedmineConfig, FilterState } from '../types';
import { getMockMetrics } from '../mockData';

interface MetricsDashboardProps {
  issues: Issue[];
  filters: FilterState;
  config: RedmineConfig;
}

export default function MetricsDashboard({
  issues,
  filters,
  config
}: MetricsDashboardProps) {
  const [activeMetricTab, setActiveMetricTab] = useState<'leadtime' | 'throughput' | 'efficiency' | 'cfd'>('leadtime');

  // Retrieve raw metrics dataset
  const metricsData = useMemo(() => {
    return getMockMetrics();
  }, []);

  // Filter metrics according to selected teams or projects
  const filteredLeadTime = useMemo(() => {
    // If the user filtered by team or project, we mathematically simulate adjusting the distribution curves
    const modifier = (filters.team ? 0.75 : 1) * (filters.project ? 0.9 : 1);
    return metricsData.leadTimeDistribution.map(item => ({
      ...item,
      count: Math.max(1, Math.round(item.count * modifier))
    }));
  }, [metricsData, filters]);

  const filteredThroughput = useMemo(() => {
    const modifier = (filters.team ? 0.4 : 1) * (filters.project ? 0.6 : 1);
    return metricsData.throughput.map(item => ({
      ...item,
      l3: Math.max(0, Math.round(item.l3 * modifier + (Math.random() > 0.8 ? 1 : 0))),
      l2: Math.max(0, Math.round(item.l2 * modifier + (Math.random() > 0.7 ? 1 : 0))),
      l1: Math.max(1, Math.round(item.l1 * modifier))
    }));
  }, [metricsData, filters]);

  const filteredEfficiency = useMemo(() => {
    if (filters.team) {
      return metricsData.flowEfficiency.filter(item => item.team.toLowerCase() === filters.team.toLowerCase());
    }
    return metricsData.flowEfficiency;
  }, [metricsData, filters]);

  // Max LeadTime values to correctly compute relative SVG heights
  const maxLTCount = useMemo(() => {
    return Math.max(...filteredLeadTime.map(d => d.count), 1);
  }, [filteredLeadTime]);

  const maxTPValue = useMemo(() => {
    return Math.max(...filteredThroughput.map(d => d.l1 + d.l2 + d.l3), 1);
  }, [filteredThroughput]);

  return (
    <div className="space-y-6">
      
      {/* DASHBOARD HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8a2d46] text-white flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Métricas de Performance e Vazão</h2>
            <p className="text-xs text-slate-400">Análise estocástica de lead times, throughputs e eficácia do fluxo da organização</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveMetricTab('leadtime')}
            className={`flex items-center gap-1 py-1.5 px-3 rounded ${activeMetricTab === 'leadtime' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lead Time</span>
          </button>
          <button
            onClick={() => setActiveMetricTab('throughput')}
            className={`flex items-center gap-1 py-1.5 px-3 rounded ${activeMetricTab === 'throughput' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Throughput</span>
          </button>
          <button
            onClick={() => setActiveMetricTab('efficiency')}
            className={`flex items-center gap-1 py-1.5 px-3 rounded ${activeMetricTab === 'efficiency' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Flow Efficiency</span>
          </button>
          <button
            onClick={() => setActiveMetricTab('cfd')}
            className={`flex items-center gap-1 py-1.5 px-3 rounded ${activeMetricTab === 'cfd' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
            title="Cumulative Flow Diagram"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CFD Diagrama</span>
          </button>
        </div>
      </div>

      {/* METRIC GRAPH WRAPPER BOX */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[460px] flex flex-col justify-between">
        
        {/* --- Tab 1: LEAD TIME DISTRIBUTION (Bar Chart) --- */}
        {activeMetricTab === 'leadtime' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                  <Clock className="text-pink-600 w-5 h-5" /> Distribuição de Lead Time (SLA de Entregas)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Frequência em que as demandas completam seu ciclo, do To-Do ao Done (em dias).</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold p-2 text-xs rounded-lg flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500 inline-block" />
                <span>85% das demandas fechadas em menos de 28 dias</span>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="w-full">
              <svg viewBox="0 0 800 280" className="w-full h-64 overflow-visible">
                {/* Horizontal guide lines */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = 40 + i * 45;
                  const value = Math.round(maxLTCount - (i * (maxLTCount / 4)));
                  return (
                    <g key={i}>
                      <line x1="50" y1={y} x2="780" y2={y} stroke="#edf2f7" strokeWidth="1" strokeDasharray="3" />
                      <text x="35" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono font-medium">{value}</text>
                    </g>
                  );
                })}

                {/* Bars */}
                {filteredLeadTime.map((item, index) => {
                  const padding = 15;
                  const barWidth = 40;
                  const x = 70 + index * (barWidth + padding);
                  const barHeight = (item.count / maxLTCount) * 180;
                  const y = 220 - barHeight;

                  return (
                    <g key={item.time} className="group cursor-pointer">
                      {/* Interactive Bar Hover overlay */}
                      <rect 
                        x={x - 4} 
                        y="20" 
                        width={barWidth + 8} 
                        height="210" 
                        fill="transparent" 
                        className="hover:fill-slate-50/40" 
                      />

                      {/* Real bar */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        fill={index < 4 ? '#8a2d46' : index < 7 ? '#d24869' : '#f5abad'} 
                        rx="4" 
                        className="transition-all hover:stroke-indigo-600 hover:stroke-2"
                      />

                      {/* Text value above bar */}
                      <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="text-[10px] font-bold fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count} itens
                      </text>

                      {/* X Axis Label */}
                      <text x={x + barWidth / 2} y="240" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 font-mono">
                        {item.time}d
                      </text>
                    </g>
                  );
                })}

                {/* Base reference line */}
                <line x1="50" y1="220" x2="780" y2="220" stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-pink-600 flex-shrink-0" />
              <p className="text-[11px] text-slate-600 leading-normal">
                <b>Interpretação para Agilidade:</b> A maior concentração em torno de 15~20 dias indica excelente previsibilidade operacional. Cauda longa à direita (40d-70d) geralmente representa iniciativas L3 bloqueadas por dependências técnicas complexas.
              </p>
            </div>
          </div>
        )}

        {/* --- Tab 2: THROUGHPUT OVER TIME (Weekly Multi-Line Chart) --- */}
        {activeMetricTab === 'throughput' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                  <TrendingUp className="text-emerald-600 w-5 h-5" /> Taxa de Entrega (Throughput Semanal)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Total de entregas finalizadas por semana, segregado por níveis estratégicos.</p>
              </div>

              {/* Legend checkboxes */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-600 rounded-sm"></span> L3 Strategic</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-600 rounded-sm"></span> L2 Coordination</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-600 rounded-sm"></span> L1 Operational</span>
              </div>
            </div>

            {/* Custom SVG Line graph */}
            <div className="w-full">
              <svg viewBox="0 0 800 280" className="w-full h-64 overflow-visible">
                {/* Horizontal guidelines */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = 30 + i * 45;
                  const val = Math.round(maxTPValue - (i * (maxTPValue / 4)));
                  return (
                    <g key={i}>
                      <line x1="50" y1={y} x2="780" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x="35" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{val}</text>
                    </g>
                  );
                })}

                {/* Multiline computation */}
                {filteredThroughput.map((item, index) => {
                  // X points
                  const step = 95;
                  const x = 70 + index * step;

                  return (
                    <g key={item.week}>
                      {/* Vertical Weeks line */}
                      <line x1={x} y1="30" x2={x} y2="210" stroke="#f8fafc" />

                      {/* X Label */}
                      <text x={x} y="235" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 font-mono">
                        {item.week}
                      </text>

                      {/* Hover stats circle indicators */}
                      {/* L1 */}
                      <circle cx={x} cy={210 - (item.l1 / maxTPValue) * 160} r="4" fill="#10b981" />
                      {/* L2 */}
                      <circle cx={x} cy={210 - (item.l2 / maxTPValue) * 160} r="4" fill="#2563eb" />
                      {/* L3 */}
                      <circle cx={x} cy={210 - (item.l3 / maxTPValue) * 160} r="4" fill="#7c3aed" />
                    </g>
                  );
                })}

                {/* Connecting Path for L1 Operational */}
                <path
                  d={filteredThroughput.reduce((acc, curr, idx) => {
                    const x = 70 + idx * 95;
                    const y = 210 - (curr.l1 / maxTPValue) * 160;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Connecting Path for L2 Tactical */}
                <path
                  d={filteredThroughput.reduce((acc, curr, idx) => {
                    const x = 70 + idx * 95;
                    const y = 210 - (curr.l2 / maxTPValue) * 160;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />

                {/* Base reference line */}
                <line x1="50" y1="210" x2="780" y2="210" stroke="#cbd5e1" strokeWidth="2px" />
              </svg>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-[11px] text-slate-600 leading-normal">
                <b>Análise da Estabilidade de Vazão (Throughput):</b> A entrega operacional permanece estabilizada entre 8 e 16 histórias de usuário por semana. Picos de vazão indicam momentos de fechamento de bugs e liberação de releases sincronizadas no nível tático.
              </p>
            </div>
          </div>
        )}

        {/* --- Tab 3: FLOW EFFICIENCY (Gauge/Progress Indicator by Team) --- */}
        {activeMetricTab === 'efficiency' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <Zap className="text-amber-500 w-5 h-5 animate-pulse" /> Eficiência de Fluxo por Squad / Área
              </h3>
              <p className="text-xs text-slate-400 mt-1">Relação entre o tempo ativo de digitação/mão-na-massa versus o tempo parado (bloqueios, compliance, revisões).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {filteredEfficiency.map(item => {
                const total = item.active + item.waiting;
                const efficiencyPercent = Math.round((item.active / total) * 100);

                // Define colors based on efficiency (standards: >70% high efficiency)
                const colorHex = efficiencyPercent > 75 
                  ? 'text-emerald-600 border-emerald-200 bg-emerald-50/20' 
                  : efficiencyPercent > 50 
                  ? 'text-amber-600 border-amber-200 bg-amber-50/20' 
                  : 'text-red-600 border-red-200 bg-red-50/20';

                return (
                  <div key={item.team} className={`p-4 border rounded-xl flex flex-col items-center text-center space-y-4 ${colorHex}`}>
                    <h4 className="font-bold text-xs text-slate-700 truncate w-full">{item.team}</h4>
                    
                    {/* Ring Progress SVG */}
                    <div className="relative w-24 h-24">
                      {/* Background track circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * efficiencyPercent) / 100}
                        />
                      </svg>
                      {/* Percent text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-slate-800">{efficiencyPercent}%</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Ativo</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex flex-col gap-0.5">
                      <span>Execução: <b>{item.active}%</b></span>
                      <span>Em Espera: <b>{item.waiting}%</b></span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-amber-50/50 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-[11px] text-slate-600 leading-normal">
                <b>Gargalo de Coordenação Identificado:</b> O time de Checkout & Pay apresenta <b>45% de eficiência</b> (mais da metade do ciclo das demandas é perdido em fila de espera). Isso valida a dor descrita no nível L2 onde a iniciativa STR-02 de gateway regulatório está travada sob conformidade.
              </p>
            </div>
          </div>
        )}

        {/* --- Tab 4: CUMULATIVE FLOW DIAGRAM (CFD) --- */}
        {activeMetricTab === 'cfd' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
                <Layers className="text-pink-600 w-5 h-5" /> Diagrama de Fluxo Cumulativo (CFD)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Acompanhamento diário da quantidade acumulativa de cartões por raia do kanban para prever gargalos de fila e vazão.</p>
            </div>

            {/* Custom SVG stacked representing flow queues */}
            <div className="w-full">
              <svg viewBox="0 0 800 280" className="w-full h-64 overflow-visible">
                {/* Axes */}
                <line x1="50" y1="210" x2="780" y2="210" stroke="#cbd5e1" strokeWidth="2px" />
                <line x1="50" y1="20" x2="50" y2="210" stroke="#cbd5e1" strokeWidth="1px" />

                {metricsData.cumulativeFlow.map((item, index) => {
                  const step = 95;
                  const x = 70 + index * step;
                  const total = item.Backlog + item.ToDo + item.InProgress + item.Done;

                  return (
                    <g key={item.date}>
                      {/* Guide indicators */}
                      <circle cx={x} cy={210 - (item.Done / 1200) * 160} r="3" fill="#10b981" />
                      <circle cx={x} cy={210 - ((item.Done + item.InProgress) / 1200) * 160} r="3" fill="#3b82f6" />
                      
                      <text x={x} y="235" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 font-mono">
                        {item.date}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Area Boundaries for Done Status */}
                <path
                  d={metricsData.cumulativeFlow.reduce((acc, curr, idx) => {
                    const x = 70 + idx * 95;
                    const y = 210 - (curr.Done / 1200) * 160;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '') + ' L 735 210 L 70 210 Z'}
                  fill="#10b981"
                  fillOpacity="0.15"
                  stroke="#10b981"
                  strokeWidth="2"
                />

                {/* Draw Area Boundaries for In Progress Status */}
                <path
                  d={metricsData.cumulativeFlow.reduce((acc, curr, idx) => {
                    const x = 70 + idx * 95;
                    const y = 210 - ((curr.Done + curr.InProgress) / 1200) * 160;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '') + ' L 735 210 L 70 210 Z'}
                  fill="#3b82f6"
                  fillOpacity="0.1"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {/* Draw Area Boundaries for To Do Status */}
                <path
                  d={metricsData.cumulativeFlow.reduce((acc, curr, idx) => {
                    const x = 70 + idx * 95;
                    const y = 210 - ((curr.Done + curr.InProgress + curr.ToDo) / 1200) * 160;
                    return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '') + ' L 735 210 L 70 210 Z'}
                  fill="#fbbf24"
                  fillOpacity="0.05"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />

                {/* Stack markers */}
                <text x="350" y="200" className="text-[10px] font-bold fill-emerald-600">Área Concluída (Done)</text>
                <text x="420" y="100" className="text-[10px] font-bold fill-blue-600">Trabalho em Progresso (WIP)</text>
                <text x="300" y="40" className="text-[10px] font-bold fill-amber-600">Backlog de Ideias (L1-L2-L3 Queued)</text>
              </svg>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-pink-600 flex-shrink-0" />
              <p className="text-[11px] text-slate-600 leading-normal">
                <b>Análise Kanban Sistemática (CFD):</b> A inclinação da área verde (Done) aponta crescimento de vazão saudável. A espessura da faixa azul (WIP) mantendo-se constante assegura estabilidade operacional, indicando respeito ao Limite de Trabalho em Progresso.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
