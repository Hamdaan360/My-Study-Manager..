import React, { useState } from 'react';
import { 
  Flame, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  KeyRound, 
  ArrowRight,
  AlertCircle,
  Plus,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, ProductivityGoals } from '../types';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  longestStreak: number;
  tasks: Task[];
  onRestoreStreak: (taskId?: string) => void;
  onRestartStreak: () => void;
  onSelectTaskForTimer: (task: Task) => void;
  onOpenNewTaskModal: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  longestStreak,
  tasks,
  onRestoreStreak,
  onRestartStreak,
  onSelectTaskForTimer,
  onOpenNewTaskModal
}) => {
  const [activeTab, setActiveTab] = useState<'restore' | 'restart'>('restore');
  const [restartPassword, setRestartPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const incompleteTasks = tasks.filter(t => t.status !== 'completed');

  const handleTaskRescueComplete = (task: Task) => {
    onRestoreStreak(task.id);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
    setSuccessMessage(`Streak successfully restored! Task "${task.title}" completed.`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 2000);
  };

  const handleInstantRescueTask = () => {
    onRestoreStreak();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
    setSuccessMessage('Streak successfully restored! 1 Rescue Study Task logged.');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 2000);
  };

  const handleRestartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Required password: ' Let's Restart ' (flexible for spaces)
    const normalized = restartPassword.trim();
    if (normalized === "Let's Restart" || restartPassword === " Let's Restart ") {
      onRestartStreak();
      setSuccessMessage("Streak reset verified with password. Fresh Day 1 momentum started!");
      setTimeout(() => {
        setSuccessMessage(null);
        setRestartPassword('');
        onClose();
      }, 2000);
    } else {
      setErrorMessage("Incorrect password! You must enter: ' Let's Restart '");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/20 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Streak Guardian &amp; Manager
              </h3>
              <p className="text-xs text-slate-400">
                Current Streak: <strong className="text-amber-400 font-mono">{streakCount} Days</strong> (Best: {longestStreak}d)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher: Restore vs Re-start */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => { setActiveTab('restore'); setErrorMessage(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'restore'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Restore Streak</span>
          </button>

          <button
            onClick={() => { setActiveTab('restart'); setErrorMessage(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'restart'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-300" />
            <span>Re-start Streak</span>
          </button>
        </div>

        {/* Success / Error Banners */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Restore Streak (Requires 1 Task Completion) */}
        {activeTab === 'restore' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Streak Restore Rule
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To resurrect and restore your streak, complete <strong>at least 1 task</strong> right now! Choose a pending task below or log an emergency rescue study sprint.
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {incompleteTasks.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-white/10 space-y-3">
                  <p className="text-xs text-slate-400">No pending tasks currently exist.</p>
                  <button
                    onClick={handleInstantRescueTask}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Log 1 Rescue Task &amp; Restore Streak
                  </button>
                </div>
              ) : (
                incompleteTasks.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-200 block truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Due: {task.dueDate} • {task.estimatedMinutes}m
                      </span>
                    </div>

                    <button
                      onClick={() => handleTaskRescueComplete(task)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs shrink-0 transition-all cursor-pointer"
                    >
                      Complete &amp; Restore
                    </button>
                  </div>
                ))
              )}
            </div>

            {incompleteTasks.length > 0 && (
              <div className="pt-2 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleInstantRescueTask}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Or Log 1 Emergency Rescue Sprint Directly →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Re-start Streak (Requires Password ' Let's Restart ') */}
        {activeTab === 'restart' && (
          <form onSubmit={handleRestartSubmit} className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Streak Re-start Security Gate
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Starting your study streak fresh from Day 1 requires conscious intent. 
                Type the exact confirmation phrase below to reset:
              </p>
              <div className="p-2 rounded-xl bg-slate-950 font-mono text-xs text-amber-300 font-bold text-center border border-white/10 select-all">
                Let's Restart
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                Enter Password *
              </label>
              <input
                type="text"
                value={restartPassword}
                onChange={(e) => setRestartPassword(e.target.value)}
                placeholder="Type: Let's Restart"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-xs font-mono"
                required
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
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Confirm Re-start (Day 1)
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
