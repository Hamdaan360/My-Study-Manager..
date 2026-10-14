import React from 'react';
import { 
  BarChart3, 
  Bot, 
  Timer, 
  Calendar, 
  Folder, 
  Sparkles, 
  Flame, 
  Plus, 
  Clock, 
  Atom, 
  Sigma, 
  Binary, 
  FlaskConical, 
  Code2, 
  Cpu, 
  BookOpen, 
  Leaf, 
  FileSpreadsheet, 
  ShieldCheck,
  Palette,
  RotateCcw,
  FileText,
  Bell,
  Sun,
  Moon,
  Droplet,
  CalendarRange
} from 'lucide-react';
import { SubjectCategory, Task, Assignment, AppTheme } from '../types';

interface SidebarProps {
  currentTab: 'dashboard' | 'focus_plan' | 'timer' | 'calendar' | 'assignments' | 'schedule_attendance' | 'subject_folder';
  selectedSubjectId: string | null;
  onNavigate: (tab: 'dashboard' | 'focus_plan' | 'timer' | 'calendar' | 'assignments' | 'schedule_attendance' | 'subject_folder', subjectId?: string) => void;
  categories: SubjectCategory[];
  tasks: Task[];
  assignments: Assignment[];
  onOpenStreakModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenNewCategoryModal: () => void;
  todayMinutes: number;
  dailyTargetHours: number;
  streakCount: number;
  longestStreak: number;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  dailyReminderEnabled: boolean;
  reminderTime: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  selectedSubjectId,
  onNavigate,
  categories,
  tasks,
  assignments,
  onOpenStreakModal,
  onOpenNotificationModal,
  onOpenNewCategoryModal,
  todayMinutes,
  dailyTargetHours,
  streakCount,
  longestStreak,
  theme,
  setTheme,
  dailyReminderEnabled,
  reminderTime,
  isOpenMobile,
  onCloseMobile
}) => {
  const academicSubjects = categories.filter(c => c.type === 'subject');
  const collegeRoles = categories.filter(c => c.type === 'college');

  // Helper icon for subjects
  const getSubjectIcon = (iconName: string, name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('phys')) return <Atom className="w-4 h-4" />;
    if (lower.includes('maths 1') || lower.includes('mathematics 1')) return <Sigma className="w-4 h-4" />;
    if (lower.includes('maths 2') || lower.includes('mathematics 2')) return <Binary className="w-4 h-4" />;
    if (lower.includes('chem')) return <FlaskConical className="w-4 h-4" />;
    if (lower.includes('computer science 1') || lower.includes('cs 1')) return <Code2 className="w-4 h-4" />;
    if (lower.includes('computer science 2') || lower.includes('cs 2')) return <Cpu className="w-4 h-4" />;
    if (lower.includes('eng')) return <BookOpen className="w-4 h-4" />;
    if (lower.includes('evs')) return <Leaf className="w-4 h-4" />;
    if (lower.includes('lab')) return <FileSpreadsheet className="w-4 h-4" />;
    if (lower.includes('council')) return <ShieldCheck className="w-4 h-4" />;
    return <Folder className="w-4 h-4" />;
  };

  const getTaskCountForCat = (catId: string) => {
    return tasks.filter(t => t.categoryId === catId && t.status !== 'completed').length;
  };

  const pendingAssignmentsCount = assignments.filter(a => a.status === 'pending').length;

  const themeOptions: { id: AppTheme; label: string; icon: React.ReactNode; colorDesc: string }[] = [
    { id: 'dark', label: 'Dark (Original)', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />, colorDesc: '#080d1a' },
    { id: 'blue', label: 'Blue (Ocean)', icon: <Droplet className="w-3.5 h-3.5 text-sky-400" />, colorDesc: '#0a192f' },
    { id: 'white', label: 'White (Light)', icon: <Sun className="w-3.5 h-3.5 text-amber-500" />, colorDesc: '#ffffff' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel-elevated border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          
          {/* Brand Header */}
          <div 
            onClick={() => { onNavigate('dashboard'); onCloseMobile(); }}
            className="flex items-center gap-3 px-2 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/25 shrink-0">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 truncate">
                Hamdaan Studies
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
                  Pro
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>High-Achiever Suite</span>
              </div>
            </div>
          </div>

          {/* Quick Streak & Today Target */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Today's Focus
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {(todayMinutes / 60).toFixed(1)}h / {dailyTargetHours}h
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (todayMinutes / (dailyTargetHours * 60)) * 100)}%` }}
              />
            </div>

            {/* Streak row with Restore / Re-start trigger */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{streakCount} Day Streak</span>
              </div>

              <button
                onClick={onOpenStreakModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[10px] font-bold text-amber-300 transition-colors cursor-pointer"
                title="Restore or Re-start Streak"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>
          </div>

          {/* Daily Reminder Quick Bell */}
          <button
            onClick={onOpenNotificationModal}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/25 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-600/30 text-indigo-400 group-hover:scale-110 transition-transform">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-200">Daily Study Reminder</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {dailyReminderEnabled ? `Active at ${reminderTime}` : 'Disabled'}
                </div>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${dailyReminderEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          </button>

          {/* Core Navigation Items */}
          <nav className="space-y-1">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Core Workspace
            </div>

            {/* Dashboard */}
            <button
              onClick={() => { onNavigate('dashboard'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Assignments (NEW) */}
            <button
              onClick={() => { onNavigate('assignments'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'assignments'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-pink-400" />
                <span>Assignments</span>
              </div>
              {pendingAssignmentsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {pendingAssignmentsCount}
                </span>
              )}
            </button>

            {/* AI Daily Focus Plan */}
            <button
              onClick={() => { onNavigate('focus_plan'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'focus_plan'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Daily Focus Plan</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI
              </span>
            </button>

            {/* Focus Timer */}
            <button
              onClick={() => { onNavigate('timer'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'timer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span>Focus Timer</span>
              </div>
            </button>

            {/* Timetable, Daily Routine & Attendance (NEW) */}
            <button
              onClick={() => { onNavigate('schedule_attendance'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'schedule_attendance'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarRange className="w-4 h-4 text-teal-400" />
                <span>Routine &amp; Attendance</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                New
              </span>
            </button>

            {/* Deadline Calendar */}
            <button
              onClick={() => { onNavigate('calendar'); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'calendar'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Deadline Calendar</span>
              </div>
            </button>
          </nav>

          {/* Academic Subject Folders & Chapters */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Subject Folders &amp; Chapters ({academicSubjects.length})
              </span>
              <button
                onClick={onOpenNewCategoryModal}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                title="Add new subject"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {academicSubjects.map(sub => {
                const isSelected = currentTab === 'subject_folder' && selectedSubjectId === sub.id;
                const pendingCount = getTaskCountForCat(sub.id);
                const chapterCount = sub.chapters?.length || 0;

                return (
                  <button
                    key={sub.id}
                    onClick={() => { onNavigate('subject_folder', sub.id); onCloseMobile(); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white border border-white/20 shadow-md font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="p-1 rounded-lg shrink-0"
                        style={{ color: sub.color, backgroundColor: `${sub.color}20` }}
                      >
                        {getSubjectIcon(sub.icon, sub.name)}
                      </span>
                      <div className="text-left truncate">
                        <div className="truncate font-semibold">{sub.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {chapterCount} Chapters • {sub.syllabusProgress}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {pendingCount > 0 && (
                        <span 
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                          style={{ backgroundColor: `${sub.color}25`, color: sub.color }}
                        >
                          {pendingCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* College Responsibilities */}
          {collegeRoles.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                College Roles &amp; Duties
              </div>

              <div className="space-y-1">
                {collegeRoles.map(role => {
                  const isSelected = currentTab === 'subject_folder' && selectedSubjectId === role.id;
                  const pendingCount = getTaskCountForCat(role.id);
                  const chapterCount = role.chapters?.length || 0;

                  return (
                    <button
                      key={role.id}
                      onClick={() => { onNavigate('subject_folder', role.id); onCloseMobile(); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-all group cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 text-white border border-white/20 shadow-md font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="p-1 rounded-lg shrink-0"
                          style={{ color: role.color, backgroundColor: `${role.color}20` }}
                        >
                          {getSubjectIcon(role.icon, role.name)}
                        </span>
                        <div className="text-left truncate">
                          <div className="truncate font-semibold">{role.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {chapterCount} Chapters
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {pendingCount > 0 && (
                          <span 
                            className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                            style={{ backgroundColor: `${role.color}25`, color: role.color }}
                          >
                            {pendingCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Theme Switcher Bar (Dark, Blue, White) */}
        <div className="p-3.5 border-t border-white/10 space-y-2 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              Theme Mode:
            </span>
            <span className="text-[10px] font-mono uppercase text-indigo-300 font-bold">
              {theme}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10">
            {themeOptions.map(t => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {t.icon}
                    <span>{t.id === 'dark' ? 'Dark' : t.id === 'blue' ? 'Blue' : 'White'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </aside>
    </>
  );
};
