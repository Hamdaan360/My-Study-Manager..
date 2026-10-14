export type CategoryType = 'subject' | 'college';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type AssignmentStatus = 'pending' | 'submitted' | 'graded';

export type AppTheme = 'dark' | 'blue' | 'white';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type RoutineActivityType = 'study' | 'college' | 'routine' | 'break' | 'exercise' | 'revision';

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  keyTopics: string[];
  revisionCount: number;
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: AssignmentStatus;
  priority: Priority;
  maxScore?: number;
  obtainedScore?: number;
  submissionNotes?: string;
  createdAt: string;
}

export interface SubjectCategory {
  id: string;
  type: CategoryType;
  name: string;
  code: string;
  color: string;
  accentColor: string;
  icon: string;
  creditHours?: number;
  targetGrade?: string;
  professorOrLead?: string;
  syllabusProgress: number; // 0 to 100
  notes?: string;
  roomOrLocation?: string;
  chapters?: Chapter[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  chapterId?: string;
  categoryType: CategoryType;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedMinutes: number;
  completedMinutes: number;
  tags: string[];
  completedAt: string | null;
  createdAt: string;
}

export interface StudySession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryType: CategoryType;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  timestamp: string;
  mode: 'pomodoro' | 'deep_focus' | 'ultra_study' | 'custom' | 'short_break' | 'long_break';
}

export interface ProductivityGoals {
  dailyTargetHours: number;
  dailyTasksTarget: number;
  weeklyTargetHours: number;
  streakCount: number;
  longestStreak: number;
  lastActiveDate: string;
}

// Attendance Types
export interface AttendanceSubject {
  subjectId: string;
  totalClasses: number;
  attendedClasses: number;
  minimumTargetPercent: number; // e.g. 75 or 85
}

export interface AttendanceLog {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'cancelled';
  note?: string;
}

// College Timetable Slot
export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subjectId: string;
  subjectName: string;
  roomOrLocation?: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'break';
  professor?: string;
}

// My Day Time Table (Daily routine - Fully Editable)
export interface DayRoutineBlock {
  id: string;
  startTime: string; // HH:mm e.g. "06:30"
  endTime: string; // HH:mm e.g. "07:30"
  title: string; // e.g. "Morning Routine & Focus Meditation"
  activityType: RoutineActivityType;
  subjectId?: string;
  notes?: string;
  isCompleted?: boolean;
}

export interface AppStateData {
  categories: SubjectCategory[];
  tasks: Task[];
  assignments: Assignment[];
  sessions: StudySession[];
  goals: ProductivityGoals;
  attendance: AttendanceSubject[];
  attendanceLogs: AttendanceLog[];
  collegeTimetable: TimetableSlot[];
  dayRoutine: DayRoutineBlock[];
  studentName: string;
  targetGpa: string;
  universityName: string;
  theme: AppTheme;
  dailyReminderEnabled: boolean;
  reminderTime: string; // HH:mm
}

export interface DailyFocusBlock {
  timeSlot: string;
  taskId?: string;
  subjectName: string;
  title: string;
  durationMinutes: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  strategyNote: string;
}

export interface DailyFocusPlan {
  summary: string;
  totalPlannedMinutes: number;
  focusBlocks: DailyFocusBlock[];
  highAchieverTip: string;
  generatedAt: string;
}
