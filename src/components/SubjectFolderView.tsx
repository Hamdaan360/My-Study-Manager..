import React, { useState } from 'react';
import { 
  Folder, 
  Plus, 
  Play, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Tag, 
  Edit3, 
  User, 
  MapPin, 
  FileText,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Check,
  RotateCcw,
  ListOrdered,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubjectCategory, Task, Chapter } from '../types';

interface SubjectFolderViewProps {
  category: SubjectCategory;
  tasks: Task[];
  onOpenNewTaskModal: (categoryId: string, initialDate?: string, chapterId?: string) => void;
  onEditCategory: (category: SubjectCategory) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onSelectTaskForTimer: (task: Task) => void;
  onUpdateSyllabusProgress: (categoryId: string, progress: number) => void;
  onUpdateChapters: (categoryId: string, chapters: Chapter[]) => void;
}

export const SubjectFolderView: React.FC<SubjectFolderViewProps> = ({
  category,
  tasks,
  onOpenNewTaskModal,
  onEditCategory,
  onToggleTaskComplete,
  onSelectTaskForTimer,
  onUpdateSyllabusProgress,
  onUpdateChapters
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'tasks'>('chapters');
  const [filterTaskStatus, setFilterTaskStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);

  // New chapter form
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterTopics, setNewChapterTopics] = useState('');

  const chapters = category.chapters || [];
  const subjectTasks = tasks.filter(t => t.categoryId === category.id);
  const completedTasks = subjectTasks.filter(t => t.status === 'completed');
  const pendingTasks = subjectTasks.filter(t => t.status !== 'completed');

  const displayedTasks = filterTaskStatus === 'all' 
    ? subjectTasks 
    : filterTaskStatus === 'pending' 
    ? pendingTasks 
    : completedTasks;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = pendingTasks.filter(t => t.dueDate < todayStr).length;

  // Chapter statistics
  const completedChaptersCount = chapters.filter(c => c.status === 'completed').length;
  const inProgressChaptersCount = chapters.filter(c => c.status === 'in_progress').length;

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

  const handleToggleChapterStatus = (chapterId: string) => {
    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        let nextStatus: Chapter['status'] = 'in_progress';
        if (ch.status === 'not_started') nextStatus = 'in_progress';
        else if (ch.status === 'in_progress') nextStatus = 'completed';
        else nextStatus = 'not_started';
        return { ...ch, status: nextStatus };
      }
      return ch;
    });

    onUpdateChapters(category.id, updated);

    // Recalculate syllabus mastery
    if (updated.length > 0) {
      const done = updated.filter(c => c.status === 'completed').length;
      const progress = Math.round((done / updated.length) * 100);
      onUpdateSyllabusProgress(category.id, progress);
    }
  };

  const handleIncrementRevision = (chapterId: string) => {
    const updated = chapters.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, revisionCount: (ch.revisionCount || 0) + 1 };
      }
      return ch;
    });
    onUpdateChapters(category.id, updated);
  };

  const handleAddChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;

    const keyTopics = newChapterTopics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      subjectId: category.id,
      chapterNumber: chapters.length + 1,
      title: newChapterTitle.trim(),
      status: 'not_started',
      keyTopics,
      revisionCount: 0
    };

    const updated = [...chapters, newChapter];
    onUpdateChapters(category.id, updated);

    setNewChapterTitle('');
    setNewChapterTopics('');
    setIsAddChapterModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Subject Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-white/10 space-y-6">
        
        <div 
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: category.color }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                style={{ 
                  backgroundColor: `${category.color}25`,
                  color: category.color,
                  border: `1px solid ${category.color}50`
                }}
              >
                {category.code}
              </span>

              {category.targetGrade && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Target: {category.targetGrade}
                </span>
              )}

              {category.creditHours && (
                <span className="text-xs font-mono text-slate-400">
                  {category.creditHours} Credits
                </span>
              )}

              {overdueCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  {overdueCount} Overdue Tasks
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span 
                className="w-4 h-8 rounded-full inline-block"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
              {category.professorOrLead && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {category.professorOrLead}
                </span>
              )}
              {category.roomOrLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {category.roomOrLocation}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenNewTaskModal(category.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>

            <button
              onClick={() => onEditCategory(category)}
              className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              title="Edit Subject"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Syllabus Mastery Progress Bar */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" style={{ color: category.color }} />
              Syllabus Completion ({completedChaptersCount} of {chapters.length} Chapters Mastered)
            </span>
            <span className="font-mono font-bold text-sm" style={{ color: category.color }}>
              {category.syllabusProgress}%
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${category.syllabusProgress}%`,
                  backgroundColor: category.color
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={category.syllabusProgress}
              onChange={(e) => onUpdateSyllabusProgress(category.id, parseInt(e.target.value, 10))}
              className="w-24 accent-indigo-500 cursor-pointer"
              title="Slide to update syllabus mastery"
            />
          </div>
        </div>

      </div>

      {/* View Switcher: Chapters vs Tasks */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chapters &amp; Syllabus ({chapters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Tasks &amp; Homework ({subjectTasks.length})</span>
          </button>
        </div>

        {activeTab === 'chapters' && (
          <button
            onClick={() => setIsAddChapterModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Chapter</span>
          </button>
        )}
      </div>

      {/* Tab 1: Chapters View */}
      {activeTab === 'chapters' && (
        <div className="space-y-4 animate-fade-in">
          {chapters.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl glass-panel-elevated border border-dashed border-white/10 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Chapters Added Yet</h3>
              <p className="text-xs text-slate-400">Click below to add Chapter 1 for {category.name}.</p>
              <button
                onClick={() => setIsAddChapterModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                + Add Chapter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.map(chapter => {
                const isComplete = chapter.status === 'completed';
                const isInProgress = chapter.status === 'in_progress';

                return (
                  <div
                    key={chapter.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      isComplete
                        ? 'bg-slate-900/60 border-emerald-500/40 shadow-sm'
                        : isInProgress
                        ? 'bg-slate-900/80 border-amber-500/40'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-indigo-400">
                          Chapter {chapter.chapterNumber}
                        </span>

                        <button
                          onClick={() => handleToggleChapterStatus(chapter.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
                            isComplete
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isInProgress
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-white/10'
                          }`}
                        >
                          {isComplete ? '✓ Mastered' : isInProgress ? 'In Progress' : 'Not Started'}
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {chapter.title}
                      </h3>

                      {chapter.keyTopics && chapter.keyTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {chapter.keyTopics.map((topic, i) => (
                            <span 
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5"
                            >
                              • {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom action controls */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>Revisions: <strong className="text-white font-mono">{chapter.revisionCount}</strong></span>
                        <button
                          onClick={() => handleIncrementRevision(chapter.id)}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-indigo-300 text-[10px] font-semibold transition-colors cursor-pointer"
                          title="Record a revision session for this chapter"
                        >
                          +1 Revise
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleChapterStatus(chapter.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isComplete
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40'
                        }`}
                      >
                        {isComplete ? 'Mark Incomplete' : 'Complete Chapter'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Tasks View */}
      {activeTab === 'tasks' && (
        <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-emerald-400" />
              Tasks &amp; Homework ({subjectTasks.length})
            </h3>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5">
              <button
                onClick={() => setFilterTaskStatus('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTaskStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({subjectTasks.length})
              </button>
              <button
                onClick={() => setFilterTaskStatus('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTaskStatus === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({pendingTasks.length})
              </button>
              <button
                onClick={() => setFilterTaskStatus('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTaskStatus === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Done ({completedTasks.length})
              </button>
            </div>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 space-y-2">
              <Folder className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No tasks in this folder</p>
              <p className="text-xs text-slate-500">Click "Add Task" to record an assignment or problem set.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedTasks.map(task => {
                const isDone = task.status === 'completed';
                const isOverdue = !isDone && task.dueDate < todayStr;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isDone 
                        ? 'bg-slate-900/40 border-white/5 opacity-60' 
                        : isOverdue
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-slate-900/80 border-white/10 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleTaskCheckbox(task)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                              OVERDUE
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            {task.priority} Priority
                          </span>
                        </div>

                        <h4 className={`text-base font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Due: {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {task.completedMinutes}m / {task.estimatedMinutes}m
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isDone && (
                      <button
                        onClick={() => onSelectTaskForTimer(task)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Focus</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Add Chapter Modal */}
      {isAddChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded-3xl border border-white/20 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Add Chapter for {category.code}
              </h3>
              <button 
                onClick={() => setIsAddChapterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChapterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="e.g. Chapter 6: Thermodynamics"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Topics (comma separated)
                </label>
                <input
                  type="text"
                  value={newChapterTopics}
                  onChange={(e) => setNewChapterTopics(e.target.value)}
                  placeholder="Carnot cycle, Entropy, Gibbs free energy"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddChapterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
