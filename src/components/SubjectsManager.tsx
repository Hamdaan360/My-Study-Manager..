import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Plus, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  Sparkles, 
  GraduationCap, 
  User, 
  MapPin, 
  Tag, 
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubjectCategory, Task, CategoryType } from '../types';

interface SubjectsManagerProps {
  categories: SubjectCategory[];
  tasks: Task[];
  onOpenNewTaskModal: (categoryId?: string) => void;
  onOpenNewCategoryModal: (type?: CategoryType) => void;
  onEditCategory: (cat: SubjectCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onSelectTaskForTimer: (task: Task) => void;
  onUpdateSyllabusProgress: (categoryId: string, progress: number) => void;
}

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({
  categories,
  tasks,
  onOpenNewTaskModal,
  onOpenNewCategoryModal,
  onEditCategory,
  onDeleteCategory,
  onToggleTaskComplete,
  onSelectTaskForTimer,
  onUpdateSyllabusProgress
}) => {
  const [activeTab, setActiveTab] = useState<CategoryType>('subject');
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

  const academicCategories = categories.filter(c => c.type === 'subject');
  const collegeCategories = categories.filter(c => c.type === 'college');

  const displayedCategories = activeTab === 'subject' ? academicCategories : collegeCategories;

  const handleTaskCheckbox = (task: Task) => {
    onToggleTaskComplete(task.id);
    if (task.status !== 'completed') {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Curriculum &amp; Leadership Hub
            </span>
            <span className="text-xs text-slate-400">Total {categories.length} Categories</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Subjects &amp; College Responsibilities
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenNewCategoryModal(activeTab)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add {activeTab === 'subject' ? 'Subject' : 'College Role'}</span>
          </button>
        </div>
      </div>

      {/* Segmented Category Filter Tabs */}
      <div className="flex items-center p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 max-w-md">
        <button
          onClick={() => setActiveTab('subject')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'subject'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academic Subjects ({academicCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('college')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'college'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>College Duties ({collegeCategories.length})</span>
        </button>
      </div>

      {/* Grid of Subject / Responsibility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedCategories.map(cat => {
          const catTasks = tasks.filter(t => t.categoryId === cat.id);
          const completedTasks = catTasks.filter(t => t.status === 'completed');
          const isExpanded = expandedCatId === cat.id;

          return (
            <div 
              key={cat.id}
              className="glass-panel-elevated rounded-3xl border border-white/10 p-6 space-y-5 transition-all hover:border-white/20 relative overflow-hidden"
            >
              {/* Top Accent line */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: cat.color }}
              />

              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-4 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider"
                      style={{ 
                        backgroundColor: `${cat.color}20`,
                        color: cat.color,
                        border: `1px solid ${cat.color}40`
                      }}
                    >
                      {cat.code}
                    </span>

                    {cat.targetGrade && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Target: {cat.targetGrade}
                      </span>
                    )}

                    {cat.creditHours && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {cat.creditHours} Credits
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">
                    {cat.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditCategory(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit subject details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metadata details: Professor / Location / Notes */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                {cat.professorOrLead && (
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cat.professorOrLead}</span>
                  </div>
                )}
                {cat.roomOrLocation && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cat.roomOrLocation}</span>
                  </div>
                )}
                {cat.notes && (
                  <div className="col-span-2 text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {cat.notes}
                  </div>
                )}
              </div>

              {/* Syllabus / Milestone Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    {cat.type === 'subject' ? 'Syllabus Mastery' : 'Milestone Progress'}
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color: cat.color }}>
                    {cat.syllabusProgress}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${cat.syllabusProgress}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={cat.syllabusProgress}
                    onChange={(e) => onUpdateSyllabusProgress(cat.id, parseInt(e.target.value, 10))}
                    className="w-16 accent-indigo-500 cursor-pointer"
                    title="Slide to update syllabus progress"
                  />
                </div>
              </div>

              {/* Task Summary & Add Task action */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>{catTasks.length} Tasks ({completedTasks.length} Done)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenNewTaskModal(cat.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/10 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Add Task</span>
                  </button>

                  <button
                    onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-all cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide' : 'Tasks'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Tasks list for this subject */}
              {isExpanded && (
                <div className="space-y-2 pt-2 border-t border-white/10 animate-fade-in">
                  {catTasks.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center italic">
                      No tasks assigned yet. Click "Add Task" to create one.
                    </p>
                  ) : (
                    catTasks.map(t => {
                      const isDone = t.status === 'completed';

                      return (
                        <div 
                          key={t.id}
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                            isDone ? 'bg-slate-900/30 border-white/5 opacity-60' : 'bg-slate-900/70 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button 
                              onClick={() => handleTaskCheckbox(t)}
                              className="text-slate-400 hover:text-emerald-400 cursor-pointer"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-500" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <span className={`font-medium block truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                {t.title}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>Due: {t.dueDate}</span>
                                <span>•</span>
                                <span>{t.estimatedMinutes}m</span>
                              </div>
                            </div>
                          </div>

                          {!isDone && (
                            <button
                              onClick={() => onSelectTaskForTimer(t)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                              title="Focus timer on this task"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-400" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
