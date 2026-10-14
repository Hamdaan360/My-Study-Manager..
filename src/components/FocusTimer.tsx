import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Coffee, 
  Zap, 
  Music, 
  Sliders,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, SubjectCategory, StudySession } from '../types';
import { soundManager } from '../utils/audio';

interface FocusTimerProps {
  categories: SubjectCategory[];
  tasks: Task[];
  activeTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onSessionComplete: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  onTaskProgressUpdate: (taskId: string, minutesAdded: number) => void;
}

type TimerPreset = 'pomodoro' | 'deep_focus' | 'ultra_study' | 'custom' | 'short_break' | 'long_break';
type SoundPreset = 'none' | 'binaural_focus' | 'alpha_flow' | 'rain' | 'library_brown';

export const FocusTimer: React.FC<FocusTimerProps> = ({
  categories,
  tasks,
  activeTask,
  onSelectTask,
  onSessionComplete,
  onTaskProgressUpdate
}) => {
  const [preset, setPreset] = useState<TimerPreset>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Custom slider minutes
  const [customMinutes, setCustomMinutes] = useState(30);

  // Audio state
  const [currentSound, setCurrentSound] = useState<SoundPreset>('none');
  const [soundVolume, setSoundVolume] = useState(0.4);

  // Fallback category if no task selected
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Preset definitions
  const presetMinutesMap: Record<TimerPreset, number> = {
    pomodoro: 25,
    deep_focus: 50,
    ultra_study: 90,
    short_break: 5,
    long_break: 15,
    custom: customMinutes
  };

  const handleSelectPreset = (newPreset: TimerPreset) => {
    setIsRunning(false);
    setPreset(newPreset);
    const mins = newPreset === 'custom' ? customMinutes : presetMinutesMap[newPreset];
    const secs = mins * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
  };

  const handleCustomSliderChange = (mins: number) => {
    setCustomMinutes(mins);
    if (preset === 'custom') {
      const secs = mins * 60;
      setTotalSeconds(secs);
      setSecondsRemaining(secs);
    }
  };

  // Sound selection
  const handleSoundChange = (sound: SoundPreset) => {
    setCurrentSound(sound);
    soundManager.startSoundscape(sound, soundVolume);
  };

  const handleVolumeChange = (vol: number) => {
    setSoundVolume(vol);
    soundManager.setVolume(vol);
  };

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSeconds, preset, activeTask, selectedCategoryId]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      soundManager.stopSoundscape();
    };
  }, []);

  const handleCompleteSession = () => {
    setIsRunning(false);
    soundManager.playCompletionChime();

    // Trigger celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const sessionMinutes = Math.max(1, Math.round((totalSeconds - secondsRemaining) / 60) || Math.round(totalSeconds / 60));
    
    // Determine category
    const cat = activeTask 
      ? categories.find(c => c.id === activeTask.categoryId) 
      : categories.find(c => c.id === selectedCategoryId) || categories[0];

    const todayStr = new Date().toISOString().split('T')[0];

    onSessionComplete({
      taskId: activeTask?.id,
      taskTitle: activeTask?.title,
      categoryId: cat?.id || 'general',
      categoryName: cat?.name || 'General Study',
      categoryColor: cat?.color || '#6366f1',
      categoryType: cat?.type || 'subject',
      durationMinutes: sessionMinutes,
      date: todayStr,
      mode: preset
    });

    if (activeTask) {
      onTaskProgressUpdate(activeTask.id, sessionMinutes);
    }

    // Reset to preset
    setSecondsRemaining(totalSeconds);
  };

  const handleTogglePlay = () => {
    if (!isRunning && currentSound !== 'none') {
      soundManager.startSoundscape(currentSound, soundVolume);
    }
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
  };

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const currentCategory = activeTask 
    ? categories.find(c => c.id === activeTask.categoryId) 
    : categories.find(c => c.id === selectedCategoryId);

  const incompleteTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className={`space-y-8 animate-fade-in ${isFullscreen ? 'fixed inset-0 z-50 bg-[#070b14] p-6 sm:p-12 overflow-y-auto flex flex-col justify-between' : ''}`}>
      
      {/* Top Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Deep Work Engine
            </span>
            <span className="text-xs text-slate-400">High-Retention Study Modes</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Focus &amp; Flow Timer
          </h2>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Exit Zen Mode</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Zen Fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 max-w-2xl mx-auto">
        <button
          onClick={() => handleSelectPreset('pomodoro')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            preset === 'pomodoro' 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pomodoro (25m)
        </button>

        <button
          onClick={() => handleSelectPreset('deep_focus')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            preset === 'deep_focus' 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Deep Focus (50m)
        </button>

        <button
          onClick={() => handleSelectPreset('ultra_study')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            preset === 'ultra_study' 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Ultra Study (90m)
        </button>

        <button
          onClick={() => handleSelectPreset('short_break')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            preset === 'short_break' 
              ? 'bg-teal-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          Break (5m)
        </button>

        <button
          onClick={() => handleSelectPreset('custom')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            preset === 'custom' 
              ? 'bg-slate-700 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Custom ({customMinutes}m)
        </button>
      </div>

      {/* Custom Duration Slider */}
      {preset === 'custom' && (
        <div className="max-w-md mx-auto p-4 rounded-2xl glass-panel border border-white/10 space-y-2 animate-fade-in">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Set Duration:</span>
            <span className="font-mono text-emerald-400 font-bold">{customMinutes} Minutes</span>
          </div>
          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={customMinutes}
            onChange={(e) => handleCustomSliderChange(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {/* Main Circular Timer Display */}
      <div className="relative flex flex-col items-center justify-center my-6">
        
        {/* Glowing Background Radial Halo */}
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 transition-all duration-1000 pointer-events-none"
          style={{ backgroundColor: currentCategory?.color || '#6366f1' }}
        />

        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress Bar with Glow */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={currentCategory?.color || '#6366f1'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />
          </svg>

          {/* Time digits & Task Info in Center */}
          <div className="absolute flex flex-col items-center justify-center text-center p-4">
            
            {/* Current Active Category Tag */}
            <div 
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider mb-2 border"
              style={{
                backgroundColor: `${currentCategory?.color || '#6366f1'}20`,
                color: currentCategory?.color || '#a5b4fc',
                borderColor: `${currentCategory?.color || '#6366f1'}40`
              }}
            >
              {currentCategory?.code || 'STUDY'}
            </div>

            {/* Formatted Countdown */}
            <div className="text-5xl sm:text-6xl font-extrabold text-white font-mono tracking-tight drop-shadow-md">
              {formatTime(secondsRemaining)}
            </div>

            {/* Active task label */}
            <div className="max-w-[200px] truncate text-xs text-slate-300 font-medium mt-2">
              {activeTask ? activeTask.title : 'General Focused Study'}
            </div>

            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {Math.round(progressPercent)}% completed
            </div>

          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleResetTimer}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all active:scale-95 cursor-pointer ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-slate-950" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleteSession}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400 transition-all active:scale-95"
            title="Complete &amp; Log Session Now"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Two-Card Row: Task Linker & Ambient Sound Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* Card 1: Task Linker */}
        <div className="glass-panel-elevated p-5 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Link Study Task
            </h3>
            {activeTask && (
              <button 
                onClick={() => onSelectTask(null)}
                className="text-[11px] text-slate-400 hover:text-rose-400"
              >
                Clear Link
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              Select specific task to track progress:
            </label>
            <select
              value={activeTask?.id || ''}
              onChange={(e) => {
                const found = tasks.find(t => t.id === e.target.value);
                onSelectTask(found || null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
            >
              <option value="">-- No specific task (General study) --</option>
              {incompleteTasks.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <option key={t.id} value={t.id}>
                    [{cat?.code || 'Task'}] {t.title}
                  </option>
                );
              })}
            </select>
          </div>

          {!activeTask && (
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                Or select category to credit study time:
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'college' ? '🏛️ ' : '📚 '} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTask && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
              <div>
                <span className="font-semibold block truncate max-w-[220px]">{activeTask.title}</span>
                <span className="text-[11px] text-indigo-300">
                  {activeTask.completedMinutes}m logged of {activeTask.estimatedMinutes}m est.
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round((activeTask.completedMinutes / Math.max(1, activeTask.estimatedMinutes)) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Card 2: Ambient Soundscape Generator */}
        <div className="glass-panel-elevated p-5 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-emerald-400" />
              Ambient Focus Soundscapes
            </h3>
            {currentSound !== 'none' && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSoundChange(currentSound === 'binaural_focus' ? 'none' : 'binaural_focus')}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                currentSound === 'binaural_focus'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                🧠 40Hz Gamma
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Logic &amp; Coding</div>
            </button>

            <button
              onClick={() => handleSoundChange(currentSound === 'alpha_flow' ? 'none' : 'alpha_flow')}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                currentSound === 'alpha_flow'
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                🌊 10Hz Alpha
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Calm Flow State</div>
            </button>

            <button
              onClick={() => handleSoundChange(currentSound === 'rain' ? 'none' : 'rain')}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                currentSound === 'rain'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                  : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                🌧️ Gentle Rain
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cozy White Noise</div>
            </button>

            <button
              onClick={() => handleSoundChange(currentSound === 'library_brown' ? 'none' : 'library_brown')}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                currentSound === 'library_brown'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                ☕ Brown Noise
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Warm Library Hum</div>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => handleSoundChange('none')}
              className="text-slate-400 hover:text-white"
            >
              {currentSound === 'none' ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
            />
            <span className="font-mono text-[10px] text-slate-400 w-8 text-right">
              {Math.round(soundVolume * 100)}%
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
