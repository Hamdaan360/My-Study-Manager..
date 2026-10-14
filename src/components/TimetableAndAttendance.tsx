import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  MapPin, 
  User, 
  Flame, 
  RotateCcw, 
  Coffee, 
  Dumbbell, 
  GraduationCap, 
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  SubjectCategory, 
  AttendanceSubject, 
  AttendanceLog, 
  TimetableSlot, 
  DayRoutineBlock, 
  DayOfWeek, 
  RoutineActivityType 
} from '../types';
import { formatLocalDate } from '../utils/storage';

interface TimetableAndAttendanceProps {
  categories: SubjectCategory[];
  attendance: AttendanceSubject[];
  attendanceLogs: AttendanceLog[];
  collegeTimetable: TimetableSlot[];
  dayRoutine: DayRoutineBlock[];
  onUpdateAttendance: (attendance: AttendanceSubject[]) => void;
  onAddAttendanceLog: (log: AttendanceLog) => void;
  onUpdateCollegeTimetable: (timetable: TimetableSlot[]) => void;
  onUpdateDayRoutine: (routine: DayRoutineBlock[]) => void;
  onSelectSubjectFolder?: (subjectId: string) => void;
}

export const TimetableAndAttendance: React.FC<TimetableAndAttendanceProps> = ({
  categories,
  attendance,
  attendanceLogs,
  collegeTimetable,
  dayRoutine,
  onUpdateAttendance,
  onAddAttendanceLog,
  onUpdateCollegeTimetable,
  onUpdateDayRoutine,
  onSelectSubjectFolder
}) => {
  const [activeTab, setActiveTab] = useState<'day_routine' | 'college_timetable' | 'attendance'>('day_routine');

  // Days of week
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = (new Date().toLocaleString('en-US', { weekday: 'long' }) as DayOfWeek);
  const initialDay: DayOfWeek = days.includes(todayDayName) ? todayDayName : 'Monday';
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialDay);
  const [timetableFilter, setTimetableFilter] = useState<'day' | 'all'>('day');

  // Modal states for Timetable slot
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [slotDay, setSlotDay] = useState<DayOfWeek>(initialDay);
  const [slotStart, setSlotStart] = useState('09:00');
  const [slotEnd, setSlotEnd] = useState('10:00');
  const [slotSubjectId, setSlotSubjectId] = useState(categories[0]?.id || 'sub-physics');
  const [slotType, setSlotType] = useState<TimetableSlot['type']>('lecture');
  const [slotRoom, setSlotRoom] = useState('');
  const [slotProfessor, setSlotProfessor] = useState('');

  // Modal states for Day Routine block
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<DayRoutineBlock | null>(null);
  const [routineStart, setRoutineStart] = useState('06:30');
  const [routineEnd, setRoutineEnd] = useState('07:30');
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineType, setRoutineType] = useState<RoutineActivityType>('study');
  const [routineSubjectId, setRoutineSubjectId] = useState<string>('');
  const [routineNotes, setRoutineNotes] = useState('');

  // Manual Attendance Edit Modal
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingAttendanceSubId, setEditingAttendanceSubId] = useState<string | null>(null);
  const [manualAttended, setManualAttended] = useState<number>(0);
  const [manualTotal, setManualTotal] = useState<number>(0);
  const [manualTarget, setManualTarget] = useState<number>(75);

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Ensure every subject category has an attendance entry
  const fullAttendance = categories.map(cat => {
    const existing = attendance.find(a => a.subjectId === cat.id);
    return existing || {
      subjectId: cat.id,
      totalClasses: 0,
      attendedClasses: 0,
      minimumTargetPercent: 75
    };
  });

  // Attendance Calculations
  const overallAttended = fullAttendance.reduce((acc, a) => acc + a.attendedClasses, 0);
  const overallTotal = fullAttendance.reduce((acc, a) => acc + a.totalClasses, 0);
  const overallPercent = overallTotal > 0 ? ((overallAttended / overallTotal) * 100).toFixed(1) : '100.0';
  const subjectsBelowTarget = fullAttendance.filter(a => {
    if (a.totalClasses === 0) return false;
    const p = (a.attendedClasses / a.totalClasses) * 100;
    return p < a.minimumTargetPercent;
  }).length;

  // Mark Attendance helper (Present / Absent)
  const handleMarkAttendance = (subjectId: string, status: 'present' | 'absent') => {
    const updated = fullAttendance.map(item => {
      if (item.subjectId === subjectId) {
        return {
          ...item,
          totalClasses: item.totalClasses + 1,
          attendedClasses: status === 'present' ? item.attendedClasses + 1 : item.attendedClasses
        };
      }
      return item;
    });

    onUpdateAttendance(updated);

    onAddAttendanceLog({
      id: `att-${Date.now()}`,
      subjectId,
      date: formatLocalDate(),
      status,
      note: `Marked ${status}`
    });

    if (status === 'present') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  // Open manual edit for attendance
  const openEditAttendance = (item: AttendanceSubject) => {
    setEditingAttendanceSubId(item.subjectId);
    setManualAttended(item.attendedClasses);
    setManualTotal(item.totalClasses);
    setManualTarget(item.minimumTargetPercent || 75);
    setIsAttendanceModalOpen(true);
  };

  const handleSaveManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendanceSubId) return;

    const safeAttended = Math.max(0, Number(manualAttended) || 0);
    const safeTotal = Math.max(safeAttended, Number(manualTotal) || 0);
    const safeTarget = Math.min(100, Math.max(50, Number(manualTarget) || 75));

    const updated = fullAttendance.map(item => {
      if (item.subjectId === editingAttendanceSubId) {
        return {
          ...item,
          attendedClasses: safeAttended,
          totalClasses: safeTotal,
          minimumTargetPercent: safeTarget
        };
      }
      return item;
    });

    onUpdateAttendance(updated);
    setIsAttendanceModalOpen(false);
  };

  // College Timetable CRUD
  const handleOpenSlotModal = (slot?: TimetableSlot) => {
    if (slot) {
      setEditingSlot(slot);
      setSlotDay(slot.day);
      setSlotStart(slot.startTime);
      setSlotEnd(slot.endTime);
      setSlotSubjectId(slot.subjectId);
      setSlotType(slot.type);
      setSlotRoom(slot.roomOrLocation || '');
      setSlotProfessor(slot.professor || '');
    } else {
      setEditingSlot(null);
      setSlotDay(selectedDay);
      setSlotStart('09:00');
      setSlotEnd('10:00');
      setSlotSubjectId(categories[0]?.id || 'sub-physics');
      setSlotType('lecture');
      setSlotRoom('');
      setSlotProfessor('');
    }
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categoryMap.get(slotSubjectId);

    if (editingSlot) {
      const updated = collegeTimetable.map(s => s.id === editingSlot.id ? {
        ...s,
        day: slotDay,
        startTime: slotStart,
        endTime: slotEnd,
        subjectId: slotSubjectId,
        subjectName: cat?.name || slotSubjectId,
        type: slotType,
        roomOrLocation: slotRoom.trim() || undefined,
        professor: slotProfessor.trim() || undefined
      } : s);
      onUpdateCollegeTimetable(updated);
    } else {
      const newSlot: TimetableSlot = {
        id: `tt-${Date.now()}`,
        day: slotDay,
        startTime: slotStart,
        endTime: slotEnd,
        subjectId: slotSubjectId,
        subjectName: cat?.name || 'Academic Class',
        type: slotType,
        roomOrLocation: slotRoom.trim() || undefined,
        professor: slotProfessor.trim() || undefined
      };
      onUpdateCollegeTimetable([...collegeTimetable, newSlot]);
    }

    setIsSlotModalOpen(false);
  };

  const handleDeleteSlot = (id: string) => {
    onUpdateCollegeTimetable(collegeTimetable.filter(s => s.id !== id));
  };

  // Day Routine CRUD (Editable when plan changes)
  const handleOpenRoutineModal = (block?: DayRoutineBlock) => {
    if (block) {
      setEditingRoutine(block);
      setRoutineStart(block.startTime);
      setRoutineEnd(block.endTime);
      setRoutineTitle(block.title);
      setRoutineType(block.activityType);
      setRoutineSubjectId(block.subjectId || '');
      setRoutineNotes(block.notes || '');
    } else {
      setEditingRoutine(null);
      setRoutineStart('14:00');
      setRoutineEnd('15:30');
      setRoutineTitle('');
      setRoutineType('study');
      setRoutineSubjectId(categories[0]?.id || '');
      setRoutineNotes('');
    }
    setIsRoutineModalOpen(true);
  };

  const handleSaveRoutineBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTitle.trim()) return;

    if (editingRoutine) {
      const updated = dayRoutine.map(b => b.id === editingRoutine.id ? {
        ...b,
        startTime: routineStart,
        endTime: routineEnd,
        title: routineTitle.trim(),
        activityType: routineType,
        subjectId: routineSubjectId || undefined,
        notes: routineNotes.trim() || undefined
      } : b);
      onUpdateDayRoutine(updated);
    } else {
      const newBlock: DayRoutineBlock = {
        id: `dr-${Date.now()}`,
        startTime: routineStart,
        endTime: routineEnd,
        title: routineTitle.trim(),
        activityType: routineType,
        subjectId: routineSubjectId || undefined,
        notes: routineNotes.trim() || undefined,
        isCompleted: false
      };
      // Insert sorted by startTime
      const all = [...dayRoutine, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime));
      onUpdateDayRoutine(all);
    }

    setIsRoutineModalOpen(false);
  };

  const handleDeleteRoutineBlock = (id: string) => {
    onUpdateDayRoutine(dayRoutine.filter(b => b.id !== id));
  };

  const handleToggleRoutineBlockDone = (id: string) => {
    const updated = dayRoutine.map(b => {
      if (b.id === id) {
        const next = !b.isCompleted;
        if (next) {
          confetti({
            particleCount: 45,
            spread: 55,
            origin: { y: 0.7 }
          });
        }
        return { ...b, isCompleted: next };
      }
      return b;
    });
    onUpdateDayRoutine(updated);
  };

  const handleApplyPresetRoutine = (presetType: 'standard' | 'weekend' | 'exam') => {
    if (presetType === 'exam') {
      onUpdateDayRoutine([
        { id: `dr-ex-1`, startTime: '06:00', endTime: '07:00', title: 'Wake up, Active Recall & Formula Sheets', activityType: 'revision', notes: 'Quick formula scanning' },
        { id: `dr-ex-2`, startTime: '07:30', endTime: '10:30', title: 'Exam Hall / Mock Exam Paper Simulation', activityType: 'college', notes: 'Solve 3-hour exam paper with clock' },
        { id: `dr-ex-3`, startTime: '11:00', endTime: '12:00', title: 'Paper Analysis & Error Log', activityType: 'study', notes: 'Find weak topics and formula gaps' },
        { id: `dr-ex-4`, startTime: '12:30', endTime: '13:30', title: 'Lunch & Power Nap', activityType: 'break', notes: 'Recharge mental energy' },
        { id: `dr-ex-5`, startTime: '14:00', endTime: '17:00', title: 'High-Yield Topic Revision Block 1', activityType: 'study', notes: 'Numerical problems and definitions' },
        { id: `dr-ex-6`, startTime: '17:30', endTime: '18:30', title: 'Fresh Air Walk & Dinner', activityType: 'routine', notes: 'No books, clear your mind' },
        { id: `dr-ex-7`, startTime: '19:00', endTime: '22:00', title: 'High-Yield Topic Revision Block 2', activityType: 'study', notes: 'Review previous year questions (PYQs)' },
        { id: `dr-ex-8`, startTime: '22:30', endTime: '06:00', title: 'Early Sleep (Essential for Exam Day Cognition)', activityType: 'routine', notes: '8 hours restful sleep' },
      ]);
    } else if (presetType === 'weekend') {
      onUpdateDayRoutine([
        { id: `dr-wk-1`, startTime: '07:30', endTime: '08:30', title: 'Morning Exercise & Nutritious Breakfast', activityType: 'exercise', notes: 'Full body workout' },
        { id: `dr-wk-2`, startTime: '09:00', endTime: '12:00', title: 'Weekend Marathon Study Session 1 (Difficult Subjects)', activityType: 'study', subjectId: 'sub-physics', notes: 'Physics Quantum Mechanics & Maths' },
        { id: `dr-wk-3`, startTime: '12:00', endTime: '13:30', title: 'Lunch & Relax', activityType: 'break', notes: 'Enjoy healthy meal' },
        { id: `dr-wk-4`, startTime: '14:00', endTime: '17:00', title: 'Weekend Marathon Study Session 2 (Coding & Practical)', activityType: 'study', subjectId: 'sub-cs-1', notes: 'Data structures implementation' },
        { id: `dr-wk-5`, startTime: '17:30', endTime: '19:00', title: 'Outdoor Sports / Friends / Social Time', activityType: 'break', notes: 'Recharge for the week' },
        { id: `dr-wk-6`, startTime: '19:30', endTime: '21:30', title: 'Weekly Syllabus Review & Assignment Completion', activityType: 'revision', notes: 'Submit pending coursework' },
        { id: `dr-wk-7`, startTime: '22:00', endTime: '07:30', title: 'Restorative Sleep', activityType: 'routine', notes: 'Sleep well' },
      ]);
    }
  };

  // Activity type badge colors
  const getActivityBadge = (type: RoutineActivityType) => {
    switch (type) {
      case 'study':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">📚 Deep Study</span>;
      case 'college':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">🏛️ College</span>;
      case 'revision':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">⚡ Quick Revision</span>;
      case 'exercise':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">🏃 Workout</span>;
      case 'break':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">☕ Break</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">☀️ Routine</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Academic Operations &amp; Routine Hub
              </span>
              <span className="text-xs text-slate-400">
                Attendance • College Timetable • Daily Routine
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Attendance &amp; Schedule Manager
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track lecture attendance percentages, maintain minimum 75% criteria, follow college class timetables, and dynamically edit your daily study routine whenever plans shift.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Overall Attendance</span>
              <span className={`text-2xl font-black font-mono ${Number(overallPercent) >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {overallPercent}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {overallAttended} of {overallTotal} classes
              </span>
            </div>

            {subjectsBelowTarget > 0 ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center min-w-[120px]">
                <span className="text-[10px] font-mono text-rose-300 uppercase tracking-wider block">Shortage Alert</span>
                <span className="text-2xl font-black font-mono text-rose-400">
                  {subjectsBelowTarget} Sub
                </span>
                <span className="text-[10px] text-rose-300 block mt-0.5">Below Target</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center min-w-[120px]">
                <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">Criteria Status</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  Safe
                </span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">All above 75%</span>
              </div>
            )}
          </div>
        </div>

        {/* Segmented View Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 max-w-xl flex-wrap">
          <button
            onClick={() => setActiveTab('day_routine')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'day_routine'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Day Time Table (Editable)</span>
          </button>

          <button
            onClick={() => setActiveTab('college_timetable')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'college_timetable'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>College Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Attendance Tracker</span>
          </button>
        </div>

      </div>

      {/* TAB 1: MY DAY TIME TABLE (EDITABLE) */}
      {activeTab === 'day_routine' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Action & Preset Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Today's Daily Routine &amp; Study Schedule</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any slot to edit times or change activity when your plan shifts!
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Routine presets */}
              <button
                onClick={() => handleApplyPresetRoutine('exam')}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold cursor-pointer"
                title="Apply Exam Week Schedule"
              >
                📝 Exam Mode
              </button>
              <button
                onClick={() => handleApplyPresetRoutine('weekend')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer"
                title="Apply Weekend Study Marathon"
              >
                🚀 Weekend Plan
              </button>
              <button
                onClick={() => handleOpenRoutineModal()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Time Slot</span>
              </button>
            </div>
          </div>

          {/* Routine Blocks List */}
          <div className="space-y-3">
            {dayRoutine.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl glass-panel-elevated border border-dashed border-white/10 space-y-3">
                <Clock className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Routine Slots Configured</h3>
                <p className="text-xs text-slate-400">Add your first time block or apply a preset plan.</p>
                <button
                  onClick={() => handleOpenRoutineModal()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  + Add First Slot
                </button>
              </div>
            ) : (
              dayRoutine.map((block, index) => {
                const sub = block.subjectId ? categoryMap.get(block.subjectId) : null;
                const isDone = block.isCompleted;

                return (
                  <div
                    key={block.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      isDone
                        ? 'bg-slate-900/40 border-emerald-500/30 opacity-75'
                        : 'glass-panel-elevated hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Completion checkbox */}
                      <button
                        onClick={() => handleToggleRoutineBlockDone(block.id)}
                        className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-400 cursor-pointer shrink-0"
                        title={isDone ? "Mark incomplete" : "Mark completed"}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      {/* Time Range Badge */}
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10 shrink-0 text-center min-w-[110px]">
                        <span className="font-mono text-xs font-extrabold text-white block">
                          {block.startTime} - {block.endTime}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Slot #{index + 1}
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                            {block.title}
                          </h4>
                          {getActivityBadge(block.activityType)}
                          {sub && (
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                              style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                            >
                              {sub.code}
                            </span>
                          )}
                        </div>

                        {block.notes && (
                          <p className="text-xs text-slate-400 truncate max-w-xl">
                            {block.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <button
                        onClick={() => handleOpenRoutineModal(block)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 cursor-pointer transition-colors"
                        title="Edit slot when plan changes"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit Plan</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRoutineBlock(block.id)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 cursor-pointer transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 2: COLLEGE TIMETABLE */}
      {activeTab === 'college_timetable' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Day Selector & Add Class Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {days.map(day => {
                const isSelected = selectedDay === day;
                const isToday = day === todayDayName;
                const count = collegeTimetable.filter(s => s.day === day).length;

                return (
                  <button
                    key={day}
                    onClick={() => { setSelectedDay(day); setTimetableFilter('day'); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : isToday
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{day.slice(0, 3)}</span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}

              <button
                onClick={() => setTimetableFilter(timetableFilter === 'all' ? 'day' : 'all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timetableFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                View Full Week
              </button>
            </div>

            <button
              onClick={() => handleOpenSlotModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add College Lecture</span>
            </button>
          </div>

          {/* Timetable Cards */}
          {timetableFilter === 'day' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>{selectedDay} Schedule ({collegeTimetable.filter(s => s.day === selectedDay).length} Classes)</span>
                {selectedDay === todayDayName && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Today's Active Schedule
                  </span>
                )}
              </div>

              {collegeTimetable.filter(s => s.day === selectedDay).length === 0 ? (
                <div className="text-center py-16 px-4 rounded-3xl glass-panel-elevated border border-dashed border-white/10 space-y-3">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Classes on {selectedDay}</h3>
                  <p className="text-xs text-slate-400">Add a lecture, lab, or tutorial period for this day.</p>
                  <button
                    onClick={() => handleOpenSlotModal()}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                  >
                    + Add Class Slot
                  </button>
                </div>
              ) : (
                collegeTimetable
                  .filter(s => s.day === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(slot => {
                    const sub = categoryMap.get(slot.subjectId);

                    return (
                      <div
                        key={slot.id}
                        className="glass-panel-elevated p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start md:items-center gap-4 min-w-0">
                          {/* Time badge */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-center min-w-[110px] shrink-0">
                            <span className="font-mono text-xs font-extrabold text-white block">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                              {slot.type}
                            </span>
                          </div>

                          {/* Subject details */}
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold text-white">
                                {slot.subjectName}
                              </h4>
                              {sub && (
                                <span 
                                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                                  style={{ backgroundColor: `${sub.color}25`, color: sub.color }}
                                >
                                  {sub.code}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                              {slot.roomOrLocation && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {slot.roomOrLocation}
                                </span>
                              )}
                              {slot.professor && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  {slot.professor}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Mark Attendance for this class */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                          <button
                            onClick={() => handleMarkAttendance(slot.subjectId, 'present')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold cursor-pointer transition-all"
                            title="Attended this lecture"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            onClick={() => handleMarkAttendance(slot.subjectId, 'absent')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer transition-all"
                            title="Missed this lecture"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          <button
                            onClick={() => handleOpenSlotModal(slot)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                            title="Edit slot"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 cursor-pointer"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          ) : (
            /* Full Week Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map(day => {
                const daySlots = collegeTimetable
                  .filter(s => s.day === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div key={day} className="glass-panel-elevated p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{day}</span>
                      <span className="text-xs font-mono text-slate-400">{daySlots.length} Classes</span>
                    </div>

                    <div className="space-y-2">
                      {daySlots.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No classes scheduled</p>
                      ) : (
                        daySlots.map(s => {
                          const sub = categoryMap.get(s.subjectId);
                          return (
                            <div key={s.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-mono text-slate-300 font-semibold">{s.startTime} - {s.endTime}</span>
                                <span className="text-[10px] text-blue-300 font-bold uppercase">{s.type}</span>
                              </div>
                              <div className="text-xs font-bold text-white truncate">{s.subjectName}</div>
                              {s.roomOrLocation && (
                                <div className="text-[10px] text-slate-400 truncate">{s.roomOrLocation}</div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: ATTENDANCE TRACKER */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Attendance Guidance Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Target Attendance Requirement: 75%</h4>
                <p className="text-xs text-slate-300">
                  Keep attendance above 75% to appear in final semester examinations without medical condonation.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Click <strong className="text-emerald-400">+ Present</strong> or <strong className="text-rose-400">+ Absent</strong> to log each lecture.
            </div>
          </div>

          {/* Subject Attendance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fullAttendance.map(att => {
              const cat = categoryMap.get(att.subjectId);
              const percentage = att.totalClasses > 0 ? (att.attendedClasses / att.totalClasses) * 100 : 100;
              const formattedPercent = percentage.toFixed(1);
              const target = att.minimumTargetPercent || 75;

              const isSafe = percentage >= target;
              const isDanger = percentage < target;

              // Calculate Bunks / Recovery:
              // Safe misses: How many classes can miss while staying >= target:
              // (attended / (total + x)) >= (target / 100) => x = floor((attended * 100 / target) - total)
              const safeBunks = Math.max(0, Math.floor((att.attendedClasses * 100) / target) - att.totalClasses);

              // Classes to attend consecutively to reach target:
              // (attended + y) / (total + y) >= target / 100 => y = ceil((target * total - 100 * attended) / (100 - target))
              const requiredConsecutive = isDanger 
                ? Math.ceil((target * att.totalClasses - 100 * att.attendedClasses) / (100 - target))
                : 0;

              return (
                <div
                  key={att.subjectId}
                  className="glass-panel-elevated p-5 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Top Subject Color Bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: cat?.color || '#6366f1' }}
                  />

                  {/* Header info */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{ backgroundColor: `${cat?.color || '#6366f1'}25`, color: cat?.color || '#fff' }}
                      >
                        {cat?.code || 'SUB'}
                      </span>

                      <button
                        onClick={() => openEditAttendance(att)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer text-[11px] flex items-center gap-1"
                        title="Edit exact counts"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white truncate">
                      {cat?.name || 'Academic Subject'}
                    </h3>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400 font-mono">
                        Attended: <strong className="text-white">{att.attendedClasses}</strong> / {att.totalClasses}
                      </span>
                      <span className={`text-xl font-black font-mono ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formattedPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 mt-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          isSafe ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* High Achiever Advice / Safe Bunks */}
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-xs">
                    {isSafe ? (
                      <div className="text-emerald-300 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          {safeBunks > 0 
                            ? `Safe to miss next ${safeBunks} class${safeBunks > 1 ? 'es' : ''} without shortage.`
                            : 'On exact boundary! Don\'t miss next class.'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-rose-300 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>
                          Shortage! Attend next <strong>{requiredConsecutive}</strong> consecutive classes to hit {target}%.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons: Present / Absent */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleMarkAttendance(att.subjectId, 'present')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>+ Present</span>
                    </button>

                    <button
                      onClick={() => handleMarkAttendance(att.subjectId, 'absent')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>+ Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODAL 1: ADD / EDIT COLLEGE TIMETABLE SLOT */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded-3xl border border-white/20 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingSlot ? 'Edit College Class' : 'Add College Class Slot'}
              </h3>
              <button 
                onClick={() => setIsSlotModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                >
                  {days.map(d => (
                    <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                  >
                    <option value="lecture" className="bg-slate-900 text-white">Lecture</option>
                    <option value="lab" className="bg-slate-900 text-white">Lab / Practical</option>
                    <option value="tutorial" className="bg-slate-900 text-white">Tutorial</option>
                    <option value="break" className="bg-slate-900 text-white">Break</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    placeholder="e.g. Hall 201"
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Professor / Instructor</label>
                <input
                  type="text"
                  value={slotProfessor}
                  onChange={(e) => setSlotProfessor(e.target.value)}
                  placeholder="e.g. Dr. Sharma"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT DAY ROUTINE BLOCK (EDITABLE WHEN PLANS SHIFT) */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated p-6 rounded-3xl border border-white/20 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingRoutine ? 'Edit Daily Routine Block' : 'Add Routine Time Block'}
                </h3>
                <p className="text-xs text-slate-400">Adjust timings whenever your daily schedule changes.</p>
              </div>
              <button 
                onClick={() => setIsRoutineModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoutineBlock} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={routineStart}
                    onChange={(e) => setRoutineStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={routineEnd}
                    onChange={(e) => setRoutineEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Routine Activity Title</label>
                <input
                  type="text"
                  value={routineTitle}
                  onChange={(e) => setRoutineTitle(e.target.value)}
                  placeholder="e.g. Deep Study Slot 1: Physics Chapter 2"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Category</label>
                  <select
                    value={routineType}
                    onChange={(e) => setRoutineType(e.target.value as RoutineActivityType)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                  >
                    <option value="study" className="bg-slate-900 text-white">Deep Study</option>
                    <option value="revision" className="bg-slate-900 text-white">Revision</option>
                    <option value="college" className="bg-slate-900 text-white">College / Lectures</option>
                    <option value="exercise" className="bg-slate-900 text-white">Workout / Exercise</option>
                    <option value="break" className="bg-slate-900 text-white">Break / Relax</option>
                    <option value="routine" className="bg-slate-900 text-white">Personal Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Linked Subject (Optional)</label>
                  <select
                    value={routineSubjectId}
                    onChange={(e) => setRoutineSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                  >
                    <option value="" className="bg-slate-900 text-white">None (General)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Plan Details</label>
                <textarea
                  value={routineNotes}
                  onChange={(e) => setRoutineNotes(e.target.value)}
                  placeholder="e.g. Solve 10 problem sets, avoid phone notifications"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRoutineModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL ATTENDANCE ADJUSTMENT */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-elevated p-6 rounded-3xl border border-white/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                Edit Subject Attendance
              </h3>
              <button 
                onClick={() => setIsAttendanceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attended Classes</label>
                <input
                  type="number"
                  min="0"
                  value={manualAttended}
                  onChange={(e) => setManualAttended(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Classes Held</label>
                <input
                  type="number"
                  min={manualAttended}
                  value={manualTotal}
                  onChange={(e) => setManualTotal(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Target Criteria (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={manualTarget}
                  onChange={(e) => setManualTarget(parseInt(e.target.value, 10) || 75)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Update Numbers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
