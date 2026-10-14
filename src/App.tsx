/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AssignmentsView } from './components/AssignmentsView';
import { DailyFocusPlanView } from './components/DailyFocusPlanView';
import { FocusTimer } from './components/FocusTimer';
import { SubjectFolderView } from './components/SubjectFolderView';
import { DeadlineCalendar } from './components/DeadlineCalendar';
import { TimetableAndAttendance } from './components/TimetableAndAttendance';
import { StreakModal } from './components/StreakModal';
import { NotificationModal } from './components/NotificationModal';
import { TaskModal } from './components/TaskModal';
import { SubjectModal } from './components/SubjectModal';
import { 
  AppStateData, 
  Task, 
  SubjectCategory, 
  Chapter,
  Assignment,
  AssignmentStatus,
  StudySession, 
  CategoryType,
  DailyFocusPlan,
  AppTheme,
  AttendanceSubject,
  AttendanceLog,
  TimetableSlot,
  DayRoutineBlock
} from './types';
import { 
  getLocalData, 
  saveLocalData,
  formatLocalDate
} from './utils/storage';
import { soundManager } from './utils/audio';

export default function App() {
  const [data, setData] = useState<AppStateData>(() => getLocalData());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'focus_plan' | 'timer' | 'calendar' | 'assignments' | 'schedule_attendance' | 'subject_folder'>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>('sub-physics');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // AI Focus Plan state
  const [dailyFocusPlan, setDailyFocusPlan] = useState<DailyFocusPlan | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active task currently linked to timer
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null);

  // Modals
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalCatId, setTaskModalCatId] = useState<string | undefined>(undefined);
  const [taskModalDueDate, setTaskModalDueDate] = useState<string | undefined>(undefined);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<SubjectCategory | null>(null);
  const [catModalDefaultType, setCatModalDefaultType] = useState<CategoryType>('subject');

  // Track today's local date string
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const [lastNotifiedDate, setLastNotifiedDate] = useState<string>('');

  // Persist local state whenever data changes
  useEffect(() => {
    saveLocalData(data);
  }, [data]);

  // Daily Reminder Notification Scheduler
  useEffect(() => {
    if (!data.dailyReminderEnabled || !data.reminderTime) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDateStr = formatLocalDate(now);

      if (currentTimeStr === data.reminderTime && lastNotifiedDate !== currentDateStr) {
        setLastNotifiedDate(currentDateStr);
        // Play gentle chime
        soundManager.playCompletionChime();

        // Browser notification if granted
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification("Hamdaan Studies Pro - Daily Study Reminder", {
            body: `It's ${data.reminderTime}! Time for your focused study session. Keep your streak and GPA strong!`,
            icon: '/favicon.ico'
          });
        }
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkReminder, 30000);
    checkReminder();

    return () => clearInterval(interval);
  }, [data.dailyReminderEnabled, data.reminderTime, lastNotifiedDate]);

  // Generate AI Daily Focus Plan
  const handleGenerateDailyPlan = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const today = formatLocalDate();
      const res = await fetch('/api/ai/daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: data.tasks,
          categories: data.categories,
          targetStudyHours: data.goals.dailyTargetHours,
          currentDate: today
        })
      });

      const json = await res.json();
      if (res.ok && json.success && json.plan) {
        setDailyFocusPlan({
          ...json.plan,
          generatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Failed to generate daily focus plan', e);
    } finally {
      setIsAiLoading(false);
    }
  }, [data.tasks, data.categories, data.goals.dailyTargetHours]);

  // Auto-generate focus plan on initial load if not yet generated
  useEffect(() => {
    if (!dailyFocusPlan) {
      handleGenerateDailyPlan();
    }
  }, []);

  // Calculate today's study minutes
  const todayMinutes = useMemo(() => {
    return data.sessions
      .filter(s => s.date === todayStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [data.sessions, todayStr]);

  // Pending assignments count
  const pendingAssignmentsCount = useMemo(() => {
    return data.assignments.filter(a => a.status === 'pending').length;
  }, [data.assignments]);

  // Navigation helper
  const handleNavigate = (tab: typeof currentTab, subjectId?: string) => {
    setCurrentTab(tab);
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
  };

  // Streak Management Handlers
  const handleRestoreStreak = (taskId?: string) => {
    setData(prev => {
      let updatedTasks = prev.tasks;
      if (taskId) {
        const now = new Date().toISOString();
        updatedTasks = prev.tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'completed' as const,
              completedAt: now
            };
          }
          return t;
        });
      }

      const restoredStreak = prev.goals.streakCount + 1;
      const longest = Math.max(prev.goals.longestStreak, restoredStreak);

      return {
        ...prev,
        tasks: updatedTasks,
        goals: {
          ...prev.goals,
          streakCount: restoredStreak,
          longestStreak: longest,
          lastActiveDate: todayStr
        }
      };
    });
  };

  const handleRestartStreak = () => {
    setData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        streakCount: 0,
        lastActiveDate: ''
      }
    }));
  };

  // Task & Category Handlers
  const handleToggleTaskComplete = (taskId: string) => {
    setData(prev => {
      const now = new Date().toISOString();
      let completedNow = false;
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const isDone = t.status === 'completed';
          if (!isDone) completedNow = true;
          return {
            ...t,
            status: isDone ? ('todo' as const) : ('completed' as const),
            completedAt: isDone ? null : now
          };
        }
        return t;
      });

      // Update streak if a task was completed today
      let goals = prev.goals;
      if (completedNow && goals.lastActiveDate !== todayStr) {
        const newStreak = goals.streakCount + 1;
        goals = {
          ...goals,
          streakCount: newStreak,
          longestStreak: Math.max(goals.longestStreak, newStreak),
          lastActiveDate: todayStr
        };
      }

      return { ...prev, tasks: updatedTasks, goals };
    });
  };

  const handleSelectTaskForTimer = (task: Task) => {
    setActiveTimerTask(task);
    setCurrentTab('timer');
  };

  const handleStartCustomTimer = (title: string, durationMinutes: number, categoryId?: string) => {
    const matchedCat = categoryId 
      ? data.categories.find(c => c.id === categoryId) 
      : data.categories[0];

    const tempTask: Task = {
      id: `task-plan-${Date.now()}`,
      title,
      description: 'Scheduled from AI Daily Focus Plan',
      categoryId: matchedCat?.id || 'sub-physics',
      categoryType: matchedCat?.type || 'subject',
      priority: 'high',
      status: 'in_progress',
      dueDate: todayStr,
      estimatedMinutes: durationMinutes,
      completedMinutes: 0,
      tags: ['AI Plan'],
      completedAt: null,
      createdAt: todayStr
    };

    setActiveTimerTask(tempTask);
    setCurrentTab('timer');
  };

  const handleTaskProgressUpdate = (taskId: string, minutesAdded: number) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === taskId) {
          const newCompleted = t.completedMinutes + minutesAdded;
          return {
            ...t,
            completedMinutes: newCompleted,
            status: newCompleted >= t.estimatedMinutes ? 'completed' : 'in_progress',
            completedAt: newCompleted >= t.estimatedMinutes ? new Date().toISOString() : t.completedAt
          };
        }
        return t;
      })
    }));
  };

  const handleSessionComplete = (session: Omit<StudySession, 'id' | 'timestamp'>) => {
    const newSession: StudySession = {
      ...session,
      id: `sess-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    setData(prev => {
      const sessions = [newSession, ...prev.sessions];
      let goals = prev.goals;
      if (goals.lastActiveDate !== todayStr) {
        const newStreak = goals.streakCount + 1;
        goals = {
          ...goals,
          streakCount: newStreak,
          longestStreak: Math.max(goals.longestStreak, newStreak),
          lastActiveDate: todayStr
        };
      }

      return {
        ...prev,
        sessions,
        goals
      };
    });
  };

  const handleSaveNewTask = (taskData: Omit<Task, 'id' | 'completedAt' | 'createdAt' | 'completedMinutes'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completedMinutes: 0,
      completedAt: null,
      createdAt: formatLocalDate()
    };

    setData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  // Chapter management handler for subjects
  const handleUpdateChapters = (catId: string, chapters: Chapter[]) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, chapters } : c)
    }));
  };

  // Assignment handlers
  const handleAddAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      createdAt: formatLocalDate()
    };

    setData(prev => ({
      ...prev,
      assignments: [newAssignment, ...prev.assignments]
    }));
  };

  const handleToggleAssignmentStatus = (id: string, newStatus: AssignmentStatus) => {
    setData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => a.id === id ? { ...a, status: newStatus } : a)
    }));
  };

  const handleDeleteAssignment = (id: string) => {
    setData(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.id !== id)
    }));
  };

  const handleUpdateScore = (id: string, score: number, maxScore: number) => {
    setData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => a.id === id ? { ...a, obtainedScore: score, maxScore } : a)
    }));
  };

  // Attendance & Timetable handlers
  const handleUpdateAttendance = (newAttendance: AttendanceSubject[]) => {
    setData(prev => ({ ...prev, attendance: newAttendance }));
  };

  const handleAddAttendanceLog = (log: AttendanceLog) => {
    setData(prev => ({
      ...prev,
      attendanceLogs: [log, ...(prev.attendanceLogs || [])]
    }));
  };

  const handleUpdateCollegeTimetable = (timetable: TimetableSlot[]) => {
    setData(prev => ({ ...prev, collegeTimetable: timetable }));
  };

  const handleUpdateDayRoutine = (routine: DayRoutineBlock[]) => {
    setData(prev => ({ ...prev, dayRoutine: routine }));
  };

  // Reminder settings update
  const handleUpdateReminderSettings = (enabled: boolean, time: string) => {
    setData(prev => ({
      ...prev,
      dailyReminderEnabled: enabled,
      reminderTime: time
    }));
  };

  const handleSaveCategory = (cat: SubjectCategory) => {
    setData(prev => {
      const exists = prev.categories.some(c => c.id === cat.id);
      let categories: SubjectCategory[];
      if (exists) {
        categories = prev.categories.map(c => c.id === cat.id ? cat : c);
      } else {
        categories = [...prev.categories, cat];
      }
      return { ...prev, categories };
    });
  };

  const handleUpdateSyllabusProgress = (catId: string, progress: number) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, syllabusProgress: progress } : c)
    }));
  };

  const handleUpdateGoals = (newGoals: AppStateData['goals']) => {
    setData(prev => ({ ...prev, goals: newGoals }));
  };

  const handleThemeChange = (newTheme: AppTheme) => {
    setData(prev => ({ ...prev, theme: newTheme }));
  };

  const handleOpenNewTaskModal = (categoryId?: string, initialDate?: string) => {
    setTaskModalCatId(categoryId);
    setTaskModalDueDate(initialDate);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewCatModal = (defaultType: CategoryType = 'subject') => {
    setEditingCat(null);
    setCatModalDefaultType(defaultType);
    setIsCatModalOpen(true);
  };

  const handleEditCat = (cat: SubjectCategory) => {
    setEditingCat(cat);
    setIsCatModalOpen(true);
  };

  // 3 Distinct Themes: 'dark' (Original Obsidian), 'blue' (Royal Sapphire Blue), 'white' (Clean White)
  const themeStyles: Record<AppTheme, { containerClass: string; bgClass: string; orb1: string; orb2: string; orb3: string }> = {
    dark: {
      containerClass: 'theme-dark',
      bgClass: 'bg-[#080d1a]',
      orb1: 'from-indigo-600/25 via-blue-700/15 to-transparent',
      orb2: 'from-purple-600/20 via-pink-600/10 to-transparent',
      orb3: 'from-emerald-500/15 via-teal-600/10 to-transparent',
    },
    blue: {
      containerClass: 'theme-blue',
      bgClass: 'bg-[#071529]',
      orb1: 'from-blue-600/35 via-cyan-700/20 to-transparent',
      orb2: 'from-sky-500/25 via-indigo-700/15 to-transparent',
      orb3: 'from-teal-500/20 via-blue-900/15 to-transparent',
    },
    white: {
      containerClass: 'theme-white',
      bgClass: 'bg-[#f8fafc]',
      orb1: 'from-blue-200/50 via-indigo-100/40 to-transparent',
      orb2: 'from-amber-200/40 via-sky-100/30 to-transparent',
      orb3: 'from-emerald-200/40 via-teal-100/30 to-transparent',
    }
  };

  const activeTheme = themeStyles[data.theme] || themeStyles.dark;

  // Currently selected subject for folder view
  const currentCategory = useMemo(() => {
    return data.categories.find(c => c.id === selectedSubjectId) || data.categories[0];
  }, [data.categories, selectedSubjectId]);

  return (
    <div className={`min-h-screen ${activeTheme.containerClass} ${activeTheme.bgClass} relative selection:bg-indigo-500 selection:text-white transition-colors duration-500 flex`}>
      
      {/* Dynamic Aesthetic Background Canvas & Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className={`absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br ${activeTheme.orb1} blur-[120px] animate-pulse-slow`} />
        <div className={`absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full bg-gradient-to-bl ${activeTheme.orb2} blur-[140px] animate-pulse-slow`} style={{ animationDelay: '3s' }} />
        <div className={`absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-tr ${activeTheme.orb3} blur-[130px] animate-pulse-slow`} style={{ animationDelay: '5s' }} />
      </div>

      {/* Side Menu Navigation with Subject Folders & Assignments */}
      <Sidebar
        currentTab={currentTab}
        selectedSubjectId={selectedSubjectId}
        onNavigate={handleNavigate}
        categories={data.categories}
        tasks={data.tasks}
        assignments={data.assignments}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        onOpenNewCategoryModal={() => handleOpenNewCatModal('subject')}
        todayMinutes={todayMinutes}
        dailyTargetHours={data.goals.dailyTargetHours}
        streakCount={data.goals.streakCount}
        longestStreak={data.goals.longestStreak}
        theme={data.theme}
        setTheme={handleThemeChange}
        dailyReminderEnabled={data.dailyReminderEnabled}
        reminderTime={data.reminderTime}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen lg:pl-72 transition-all duration-300">
        
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={(tab) => handleNavigate(tab)}
          todayMinutes={todayMinutes}
          dailyTargetHours={data.goals.dailyTargetHours}
          streakCount={data.goals.streakCount}
          pendingAssignmentsCount={pendingAssignmentsCount}
          dailyReminderEnabled={data.dailyReminderEnabled}
          reminderTime={data.reminderTime}
          theme={data.theme}
          setTheme={handleThemeChange}
          onOpenStreakModal={() => setIsStreakModalOpen(true)}
          onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
          onQuickStartTimer={() => handleNavigate('timer')}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View Router */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Dashboard */}
          {currentTab === 'dashboard' && (
            <Dashboard
              data={data}
              onSelectTaskForTimer={handleSelectTaskForTimer}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onUpdateGoals={handleUpdateGoals}
              onNavigateToCalendar={() => handleNavigate('calendar')}
              onNavigateToSubjects={() => handleNavigate('subject_folder', 'sub-physics')}
              onNavigateToFocusPlan={() => handleNavigate('focus_plan')}
              onNavigateToSubjectFolder={(id) => handleNavigate('subject_folder', id)}
              onNavigateToSchedule={() => handleNavigate('schedule_attendance')}
              focusPlan={dailyFocusPlan}
              onGeneratePlan={handleGenerateDailyPlan}
              isAiLoading={isAiLoading}
            />
          )}

          {/* Assignments (NEW dedicated view) */}
          {currentTab === 'assignments' && (
            <AssignmentsView
              assignments={data.assignments}
              categories={data.categories}
              onAddAssignment={handleAddAssignment}
              onToggleAssignmentStatus={handleToggleAssignmentStatus}
              onDeleteAssignment={handleDeleteAssignment}
              onUpdateScore={handleUpdateScore}
            />
          )}

          {/* AI Focus Plan */}
          {currentTab === 'focus_plan' && (
            <DailyFocusPlanView
              plan={dailyFocusPlan}
              isLoading={isAiLoading}
              onGeneratePlan={handleGenerateDailyPlan}
              onSelectTaskForTimer={handleSelectTaskForTimer}
              onStartCustomTimer={handleStartCustomTimer}
              tasks={data.tasks}
              categories={data.categories}
              dailyTargetHours={data.goals.dailyTargetHours}
            />
          )}

          {/* Subject Folder & Chapters */}
          {currentTab === 'subject_folder' && currentCategory && (
            <SubjectFolderView
              category={currentCategory}
              tasks={data.tasks}
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onEditCategory={handleEditCat}
              onToggleTaskComplete={handleToggleTaskComplete}
              onSelectTaskForTimer={handleSelectTaskForTimer}
              onUpdateSyllabusProgress={handleUpdateSyllabusProgress}
              onUpdateChapters={handleUpdateChapters}
            />
          )}

          {/* Focus Timer */}
          {currentTab === 'timer' && (
            <FocusTimer
              categories={data.categories}
              tasks={data.tasks}
              activeTask={activeTimerTask}
              onSelectTask={setActiveTimerTask}
              onSessionComplete={handleSessionComplete}
              onTaskProgressUpdate={handleTaskProgressUpdate}
            />
          )}

          {/* Accurate Calendar */}
          {currentTab === 'calendar' && (
            <DeadlineCalendar
              tasks={data.tasks}
              assignments={data.assignments}
              categories={data.categories}
              onOpenNewTaskModal={handleOpenNewTaskModal}
              onToggleTaskComplete={handleToggleTaskComplete}
              onSelectTaskForTimer={handleSelectTaskForTimer}
              onNavigateToAssignments={() => handleNavigate('assignments')}
            />
          )}

          {/* Routine, College Timetable & Attendance Manager (NEW) */}
          {currentTab === 'schedule_attendance' && (
            <TimetableAndAttendance
              categories={data.categories}
              attendance={data.attendance}
              attendanceLogs={data.attendanceLogs}
              collegeTimetable={data.collegeTimetable}
              dayRoutine={data.dayRoutine}
              onUpdateAttendance={handleUpdateAttendance}
              onAddAttendanceLog={handleAddAttendanceLog}
              onUpdateCollegeTimetable={handleUpdateCollegeTimetable}
              onUpdateDayRoutine={handleUpdateDayRoutine}
              onSelectSubjectFolder={(id) => handleNavigate('subject_folder', id)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 py-5 mt-12 bg-slate-950/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">Hamdaan Studies Pro</span>
              <span>•</span>
              <span>Physics, Maths 1 &amp; 2, Chemistry, CS 1 &amp; 2, English, EVS</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Offline-First High-Performance Storage</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Streak Management Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streakCount={data.goals.streakCount}
        longestStreak={data.goals.longestStreak}
        tasks={data.tasks}
        onRestoreStreak={handleRestoreStreak}
        onRestartStreak={handleRestartStreak}
        onSelectTaskForTimer={handleSelectTaskForTimer}
        onOpenNewTaskModal={() => handleOpenNewTaskModal()}
      />

      {/* Daily Reminder Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        dailyReminderEnabled={data.dailyReminderEnabled}
        reminderTime={data.reminderTime}
        onUpdateReminderSettings={handleUpdateReminderSettings}
      />

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        categories={data.categories}
        initialCategoryId={taskModalCatId}
        initialDueDate={taskModalDueDate}
        onSaveTask={handleSaveNewTask}
      />

      {/* Subject & College Category Modal */}
      <SubjectModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        initialCategory={editingCat}
        defaultType={catModalDefaultType}
        onSaveCategory={handleSaveCategory}
      />

    </div>
  );
}
