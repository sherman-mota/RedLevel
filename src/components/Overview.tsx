import React, { useState, useMemo } from 'react';
import {
  Satellite,
  Plane,
  Monitor,
  TrendingUp,
  Clock,
  Activity,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Hash,
  Eye,
  EyeOff,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FlightLevel, Issue, RedmineConfig, FilterState } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface OverviewProps {
  issues: Issue[];
  filters: FilterState;
  config: RedmineConfig;
  onSelectIssue?: (issue: Issue) => void;
}

export default function Overview({
  issues,
  filters,
  config,
  onSelectIssue
}: OverviewProps) {
  const { t } = useLanguage();
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({
    L3: false,
    L2: false,
    L1: false
  });
  const [highDensityMode, setHighDensityMode] = useState(true);

  const toggleLevel = (lvl: string) => {
    setCollapsedLevels(prev => ({ ...prev, [lvl]: !prev[lvl] }));
  };

  // 1. FILTERING ISSUES
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Filter by Search (ID or subject)
      if (filters.search) {
        const searchVal = filters.search.toLowerCase();
        const matchesSubject = issue.subject.toLowerCase().includes(searchVal);
        const matchesId = issue.id.toLowerCase().includes(searchVal);
        if (!matchesSubject && !matchesId) return false;
      }
      // Filter by Project
      if (filters.project && issue.project !== filters.project) {
        return false;
      }
      // Filter by Team/Area — team comes directly from issue.team (assigned_to)
      if (filters.team) {
        const issueTeamVal = issue.team || '';
        if (issueTeamVal.toLowerCase() !== filters.team.toLowerCase()) {
          return false;
        }
      }
      // Filter by Blocked Only
      if (filters.blockedOnly && !issue.blocked) {
        return false;
      }
      // Filter by Grouped Tactical Field (l2 groupingField)
      if (filters.selectedGroupFieldVal) {
        const groupVal = issue.customFields[config.fieldsMap.l2.groupingField] || '';
        if (!groupVal.toLowerCase().includes(filters.selectedGroupFieldVal.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [issues, filters, config]);

  // Seperate Levels
  const l3Issues = useMemo(() => filteredIssues.filter(i => i.level === FlightLevel.L3), [filteredIssues]);
  const l2Issues = useMemo(() => filteredIssues.filter(i => i.level === FlightLevel.L2), [filteredIssues]);
  const l1Issues = useMemo(() => filteredIssues.filter(i => i.level === FlightLevel.L1), [filteredIssues]);

  // Calculate mock extra tasks for High Density visual display
  const simulatedTotalL1Tasks = 1240; // Simulated big enterprise volume
  const simulatedL1Statuses = {
    Backlog: 420,
    ToDo: 380,
    InProgress: 290,
    Done: 150,
    Blocked: 85
  };

  // Calculate real aggregates
  const l3Stats = useMemo(() => {
    const total = l3Issues.length;
    const blocked = l3Issues.filter(i => i.blocked).length;
    const inProgress = l3Issues.filter(i => i.status === 'In Progress').length;
    const done = l3Issues.filter(i => i.status === 'Done').length;
    return { total, blocked, inProgress, done };
  }, [l3Issues]);

  const l2Stats = useMemo(() => {
    const total = l2Issues.length;
    const blocked = l2Issues.filter(i => i.blocked).length;
    const done = l2Issues.filter(i => i.status === 'Done').length;
    const avgAge = l2Issues.length ? Math.round(l2Issues.reduce((acc, current) => acc + (current.age || 0), 0) / l2Issues.length) : 0;
    return { total, blocked, done, avgAge };
  }, [l2Issues]);

  const l1Stats = useMemo(() => {
    const total = l1Issues.length;
    const blocked = l1Issues.filter(i => i.blocked).length;
    const done = l1Issues.filter(i => i.status === 'Done').length;
    const totalPointsCompleted = l1Issues.filter(i => i.status === 'Done').reduce((acc, curr) => acc + (curr.points || 0), 0);
    return { total, blocked, done, totalPointsCompleted };
  }, [l1Issues]);

  // Children Completion Percent helper for L2 Progress bars
  const getL2ProgressPercent = (l2Id: string) => {
    const directL1Children = issues.filter(i => i.level === FlightLevel.L1 && i.parentId === l2Id);
    if (directL1Children.length === 0) return 0;
    const doneCount = directL1Children.filter(i => i.status === 'Done').length;
    return Math.round((doneCount / directL1Children.length) * 100);
  };

  const getL3ProgressPercent = (l3Id: string) => {
    const directL2Children = issues.filter(i => i.level === FlightLevel.L2 && i.parentId === l3Id);
    if (directL2Children.length === 0) return 0;
    const doneCount = directL2Children.filter(i => i.status === 'Done').length;
    return Math.round((doneCount / directL2Children.length) * 100);
  };

  return (
    <div className="space-y-6">

      {/* INTRO HERO STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#8a2d46]/10 to-[#8a2d46]/5 p-4 rounded-xl border border-[#8a2d46]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#8a2d46] text-white flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.kpiTotal}</p>
            <h3 className="text-xl font-bold text-slate-800">{filteredIssues.length} </h3>
          </div>
        </div>

        <div className="bg-[#6b46c1]/5 p-4 rounded-xl border border-[#6b46c1]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.kpiStrategicTitle}</p>
            <h3 className="text-xl font-bold text-slate-800">{l3Issues.filter(i => i.status !== 'Done').length} {t.kpiStrategicInProgress}</h3>
          </div>
        </div>

        <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.kpiTacticalTitle}</p>
            <h3 className="text-xl font-bold text-slate-800">{l2Stats.avgAge} {t.kpiTacticalDays} </h3>
          </div>
        </div>

        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t.kpiOperationalTitle}</p>
            <h3 className="text-xl font-bold text-slate-800">{l1Stats.total} </h3>
          </div>
        </div>
      </div>

      {/* --- LEVEL 3: ESTRATÉGICO --- */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-purple-900/5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-600 text-white flex items-center justify-center">
              <Satellite className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                {t.lvl3Title} <span className="text-xs font-normal text-slate-500">{t.lvl3Subtitle}</span>
              </h2>
              <p className="text-xs text-slate-400">{t.lvl3Description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-semibold">
                {l3Stats.total} {t.lvl3Iniciatives}
              </span>
              {l3Stats.blocked > 0 && (
                <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> {l3Stats.blocked} {t.lvl3Blocked}
                </span>
              )}
            </div>
            <button
              onClick={() => toggleLevel('L3')}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
            >
              {collapsedLevels.L3 ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!collapsedLevels.L3 && (
          <div className="p-4">
            {l3Issues.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {t.lvl3NoIssues}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {l3Issues.map(issue => {
                  const progress = getL3ProgressPercent(issue.id);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue?.(issue)}
                      className={`cursor-pointer group flex flex-col justify-between border-l-4 border-l-purple-600 p-4 rounded border-y border-r border-slate-200 relative hover:shadow-md transition-shadow ${issue.blocked ? 'bg-red-50/50 border-red-200' : 'bg-white'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-purple-800">{issue.id}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${issue.status === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                            issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {issue.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors text-sm mb-1 line-clamp-1">{issue.subject}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{issue.description || t.lvl3NoDescription}</p>
                      </div>

                      <div className="space-y-3 mt-1">
                        {/* Status bar */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>{t.lvl3SyncN2}</span>
                            <span className="font-bold text-slate-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                            <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                          <span className="font-semibold text-slate-500 truncate max-w-[120px]">👤 {issue.assignee || t.lvl3NoManager}</span>
                          <span>📅 {issue.creationDate}</span>
                        </div>

                        {issue.blocked && (
                          <div className="p-2 bg-red-100/60 text-red-800 text-[11px] rounded flex items-start gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <p className="leading-tight"><strong className="font-bold">{t.lvl3BlockLabel} </strong>{issue.blockedReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- LEVEL 2: COORDENAÇÃO --- */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-blue-900/5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                {t.lvl2Title} <span className="text-xs font-normal text-slate-500">{t.lvl2Subtitle}</span>
              </h2>
              <p className="text-xs text-slate-400">{t.lvl2Description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                {l2Stats.total} {t.lvl2EpicsProjects}
              </span>
              <span className="bg-slate-100 border px-2.5 py-0.5 rounded-full">
                {t.lvl2WipAgeAvg} {l2Stats.avgAge} {t.kpiTacticalDays}
              </span>
            </div>
            <button
              onClick={() => toggleLevel('L2')}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
            >
              {collapsedLevels.L2 ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!collapsedLevels.L2 && (
          <div className="p-4">
            {l2Issues.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                {t.lvl2NoIssues}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {l2Issues.map(issue => {
                  const progress = getL2ProgressPercent(issue.id);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue?.(issue)}
                      className={`cursor-pointer group flex flex-col justify-between border-l-4 border-l-blue-600 p-4 rounded border-y border-r border-slate-200 relative hover:shadow-md transition-shadow ${issue.blocked ? 'bg-red-50/50 border-red-200' : 'bg-white'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-800">{issue.id}</span>
                            {issue.parentId && (
                              <span className="text-[10px] bg-purple-50 text-purple-600 rounded px-1.5 py-0.2 border border-purple-200 flex items-center gap-0.5">
                                <ArrowRight className="w-2.5 h-2.5" /> {issue.parentId}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${issue.status === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                            issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {issue.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-sm mb-1 line-clamp-1">{issue.subject}</h4>
                        <div className="flex items-center gap-2 mt-1.5 mb-3">
                          <span className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{issue.project}</span>
                          <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded">{issue.team || t.lvl2AllTeams}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mt-1">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span>{t.lvl2SyncL1}</span>
                            <span className="font-bold text-slate-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100 font-mono">
                          <span>{t.lvl2WipAgeLabel} <b className="font-bold text-slate-600">{issue.age} d</b></span>
                          <span className="text-slate-500">👤 {issue.assignee || t.lvl2NoOwner}</span>
                        </div>

                        {issue.blocked && (
                          <div className="p-2 bg-red-100/60 text-red-800 text-[11px] rounded flex items-start gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <p className="leading-tight"><strong className="font-bold">{t.lvl2BottleneckLabel} </strong>{issue.blockedReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- LEVEL 1: OPERACIONAL --- */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-emerald-950/5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                {t.lvl1Title} <span className="text-xs font-normal text-slate-500">{t.lvl1Subtitle}</span>
              </h2>
              <p className="text-xs text-slate-400">{t.lvl1Description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Togggle high density visualizer */}
            <button
              onClick={() => setHighDensityMode(!highDensityMode)}
              className="flex items-center gap-1.5 py-1 px-3 border border-slate-300 rounded hover:bg-slate-100 text-xs font-medium text-slate-600"
              title={t.lvl1HighDensityTooltip}
            >
              {highDensityMode ? <EyeOff className="w-3.5 h-3.5 text-pink-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{highDensityMode ? t.lvl1HighDensityOn : t.lvl1HighDensityOff}</span>
            </button>

            <button
              onClick={() => toggleLevel('L1')}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
            >
              {collapsedLevels.L1 ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!collapsedLevels.L1 && (
          <div className="p-4">
            {highDensityMode ? (
              /* --- EXQUISITE HIGH DENSITY VALUE MAP --- */
              <div className="space-y-4">

                {/* Simulated Stats info box showing high volume metrics >1000 tasks */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 bg-[#8a2d46]/10 text-[#8a2d46] text-xs font-bold rounded">{t.lvl1HighDensityCompaction}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{t.lvl1HighDensityCorpSummary} (+{simulatedTotalL1Tasks} {t.kpiOperationalTitle})</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      {t.lvl1HighDensityKlausLeopold}
                    </p>
                  </div>

                  {/* Summary statuses indicator pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono bg-slate-100 border px-3 py-1.5 rounded-md text-slate-600">
                      📋 {t.lvl1Backlog}: <b>{simulatedL1Statuses.Backlog + l1Issues.filter(i => i.status === 'Backlog').length}</b>
                    </span>
                    <span className="text-xs font-mono bg-slate-200/60 border px-3 py-1.5 rounded-md text-slate-700">
                      💡 {t.lvl1ToDo}: <b>{simulatedL1Statuses.ToDo + l1Issues.filter(i => i.status === 'To Do').length}</b>
                    </span>
                    <span className="text-xs font-mono bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md text-blue-700">
                      ⚡ {t.lvl1InProgress}: <b>{simulatedL1Statuses.InProgress + l1Issues.filter(i => i.status === 'In Progress').length}</b>
                    </span>
                    <span className="text-xs font-mono bg-red-50 border border-red-200 px-3 py-1.5 rounded-md text-red-700">
                      🚫 {t.lvl1Blocked}: <b>{simulatedL1Statuses.Blocked + l1Issues.filter(i => i.blocked).length}</b>
                    </span>
                    <span className="text-xs font-mono bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md text-emerald-700">
                      ✅ {t.lvl1Done}: <b>{simulatedL1Statuses.Done + l1Issues.filter(i => i.status === 'Done').length}</b>
                    </span>
                  </div>
                </div>

                {/* VISUAL DOT MATRIX REPRESENTATION OF THE MASSIVE OPERATIONAL WORKLOAD */}
                <div className="border border-slate-200 rounded-lg p-5 bg-zinc-50 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{t.lvl1DotMatrixTitle}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-350 inline-block"></span> {t.lvl1Backlog}</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> {t.lvl1ToDo}</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span> {t.lvl1InProgress}</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> {t.lvl1Blocked}</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> {t.lvl1Done}</span>
                    </div>
                  </div>

                  {/* Dot Map Matrix Frame */}
                  <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-md border min-h-[100px] items-center justify-center">
                    {/* Render Backlogged Simulated dots */}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={`back-${i}`} className="w-3 h-3 rounded-full bg-slate-200" title="Backlog Operational issue" />
                    ))}
                    {/* Render ToDo simulated dots */}
                    {Array.from({ length: 45 }).map((_, i) => (
                      <div key={`todo-${i}`} className="w-3 h-3 rounded-full bg-slate-300" title="To Do Operational issue" />
                    ))}
                    {/* Render InProgress dots */}
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div key={`ip-${i}`} className="w-3 h-3 rounded-full bg-blue-300" title="In Progress Operational issue" />
                    ))}
                    {/* Render blocked dots */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={`bl-${i}`} className="w-3 h-3 rounded-full bg-red-400 animate-pulse" title="Blocked Operational issue" />
                    ))}
                    {/* Render done dots */}
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div key={`dn-${i}`} className="w-3 h-3 rounded-full bg-emerald-400" title="Completed" />
                    ))}
                  </div>
                </div>

                {/* Active L1 Issues tracked in current Filter views */}
                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">{t.lvl1FilteredActive} ({l1Issues.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {l1Issues.map(issue => (
                      <div
                        key={issue.id}
                        onClick={() => onSelectIssue?.(issue)}
                        className={`cursor-pointer p-3 rounded-md border text-xs flex flex-col justify-between hover:bg-slate-50 transition-colors ${issue.blocked ? 'bg-red-50/50 border-red-300 text-red-900' : 'bg-white'}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono font-bold text-[10px] text-emerald-800">{issue.id}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{issue.status}</span>
                          </div>
                          <p className="font-medium text-slate-800 line-clamp-1">{issue.subject}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">L2 Pai: {issue.parentId || t.lvl1NoParent}</span>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-semibold block max-w-[80px] truncate">👤 {issue.assignee || t.lvl1NoAssignee}</span>
                          <span className="bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-mono font-bold">{issue.points || 3} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* --- HIGH GRANULAR DISCLOSED CARDS GRID --- */
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {l1Issues.map(issue => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue?.(issue)}
                    className={`cursor-pointer group flex flex-col justify-between border-l-4 border-l-emerald-600 p-4 rounded border-y border-r border-slate-200 relative hover:shadow hover:bg-slate-50 transition-all ${issue.blocked ? 'bg-red-50/50 border-red-200' : 'bg-white'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-mono text-xs font-bold text-emerald-800">{issue.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${issue.status === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                          issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                          {issue.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">{issue.subject}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">L2: {issue.parentId || t.lvl1NoParent}</p>
                    </div>

                    <div className="space-y-2 mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>L1 Squad: <b className="font-bold text-slate-600">{issue.team || t.unassigned}</b></span>
                        <span className="bg-emerald-50 text-emerald-700 font-mono text-[10px] px-1 rounded-sm font-bold">{issue.points ? `${issue.points}h` : t.lvl1NoEstimation}</span>
                      </div>
                      {issue.blocked && (
                        <div className="p-1.5 bg-red-100 text-red-800 text-[10px] rounded flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{t.lvl1BlockedTag}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
