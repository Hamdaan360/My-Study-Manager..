import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Filter, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Award,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assignment, SubjectCategory, Priority, AssignmentStatus } from '../types';

interface AssignmentsViewProps {
  assignments: Assignment[];
  categories: SubjectCategory[];
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onToggleAssignmentStatus: (id: string, newStatus: AssignmentStatus) => void;
  onDeleteAssignment: (id: string) => void;
  onUpdateScore: (id: string, score: number, maxScore: number) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  categories,
  onAddAssignment,
  onToggleAssignmentStatus,
  onDeleteAssignment,
  onUpdateScore
}) => {
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New assignment form state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(categories[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('high');
  const [maxScore, setMaxScore] = useState<number>(100);
  const [submissionNotes, setSubmissionNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const filteredAssignments = assignments.filter(a => {
    if (filterSubjectId !== 'all' && a.subjectId !== filterSubjectId) return false;
    if (filterStatus === 'pending' && a.status === 'submitted') return false;
    if (filterStatus === 'submitted' && a.status !== 'submitted') return false;
    return true;
  });

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const submittedCount = assignments.filter(a => a.status === 'submitted').length;
  const overdueCount = assignments.filter(a => a.status === 'pending' && a.dueDate < todayStr).length;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddAssignment({
      title: title.trim(),
      subjectId: subjectId || categories[0]?.id || 'sub-physics',
      dueDate,
      dueTime: dueTime || undefined,
      status: 'pending',
      priority,
      maxScore: Number(maxScore) || 100,
      submissionNotes: submissionNotes.trim() || undefined
    });

    setTitle('');
    setSubmissionNotes('');
    setIsModalOpen(false);
  };

  const handleToggleSubmit = (a: Assignment) => {
    const nextStatus = a.status === 'pending' ? 'submitted' : 'pending';
    onToggleAssignmentStatus(a.id, nextStatus);
    if (nextStatus === 'submitted') {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Curriculum Deliverables
              </span>
              <span className="text-xs text-slate-400">
                Coursework &amp; Submissions Tracker
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Assignments Hub
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track assignments across Physics, Maths 1 &amp; 2, Chemistry, CS 1 &amp; 2, English, EVS, and Lab Reports. Maintain your top GPA target with timely submissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Pending Submissions</span>
                <span className="text-[11px] text-slate-400">{overdueCount} overdue</span>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-amber-400">{pendingCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Submitted</span>
                <span className="text-[11px] text-slate-400">Turned in</span>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-400">{submittedCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Total Tracked</span>
                <span className="text-[11px] text-slate-400">All subjects</span>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-indigo-300">{assignments.length}</span>
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter:</span>
          
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === 'submitted' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Submitted ({submittedCount})
            </button>
          </div>
        </div>

        {/* Filter by Subject */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Subject:</label>
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input text-white text-xs"
          >
            <option value="all">All Subjects</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl glass-panel-elevated border border-dashed border-white/10 space-y-3">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Assignments Added Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your upcoming homework, lab submissions, and semester project deadlines.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              + Add First Assignment
            </button>
          </div>
        ) : (
          filteredAssignments.map(assignment => {
            const cat = categoryMap.get(assignment.subjectId);
            const isSubmitted = assignment.status === 'submitted';
            const isOverdue = !isSubmitted && assignment.dueDate < todayStr;
            const isToday = !isSubmitted && assignment.dueDate === todayStr;

            return (
              <div
                key={assignment.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSubmitted
                    ? 'bg-slate-900/40 border-white/5 opacity-70'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                    : 'bg-slate-900/80 border-white/10 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <button
                    onClick={() => handleToggleSubmit(assignment)}
                    className="mt-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    title={isSubmitted ? 'Mark as pending' : 'Mark as submitted'}
                  >
                    {isSubmitted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-600 hover:border-slate-400 flex items-center justify-center" />
                    )}
                  </button>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${cat?.color || '#6366f1'}20`,
                          color: cat?.color || '#a5b4fc',
                          border: `1px solid ${cat?.color || '#6366f1'}40`
                        }}
                      >
                        {cat?.code || 'COURSE'}
                      </span>

                      <span className="text-xs font-semibold text-slate-400">
                        {cat?.name || 'General'}
                      </span>

                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                          OVERDUE
                        </span>
                      )}

                      {isToday && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          DUE TODAY
                        </span>
                      )}

                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {assignment.priority} Priority
                      </span>
                    </div>

                    <h3 className={`text-base font-bold ${isSubmitted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {assignment.title}
                    </h3>

                    {assignment.submissionNotes && (
                      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                        {assignment.submissionNotes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Due: {assignment.dueDate} {assignment.dueTime ? `at ${assignment.dueTime}` : ''}
                      </span>

                      {assignment.maxScore && (
                        <span className="font-mono text-slate-300">
                          Max Marks: {assignment.maxScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleToggleSubmit(assignment)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSubmitted
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {isSubmitted ? 'Undo Submit' : 'Submit Assignment'}
                  </button>

                  <button
                    onClick={() => onDeleteAssignment(assignment.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/20 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Add New Assignment
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physics Wave Optics Problem Set 3"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Marks / Score
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxScore}
                  onChange={(e) => setMaxScore(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission Instructions &amp; Topics
                </label>
                <textarea
                  rows={2}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Questions to solve, portal link, or formatting requirements..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Save Assignment
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
