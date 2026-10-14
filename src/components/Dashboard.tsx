import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ArrowUpRight, 
  Play, 
  Calendar, 
  Plus, 
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Zap,
  Edit2,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppStateData, Task, SubjectCategory, DailyFocusPlan } from '../types';
import { WeeklyAnalytics } from './WeeklyAnalytics';

interface DashboardProps {
  data: AppStateData;
  onSelectTaskForTimer: (task: Task) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onOpenNewTaskModal: (categoryId?: string) => void;
  onUpdateGoals: (goals: AppStateData['goals']) => void;
  onNavigateToCalendar: () => void;
  onNavigateToSubjects: () => void;
  onNavigateToFocusPlan: () => void;
  onNavigateToSubjectFolder: (subjectId: string) => void;
  onNavigateToSchedule?: () => void;
  focusPlan?: DailyFocusPlan | null;
  onGeneratePlan?: () => void;
  isAiLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onSelectTaskForTimer,
  onToggleTaskComplete,
  onOpenNewTaskModal,
  onUpdateGoals,
  onNavigateToCalendar,
  onNavigateToSubjects,
  onNavigateToFocusPlan,
  onNavigateToSubjectFolder,
  onNavigateToSchedule,
  focusPlan,
  onGeneratePlan,
  isAiLoading
}) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempDailyHours, setTempDailyHours] = useState(data.goals.dailyTargetHours);
  const [tempDailyTasks, setTempDailyTasks] = useState(data.goals.dailyTasksTarget);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's study minutes
  const todaySessions = data.sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayHours = Number((todayMinutes / 60).toFixed(1));

  // Today's tasks & completed count
  const todayTasks = data.tasks.filter(t => t.dueDate === todayStr || (t.status !== 'completed' && t.dueDate < todayStr));
  const completedTodayTasks = data.tasks.filter(t => t.completedAt && t.completedAt.startsWith(todayStr));
  const totalCompletedTasksCount = data.tasks.filter(t => t.status === 'completed').length;

  // Calculate 7-day study history for chart
  const last7Days: { dateStr: string; label: string; hours: number; sessionsCount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayMinutes = data.sessions
      .filter(s => s.date === dateStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const count = data.sessions.filter(s => s.date === dateStr).length;

    last7Days.push({
      dateStr,
      label: dayName,
      hours: Number((dayMinutes / 60).toFixed(1)),
      sessionsCount: count
    });
  }

  // Max hours in the 7 days for relative chart height
  const maxChartHours = Math.max(data.goals.dailyTargetHours * 1.25, ...last7Days.map(d => d.hours), 6);

  // Calculate subject vs college split for this week
  const weekSessions = data.sessions.filter(s => {
    const diffDays = (new Date(todayStr).getTime() - new Date(s.date).getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  const categoryTimeMap = new Map<string, number>();
  let academicMinutes = 0;
  let collegeMinutes = 0;

  weekSessions.forEach(s => {
    categoryTimeMap.set(s.categoryId, (categoryTimeMap.get(s.categoryId) || 0) + s.durationMinutes);
    if (s.categoryType === 'college') {
      collegeMinutes += s.durationMinutes;
    } else {
      academicMinutes += s.durationMinutes;
    }
  });

  const totalWeekMinutes = academicMinutes + collegeMinutes || 1;
  const academicPercent = Math.round((academicMinutes / totalWeekMinutes) * 100);
  const collegePercent = Math.round((collegeMinutes / totalWeekMinutes) * 100);

  // Velocity score (0 - 100)
  const studyHoursScore = Math.min(50, (todayHours / Math.max(1, data.goals.dailyTargetHours)) * 50);
  const taskCompletionScore = Math.min(30, (completedTodayTasks.length / Math.max(1, data.goals.dailyTasksTarget)) * 30);
  const streakScore = Math.min(20, (data.goals.streakCount / 10) * 20);
  const velocityScore = Math.round(studyHoursScore + taskCompletionScore + streakScore);

  // Upcoming urgent deadlines (within 5 days)
  const upcomingDeadlines = data.tasks
    .filter(t => t.status !== 'completed' && t.dueDate)
    .sort((a, b) => (a.dueDate + (a.dueTime || '')).localeCompare(b.dueDate + (b.dueTime || '')))
    .slice(0, 4);

  const categoryMap = new Map(data.categories.map(c => [c.id, c]));

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals({
      ...data.goals,
      dailyTargetHours: Math.max(1, Number(tempDailyHours)),
      dailyTasksTarget: Math.max(1, Number(tempDailyTasks))
    });
    setShowGoalModal(false);
  };

  const handleTaskCheckbox = (task: Task) => {
    onToggleTaskComplete(task.id);
    if (task.status !== 'completed') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Hero Welcome & High-Achiever Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Dean's List Scholar Mode
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">{data.studentName}</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Targeting <span className="text-emerald-400 font-semibold">{data.targetGpa}</span> at {data.universityName}. 
              Keep your daily study momentum disciplined and organized.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            <button
              onClick={() => onOpenNewTaskModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-white/10 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-slate-400" />
              <span>Edit Goals</span>
            </button>
          </div>
        </div>

        {/* 4 Key Productivity Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          
          {/* Card 1: Daily Study Hours */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Today's Focus
              </span>
              <span className="font-mono text-emerald-400">{Math.round((todayHours / data.goals.dailyTargetHours) * 100)}%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{todayHours}</span>
              <span className="text-xs text-slate-400 font-mono">/ {data.goals.dailyTargetHours} hrs</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (todayHours / data.goals.dailyTargetHours) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Tasks Done */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Tasks Completed
              </span>
              <span className="text-xs text-indigo-300">{completedTodayTasks.length} today</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{completedTodayTasks.length}</span>
              <span className="text-xs text-slate-400 font-mono">/ {data.goals.dailyTasksTarget} target</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (completedTodayTasks.length / data.goals.dailyTasksTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Study Streak */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                Focus Streak
              </span>
              <span className="text-[11px] text-amber-300 font-mono">Best: {data.goals.longestStreak}d</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{data.goals.streakCount}</span>
              <span className="text-xs text-slate-400">Consecutive Days</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Keep streak alive today!
            </div>
          </div>

          {/* Card 4: Velocity Index */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-teal-400" />
                Achiever Velocity
              </span>
              <span className="text-teal-300 font-mono">{velocityScore}/100</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">{velocityScore}%</span>
              <span className="text-xs text-slate-400">Performance</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${velocityScore}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* AI Daily Focus Plan Spotlight Banner */}
      <div className="glass-panel-elevated p-6 rounded-3xl border border-indigo-500/30 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-purple-400" />
                AI Daily Focus Plan
              </span>
              {focusPlan && (
                <span className="text-xs text-emerald-400 font-mono">
                  {focusPlan.focusBlocks.length} Time-Blocked Sessions Generated
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-white">
              {focusPlan ? "Today's Strategic Focus Plan is Active" : "Generate Today's AI Daily Focus Plan"}
            </h3>

            <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">
              {focusPlan 
                ? focusPlan.summary 
                : "AI analyzes upcoming deadlines across Physics, Maths 1 & 2, Chemistry, CS 1 & 2, English, and EVS to prioritize your study day."
              }
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onGeneratePlan && !focusPlan && (
              <button
                onClick={onGeneratePlan}
                disabled={isAiLoading}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isAiLoading ? 'Synthesizing...' : 'Generate Plan'}
              </button>
            )}

            <button
              onClick={onNavigateToFocusPlan}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-xs transition-all cursor-pointer"
            >
              <span>View Full Battle Plan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Routine & Attendance Quick Banner (NEW) */}
      <div className="glass-panel p-5 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/30 via-slate-900/60 to-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <div className="p-3 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 shrink-0">
            <Clock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                Daily Operations
              </span>
              <span className="text-xs text-slate-400">
                Today ({new Date().toLocaleString('en-US', { weekday: 'long' })})
              </span>
            </div>

            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>Day Routine: {(data.dayRoutine || []).filter(b => b.isCompleted).length} of {(data.dayRoutine || []).length} Blocks Mastered</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">
                Attendance: {(() => {
                  const att = (data.attendance || []).reduce((acc, a) => acc + a.attendedClasses, 0);
                  const tot = (data.attendance || []).reduce((acc, a) => acc + a.totalClasses, 0);
                  return tot > 0 ? ((att / tot) * 100).toFixed(1) : '100.0';
                })()}%
              </span>
            </h4>

            <p className="text-xs text-slate-300">
              College Lectures today: {(data.collegeTimetable || []).filter(s => s.day === (new Date().toLocaleString('en-US', { weekday: 'long' }))).length} Scheduled classes. You can edit your personal routine anytime if plans shift!
            </p>
          </div>
        </div>

        {onNavigateToSchedule && (
          <button
            onClick={onNavigateToSchedule}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span>Manage Timetable &amp; Attendance</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid: Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recharts WeeklyAnalytics Component */}
        <div className="lg:col-span-2">
          <WeeklyAnalytics 
            sessions={data.sessions}
            dailyTargetHours={data.goals.dailyTargetHours}
            weeklyTargetHours={data.goals.weeklyTargetHours}
          />
        </div>

        {/* Right Col: Category Distribution & Split */}
        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              Time Allocation
            </h2>
            <button
              onClick={onNavigateToSubjects}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Manage
            </button>
          </div>

          {/* Academic vs College Responsibility Split */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">Academic Subjects ({academicPercent}%)</span>
              <span className="text-rose-400">College Roles ({collegePercent}%)</span>
            </div>
            
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                style={{ width: `${academicPercent}%` }}
                title={`Academic: ${academicPercent}%`}
              />
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-700"
                style={{ width: `${collegePercent}%` }}
                title={`College Responsibilities: ${collegePercent}%`}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{(academicMinutes / 60).toFixed(1)} hrs (Curriculum)</span>
              <span>{(collegeMinutes / 60).toFixed(1)} hrs (Committees &amp; TA)</span>
            </div>
          </div>

          {/* Top Subjects Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Focus by Subject
            </h3>

            <div className="space-y-2.5">
              {data.categories.slice(0, 5).map(cat => {
                const catMin = categoryTimeMap.get(cat.id) || 0;
                const catHours = (catMin / 60).toFixed(1);
                const percent = Math.min(100, Math.round((catMin / Math.max(1, totalWeekMinutes)) * 100));

                return (
                  <div 
                    key={cat.id} 
                    onClick={() => onNavigateToSubjectFolder(cat.id)}
                    className="space-y-1 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[200px]">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-200 truncate group-hover:text-white">{cat.name}</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{catHours}h ({percent}%)</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              High-achiever tip: Dedicate core deep-focus morning hours to Physics, Maths 1 &amp; 2, and Computer Science derivations to secure top CGPA.
            </p>
          </div>

        </div>

      </div>

      {/* Two Column Grid: Today's Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Today's Action Tasks */}
        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                Today's Action Tasks ({todayTasks.length})
              </h2>
              <p className="text-xs text-slate-400">
                Tasks due today or carryovers needing high-priority focus
              </p>
            </div>
            <button
              onClick={() => onOpenNewTaskModal()}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">All caught up for today!</p>
              <p className="text-xs text-slate-500">Add an upcoming assignment or schedule a deep work session.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map(task => {
                const cat = categoryMap.get(task.categoryId);
                const isDone = task.status === 'completed';

                return (
                  <div 
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isDone 
                        ? 'bg-slate-900/40 border-white/5 opacity-60' 
                        : 'bg-slate-900/80 border-white/10 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button 
                        onClick={() => handleTaskCheckbox(task)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase font-mono"
                            style={{ 
                              backgroundColor: `${cat?.color || '#6366f1'}20`,
                              color: cat?.color || '#a5b4fc',
                              borderColor: `${cat?.color || '#6366f1'}40`
                            }}
                          >
                            {cat?.code || 'ACADEMIC'}
                          </span>

                          {task.priority === 'urgent' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              URGENT
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-medium mt-1 truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {task.estimatedMinutes} min
                          </span>
                          {task.dueTime && (
                            <span>Due at {task.dueTime}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isDone && (
                      <button
                        onClick={() => onSelectTaskForTimer(task)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
                        title="Start timer for this task"
                      >
                        <Play className="w-3 h-3 fill-emerald-400" />
                        <span>Focus</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Upcoming Deadlines & Calendar Link */}
        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Upcoming Deadlines &amp; Deliverables
              </h2>
              <p className="text-xs text-slate-400">
                Next assignments, lab submissions, and college responsibilities
              </p>
            </div>
            <button
              onClick={onNavigateToCalendar}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Calendar View <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.map(task => {
              const cat = categoryMap.get(task.categoryId);
              
              // Calculate days remaining
              const targetDate = new Date(task.dueDate + 'T' + (task.dueTime || '23:59:00'));
              const now = new Date();
              const diffMs = targetDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const isOverdue = diffMs < 0;

              return (
                <div 
                  key={task.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                        style={{ 
                          backgroundColor: `${cat?.color || '#f59e0b'}20`, 
                          color: cat?.color || '#fcd34d' 
                        }}
                      >
                        {cat?.name || 'Subject'}
                      </span>
                      {cat?.type === 'college' && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          College Duty
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 truncate">
                      {task.title}
                    </h4>

                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Due: {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3.5 h-3.5" /> Overdue
                      </span>
                    ) : diffDays === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                        Due Today
                      </span>
                    ) : diffDays === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Tomorrow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-white/10 font-mono">
                        {diffDays} days left
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Goal Edit Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded-3xl border border-white/20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Customize Daily Productivity Goals
              </h3>
              <button 
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Study Target (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={tempDailyHours}
                  onChange={e => setTempDailyHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white font-mono text-sm"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Recommended for engineering &amp; pre-med students: 5.0 - 7.0 hrs.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Tasks Target
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tempDailyTasks}
                  onChange={e => setTempDailyTasks(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white font-mono text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
