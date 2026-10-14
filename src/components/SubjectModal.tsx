import React, { useState } from 'react';
import { SubjectCategory, CategoryType } from '../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: SubjectCategory | null;
  defaultType?: CategoryType;
  onSaveCategory: (category: SubjectCategory) => void;
}

const COLOR_PRESETS = [
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#0ea5e9', // Sky Blue
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#ec4899', // Pink
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  defaultType = 'subject',
  onSaveCategory
}) => {
  const [type, setType] = useState<CategoryType>(initialCategory?.type || defaultType);
  const [name, setName] = useState(initialCategory?.name || '');
  const [code, setCode] = useState(initialCategory?.code || '');
  const [color, setColor] = useState(initialCategory?.color || COLOR_PRESETS[0]);
  const [creditHours, setCreditHours] = useState(initialCategory?.creditHours || 3);
  const [targetGrade, setTargetGrade] = useState(initialCategory?.targetGrade || 'A+');
  const [professorOrLead, setProfessorOrLead] = useState(initialCategory?.professorOrLead || '');
  const [roomOrLocation, setRoomOrLocation] = useState(initialCategory?.roomOrLocation || '');
  const [syllabusProgress, setSyllabusProgress] = useState(initialCategory?.syllabusProgress || 50);
  const [notes, setNotes] = useState(initialCategory?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    onSaveCategory({
      id: initialCategory?.id || `cat-${Date.now()}`,
      type,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      color,
      accentColor: `${color}25`,
      icon: type === 'subject' ? 'BookOpen' : 'ShieldCheck',
      creditHours: type === 'subject' ? Number(creditHours) : undefined,
      targetGrade: type === 'subject' ? targetGrade : undefined,
      professorOrLead: professorOrLead.trim() || undefined,
      roomOrLocation: roomOrLocation.trim() || undefined,
      syllabusProgress: Number(syllabusProgress) || 0,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/20 space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white">
            {initialCategory ? 'Edit Category' : 'Add Subject or College Duty'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Classification
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('subject')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === 'subject' 
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' 
                    : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                📚 Academic Subject
              </button>
              <button
                type="button"
                onClick={() => setType('college')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === 'college' 
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300' 
                    : 'bg-slate-900 border-white/10 text-slate-400'
                }`}
              >
                🏛️ College Responsibility
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Advanced Operating Systems"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS-450"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white font-mono uppercase text-xs font-bold"
                required
              />
            </div>
          </div>

          {/* Color swatches */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {type === 'subject' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Credit Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={creditHours}
                  onChange={(e) => setCreditHours(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Grade
                </label>
                <input
                  type="text"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  placeholder="A+ or 4.0"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs font-mono"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === 'subject' ? 'Professor' : 'Chair / Lead'}
              </label>
              <input
                type="text"
                value={professorOrLead}
                onChange={(e) => setProfessorOrLead(e.target.value)}
                placeholder="Dr. Smith"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Room / Location
              </label>
              <input
                type="text"
                value={roomOrLocation}
                onChange={(e) => setRoomOrLocation(e.target.value)}
                placeholder="Hall 302"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Syllabus / Goal Completion ({syllabusProgress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={syllabusProgress}
              onChange={(e) => setSyllabusProgress(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Focus Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important topics, lab requirements, office hours..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs resize-none"
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
              Save Category
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
