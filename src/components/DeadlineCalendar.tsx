import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  Download, 
  ExternalLink, 
  Filter, 
  Plus, 
  Sparkles,
  Play,
  FileText,
  CalendarDays,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, SubjectCategory, Assignment } from '../types';
import { exportCalendarIcs, formatLocalDate } from '../utils/storage';

interface DeadlineCalendarProps {
  tasks: Task[];
  assignments?: Assignment[];
  categories: SubjectCategory[];
  onOpenNewTaskModal: (categoryId?: string, initialDate?: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onSelectTaskForTimer: (task: Task) => void;
  onNavigateToAssignments?: () => void;
}

export const DeadlineCalendar: React.FC<DeadlineCalendarProps> = ({
  tasks,
  assignments = [],
  categories,
  onOpenNewTaskModal,
  onToggleTaskComplete,
  onSelectTaskForTimer,
  onNavigateToAssignments
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatLocalDate(new Date()));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterType, setFilterType] = useState<'all' | 'subject' | 'college' | 'assignment'>('all');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatLocalDate(today));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Filter tasks & assignments
  const filteredTasks = tasks.filter(t => {
    if (filterType === 'assignment') return false;
    if (filterType === 'subject' && t.categoryType !== 'subject') return false;
    if (filterType === 'college' && t.categoryType !== 'college') return false;
    if (selectedCatId !== 'all' && t.categoryId !== selectedCatId) return false;
    return true;
  });

  const filteredAssignments = assignments.filter(a => {
    if (filterType === 'subject' || filterType === 'college') return false;
    if (selectedCatId !== 'all' && a.subjectId !== selectedCatId) return false;
    return true;
  });

  // Group by date (using local date string format YYYY-MM-DD)
  const tasksByDate = new Map<string, Task[]>();
  filteredTasks.forEach(task => {
    if (!task.dueDate) return;
    const existing = tasksByDate.get(task.dueDate) || [];
    existing.push(task);
    tasksByDate.set(task.dueDate, existing);
  });

  const assignmentsByDate = new Map<string, Assignment[]>();
  filteredAssignments.forEach(assign => {
    if (!assign.dueDate) return;
    const existing = assignmentsByDate.get(assign.dueDate) || [];
    existing.push(assign);
    assignmentsByDate.set(assign.dueDate, existing);
  });

  // Calculate month cells
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthCalendarCells: (string | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    monthCalendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    monthCalendarCells.push(formatLocalDate(dateObj));
  }

  // Calculate week cells
  const currDayOfWeek = currentDate.getDay();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currDayOfWeek);

  const weekCalendarCells: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekCalendarCells.push(formatLocalDate(d));
  }

  const todayStr = formatLocalDate(new Date());
  const selectedDayTasks = tasksByDate.get(selectedDateStr) || [];
  const selectedDayAssignments = assignmentsByDate.get(selectedDateStr) || [];

  // Upcoming deliverables sorted by due date
  const allDeliverables: { 
    id: string; 
    type: 'task' | 'assignment'; 
    title: string; 
    dueDate: string; 
    dueTime?: string; 
    priority: string; 
    categoryId: string; 
    isCompleted: boolean 
  }[] = [
    ...filteredTasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      dueDate: t.dueDate,
      dueTime: t.dueTime,
      priority: t.priority,
      categoryId: t.categoryId,
      isCompleted: t.status === 'completed'
    })),
    ...filteredAssignments.map(a => ({
      id: a.id,
      type: 'assignment' as const,
      title: a.title,
      dueDate: a.dueDate,
      dueTime: a.dueTime,
      priority: a.priority,
      categoryId: a.subjectId,
      isCompleted: a.status === 'submitted'
    }))
  ].filter(d => !d.isCompleted && d.dueDate)
   .sort((a, b) => (a.dueDate + (a.dueTime || '')).localeCompare(b.dueDate + (b.dueTime || '')));

  const handleExportIcs = () => {
    exportCalendarIcs(filteredTasks, categories);
  };

  const getGoogleCalendarUrl = (item: { title: string; dueDate: string; dueTime?: string; priority: string; categoryId: string }) => {
    const cat = categoryMap.get(item.categoryId);
    const title = encodeURIComponent(`[${cat?.code || 'STUDY'}] ${item.title}`);
    const details = encodeURIComponent(`Priority: ${item.priority}\nCategory: ${cat?.name || ''}`);
    const cleanDate = item.dueDate.replace(/-/g, '');
    const cleanTime = item.dueTime ? item.dueTime.replace(':', '') + '00' : '235900';
    const dates = `${cleanDate}T${cleanTime}Z/${cleanDate}T${cleanTime}Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
  };

  const handleTaskCheckbox = (task: Task) => {
    onToggleTaskComplete(task.id);
    if (task.status !== 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const getDaysDiff = (targetDateStr: string) => {
    const today = new Date(todayStr);
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Exam &amp; Deliverables Timeline
            </span>
            <span className="text-xs text-slate-400">Accurate Academic Calendar</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Deadlines &amp; Academic Calendar
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month / Week View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Week View
            </button>
          </div>

          <button
            onClick={handleExportIcs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="Download iCal file for Google Calendar or Apple Calendar"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export .ICS</span>
          </button>

          <button
            onClick={() => onOpenNewTaskModal(undefined, selectedDateStr)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Deadline</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter:</span>
          
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/5 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Items ({filteredTasks.length + filteredAssignments.length})
            </button>
            <button
              onClick={() => setFilterType('subject')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'subject' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Academic Only
            </button>
            <button
              onClick={() => setFilterType('assignment')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'assignment' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Assignments Only ({assignments.length})
            </button>
            <button
              onClick={() => setFilterType('college')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterType === 'college' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              College Roles
            </button>
          </div>
        </div>

        {/* Filter by Subject */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Subject:</label>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input text-white text-xs cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Calendar Grid (Month or Week) */}
        <div className="lg:col-span-2 glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-6">
          
          {/* Nav Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-extrabold text-white">
                {monthName} <span className="font-mono text-indigo-400">{year}</span>
              </h3>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={viewMode === 'month' ? prevMonth : prevWeek}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={viewMode === 'month' ? nextMonth : nextWeek}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 border-b border-white/10 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid View */}
          {viewMode === 'month' ? (
            <div className="grid grid-cols-7 gap-2">
              {monthCalendarCells.map((dateStr, idx) => {
                if (!dateStr) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      className="min-h-[78px] rounded-2xl bg-white/[0.02] border border-transparent"
                    />
                  );
                }

                const dayTasks = tasksByDate.get(dateStr) || [];
                const dayAssignments = assignmentsByDate.get(dateStr) || [];
                const totalItems = dayTasks.length + dayAssignments.length;
                const isSelected = selectedDateStr === dateStr;
                const isToday = dateStr === todayStr;
                const dayNum = parseInt(dateStr.split('-')[2], 10);
                const hasOverdue = dayTasks.some(t => t.status !== 'completed' && dateStr < todayStr);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[78px] p-2 rounded-2xl transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 shadow-md shadow-indigo-500/20'
                        : isToday
                        ? 'bg-emerald-500/10 border border-emerald-500/40'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 border border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday 
                            ? 'bg-emerald-500 text-slate-950' 
                            : isSelected 
                            ? 'bg-indigo-600 text-white' 
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {hasOverdue && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>

                    {/* Dots / Badges for Items on this Day */}
                    <div className="space-y-1 mt-1">
                      {totalItems > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {dayTasks.slice(0, 3).map(task => {
                            const cat = categoryMap.get(task.categoryId);
                            return (
                              <div
                                key={task.id}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cat?.color || '#0ea5e9' }}
                                title={`${cat?.code || ''}: ${task.title}`}
                              />
                            );
                          })}
                          {dayAssignments.slice(0, 2).map(a => {
                            const cat = categoryMap.get(a.subjectId);
                            return (
                              <div
                                key={a.id}
                                className="w-2 h-2 rounded-sm rotate-45"
                                style={{ backgroundColor: cat?.color || '#ec4899' }}
                                title={`[Assignment] ${a.title}`}
                              />
                            );
                          })}
                        </div>
                      )}

                      {totalItems > 0 && (
                        <div className="text-[10px] font-mono font-semibold text-slate-400 truncate">
                          {totalItems} item{totalItems > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Week View */
            <div className="grid grid-cols-7 gap-2">
              {weekCalendarCells.map((dateStr) => {
                const dayTasks = tasksByDate.get(dateStr) || [];
                const dayAssignments = assignmentsByDate.get(dateStr) || [];
                const totalItems = dayTasks.length + dayAssignments.length;
                const isSelected = selectedDateStr === dateStr;
                const isToday = dateStr === todayStr;
                const dayNum = parseInt(dateStr.split('-')[2], 10);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[160px] p-2.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-2 border-indigo-500 shadow-lg'
                        : isToday
                        ? 'bg-emerald-500/10 border border-emerald-500/40'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 border border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {new Date(dateStr).toLocaleString('default', { weekday: 'short' })}
                      </span>
                      <span 
                        className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                          isToday ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="space-y-1.5 my-auto overflow-y-auto max-h-[100px]">
                      {dayTasks.map(t => {
                        const cat = categoryMap.get(t.categoryId);
                        return (
                          <div 
                            key={t.id}
                            className="p-1 rounded text-[10px] truncate font-medium border"
                            style={{ 
                              backgroundColor: `${cat?.color || '#6366f1'}15`,
                              borderColor: `${cat?.color || '#6366f1'}40`,
                              color: cat?.color || '#fff'
                            }}
                          >
                            {t.title}
                          </div>
                        );
                      })}
                      {dayAssignments.map(a => {
                        const cat = categoryMap.get(a.subjectId);
                        return (
                          <div 
                            key={a.id}
                            className="p-1 rounded text-[10px] truncate font-medium bg-purple-500/15 border border-purple-500/30 text-purple-300"
                          >
                            📝 {a.title}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 pt-1">
                      {totalItems} due
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Col: Selected Day Schedule & Action Panel */}
        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-6">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-xs text-slate-400 font-medium">Selected Date</div>
              <h4 className="text-lg font-extrabold text-white">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </h4>
            </div>

            <button
              onClick={() => onOpenNewTaskModal(undefined, selectedDateStr)}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md"
              title="Add Task for this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Schedule for this date */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              <span>Deliverables on this Date ({selectedDayTasks.length + selectedDayAssignments.length})</span>
            </div>

            {selectedDayTasks.length === 0 && selectedDayAssignments.length === 0 ? (
              <div className="text-center py-8 rounded-2xl border border-dashed border-white/10 p-4 space-y-2">
                <p className="text-xs text-slate-400">No deadlines or assignments scheduled for this day.</p>
                <button
                  onClick={() => onOpenNewTaskModal(undefined, selectedDateStr)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 text-xs font-semibold cursor-pointer border border-white/10"
                >
                  + Add task for this day
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {/* Tasks */}
                {selectedDayTasks.map(task => {
                  const cat = categoryMap.get(task.categoryId);
                  const isDone = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isDone 
                          ? 'bg-slate-900/40 border-emerald-500/20 opacity-70' 
                          : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => handleTaskCheckbox(task)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div>
                            <div className={`text-xs font-semibold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span 
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold"
                                style={{ backgroundColor: `${cat?.color || '#6366f1'}20`, color: cat?.color }}
                              >
                                {cat?.code || 'STUDY'}
                              </span>
                              {task.dueTime && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {task.dueTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isDone && (
                            <button
                              onClick={() => onSelectTaskForTimer(task)}
                              className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                              title="Start Timer for this task"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <a
                            href={getGoogleCalendarUrl(task)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                            title="Add to Google Calendar"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Assignments */}
                {selectedDayAssignments.map(assign => {
                  const cat = categoryMap.get(assign.subjectId);
                  const isSubmitted = assign.status === 'submitted';

                  return (
                    <div
                      key={assign.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isSubmitted 
                          ? 'bg-slate-900/40 border-purple-500/20 opacity-70' 
                          : 'bg-purple-950/20 border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-white">
                                {assign.title}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">
                                Assignment
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span 
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold"
                                style={{ backgroundColor: `${cat?.color || '#ec4899'}20`, color: cat?.color }}
                              >
                                {cat?.code || 'SUB'}
                              </span>
                              <span className="text-[10px] text-purple-300">
                                {assign.status === 'submitted' ? '✓ Submitted' : 'Pending Submission'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {onNavigateToAssignments && (
                          <button
                            onClick={onNavigateToAssignments}
                            className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming High Priority Deadlines Feed */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Next Upcoming Deadlines</span>
              <span className="font-mono text-indigo-400">{allDeliverables.length} Total</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {allDeliverables.slice(0, 5).map(item => {
                const cat = categoryMap.get(item.categoryId);
                const diffDays = getDaysDiff(item.dueDate);
                const isOverdue = diffDays < 0;
                const isToday = diffDays === 0;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => setSelectedDateStr(item.dueDate)}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span style={{ color: cat?.color || '#0ea5e9' }}>{cat?.code || 'STUDY'}</span>
                        <span>•</span>
                        <span>{item.dueDate}</span>
                      </div>
                    </div>

                    <span 
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 font-mono ${
                        isOverdue 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : isToday 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' 
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isOverdue ? `${Math.abs(diffDays)}d overdue` : isToday ? 'Due Today' : `In ${diffDays}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
