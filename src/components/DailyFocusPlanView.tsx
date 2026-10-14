import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Zap, 
  Calendar, 
  ArrowRight,
  BookOpen,
  Flame,
  Check
} from 'lucide-react';
import { DailyFocusPlan, Task, SubjectCategory } from '../types';

interface DailyFocusPlanViewProps {
  plan: DailyFocusPlan | null;
  isLoading: boolean;
  onGeneratePlan: () => Promise<void>;
  onSelectTaskForTimer: (task: Task) => void;
  onStartCustomTimer: (title: string, durationMinutes: number, categoryId?: string) => void;
  tasks: Task[];
  categories: SubjectCategory[];
  dailyTargetHours: number;
}

export const DailyFocusPlanView: React.FC<DailyFocusPlanViewProps> = ({
  plan,
  isLoading,
  onGeneratePlan,
  onSelectTaskForTimer,
  onStartCustomTimer,
  tasks,
  categories,
  dailyTargetHours
}) => {
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set());

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate < todayStr);
  const dueTodayTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate === todayStr);

  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  const toggleBlockDone = (idx: number) => {
    setCompletedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleStartBlockTimer = (block: any) => {
    if (block.taskId && taskMap.has(block.taskId)) {
      onSelectTaskForTimer(taskMap.get(block.taskId)!);
    } else {
      // Find matching category by name
      const matchedCat = categories.find(c => c.name.toLowerCase().includes(block.subjectName.toLowerCase()));
      onStartCustomTimer(block.title, block.durationMinutes, matchedCat?.id);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-emerald-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/40">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                Gemini AI Cognitive Planner
              </span>
              <span className="text-xs text-slate-400">
                Optimized for High Retention &amp; Zero Procrastination
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Daily Focus Battle Plan
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              AI analyzes your {overdueTasks.length} overdue task(s), upcoming deadlines across Physics, Maths 1 &amp; 2, Chemistry, CS 1 &amp; 2, English, and EVS to construct your ideal high-velocity schedule for today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGeneratePlan}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Synthesizing Plan...' : 'Regenerate AI Plan'}</span>
            </button>
          </div>
        </div>

        {/* Quick Deadline Status Ribbons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <div>
                <span className="text-xs text-rose-200 block font-semibold">Overdue Tasks</span>
                <span className="text-xs text-slate-400">Immediate recovery needed</span>
              </div>
            </div>
            <span className="text-lg font-mono font-extrabold text-rose-400">{overdueTasks.length}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs text-amber-200 block font-semibold">Due Today</span>
                <span className="text-xs text-slate-400">Strict end-of-day deadline</span>
              </div>
            </div>
            <span className="text-lg font-mono font-extrabold text-amber-400">{dueTodayTasks.length}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-emerald-200 block font-semibold">Planned Focus</span>
                <span className="text-xs text-slate-400">Target: {dailyTargetHours}h</span>
              </div>
            </div>
            <span className="text-lg font-mono font-extrabold text-emerald-400">
              {plan ? `${(plan.totalPlannedMinutes / 60).toFixed(1)}h` : `${dailyTargetHours}h`}
            </span>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="text-center py-20 px-4 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center animate-pulse shadow-xl shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white">Analyzing Academic Priority Vector...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Balancing overdue coursework, heavy math/physics derivations, and CS lab tasks for peak cognitive efficiency.
          </p>
        </div>
      ) : !plan ? (
        <div className="text-center py-16 px-4 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
          <Bot className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Daily Focus Plan Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click below to generate a smart study battle plan tailored to your upcoming deadlines and curriculum.
          </p>
          <button
            onClick={onGeneratePlan}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Generate Today's Focus Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Executive Strategy Briefing Card */}
          <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Strategic AI Briefing for Hamdaan
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{plan.summary}"
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-300/90 font-medium">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Cognitive Tip:</strong> {plan.highAchieverTip}</span>
            </div>
          </div>

          {/* Time-Blocked Task Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Time-Blocked Action Timeline ({plan.focusBlocks.length} Blocks)
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {completedBlocks.size} of {plan.focusBlocks.length} completed
              </span>
            </div>

            <div className="space-y-3">
              {plan.focusBlocks.map((block, idx) => {
                const isDone = completedBlocks.has(idx);
                const isCritical = block.urgency === 'CRITICAL';
                const isHigh = block.urgency === 'HIGH';

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-slate-900/40 border-white/5 opacity-50'
                        : isCritical
                        ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                        : isHigh
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-slate-900/70 border-white/10 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleBlockDone(idx)}
                        className="mt-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-slate-400" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {block.timeSlot}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 border border-white/10">
                            {block.subjectName}
                          </span>

                          <span 
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                              isCritical 
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' 
                                : isHigh 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {block.urgency}
                          </span>
                        </div>

                        <h4 className={`text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                          {block.title}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                          <span className="text-indigo-400 font-semibold">Tactic:</span> {block.strategyNote}
                        </p>
                      </div>
                    </div>

                    {/* Right side Duration & Launch Timer button */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {block.durationMinutes} min
                      </span>

                      {!isDone && (
                        <button
                          onClick={() => handleStartBlockTimer(block)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                          title="Start timer for this block"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Start Timer</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
