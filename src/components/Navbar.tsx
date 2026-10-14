import React from 'react';
import { 
  BarChart3, 
  Timer, 
  Calendar as CalendarIcon, 
  Flame, 
  Play, 
  Clock, 
  Menu,
  Bot,
  RotateCcw,
  FileText,
  Bell,
  Sun,
  Moon,
  Droplet
} from 'lucide-react';
import { AppTheme } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'focus_plan' | 'timer' | 'calendar' | 'assignments' | 'schedule_attendance' | 'subject_folder';
  setCurrentTab: (tab: 'dashboard' | 'focus_plan' | 'timer' | 'calendar' | 'assignments' | 'schedule_attendance' | 'subject_folder') => void;
  todayMinutes: number;
  dailyTargetHours: number;
  streakCount: number;
  pendingAssignmentsCount: number;
  dailyReminderEnabled: boolean;
  reminderTime: string;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  onOpenStreakModal: () => void;
  onOpenNotificationModal: () => void;
  onQuickStartTimer: () => void;
  onToggleSidebarMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  todayMinutes,
  dailyTargetHours,
  streakCount,
  pendingAssignmentsCount,
  dailyReminderEnabled,
  reminderTime,
  theme,
  setTheme,
  onOpenStreakModal,
  onOpenNotificationModal,
  onQuickStartTimer,
  onToggleSidebarMobile
}) => {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Mobile Sidebar Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebarMobile}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white lg:hidden cursor-pointer"
              title="Open Side Menu & Subject Folders"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="font-extrabold text-lg text-white">
                Hamdaan Studies <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">Pro</span>
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                DEAN'S HONOR SUITE
              </span>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10">
            {/* Dashboard */}
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Dashboard
            </button>

            {/* Assignments (NEW) */}
            <button
              onClick={() => setCurrentTab('assignments')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'assignments'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-pink-400" />
              <span>Assignments</span>
              {pendingAssignmentsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-500/30 text-pink-200">
                  {pendingAssignmentsCount}
                </span>
              )}
            </button>

            {/* AI Focus Plan */}
            <button
              onClick={() => setCurrentTab('focus_plan')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'focus_plan'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              AI Focus Plan
            </button>

            {/* Timer */}
            <button
              onClick={() => setCurrentTab('timer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'timer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              Focus Timer
            </button>

            {/* Routine & Attendance (NEW) */}
            <button
              onClick={() => setCurrentTab('schedule_attendance')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'schedule_attendance'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Routine &amp; Attendance</span>
            </button>

            {/* Calendar */}
            <button
              onClick={() => setCurrentTab('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'calendar'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Deadlines
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Daily Reminder Bell Button */}
            <button
              onClick={onOpenNotificationModal}
              title={`Daily Reminder: ${dailyReminderEnabled ? `Active at ${reminderTime}` : 'Disabled'}`}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                dailyReminderEnabled 
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30' 
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              {dailyReminderEnabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* 3-Theme Switcher in Navbar */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-900 border border-white/10 gap-1">
              <button
                onClick={() => setTheme('dark')}
                title="Theme: Dark (Original)"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('blue')}
                title="Theme: Royal Blue"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'blue' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Droplet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('white')}
                title="Theme: Clean White"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  theme === 'white' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Today Study Progress */}
            <div 
              onClick={() => setCurrentTab('dashboard')}
              title={`Today's focus time: ${(todayMinutes / 60).toFixed(1)}h of ${dailyTargetHours}h`}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-xs text-slate-200">{(todayMinutes / 60).toFixed(1)}h</span>
              <span className="text-slate-500 text-xs">/</span>
              <span className="font-mono text-xs text-slate-400">{dailyTargetHours}h</span>
            </div>

            {/* Streak Counter - Click to open Streak Restore / Re-start modal */}
            <button
              onClick={onOpenStreakModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-all cursor-pointer"
              title="Click to Restore or Re-start Streak"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-mono font-bold">{streakCount}d Streak</span>
              <RotateCcw className="w-3 h-3 text-amber-400/70 ml-0.5" />
            </button>

            {/* Quick Focus Button */}
            <button
              onClick={onQuickStartTimer}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>Focus</span>
            </button>

          </div>
        </div>

      </div>
    </header>
  );
};
