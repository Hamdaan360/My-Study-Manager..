import React, { useState } from 'react';
import { Task, SubjectCategory, Priority } from '../types';
import { Calendar, Clock, Tag, AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SubjectCategory[];
  initialCategoryId?: string;
  initialDueDate?: string;
  onSaveTask: (task: Omit<Task, 'id' | 'completedAt' | 'createdAt' | 'completedMinutes'>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  initialDueDate,
  onSaveTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategoryId || categories[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('high');
  const [dueDate, setDueDate] = useState(initialDueDate || new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('23:59');
  const [estimatedMinutes, setEstimatedMinutes] = useState(90);
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedCat = categories.find(c => c.id === categoryId);
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSaveTask({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      categoryType: selectedCat?.type || 'subject',
      priority,
      status: 'todo',
      dueDate,
      dueTime: dueTime || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 60,
      tags
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/20 space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white">
            Create Study Task or Deadline
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Transformer Attention Layer"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject or College Role *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                required
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'college' ? '🏛️ ' : '📚 '} {c.code} - {c.name}
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
                <option value="urgent">🔴 Urgent Deadline</option>
                <option value="high">🟠 High Priority</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Minutes
              </label>
              <input
                type="number"
                min="10"
                max="600"
                step="15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Assignment, Midterm, Lab"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes or Syllabus Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key concepts, page numbers, or submission link..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Add Task
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
