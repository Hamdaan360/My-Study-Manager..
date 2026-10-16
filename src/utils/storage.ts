import { AppStateData, SubjectCategory } from '../types';
import { INITIAL_DATA } from '../data/initialData';

const STORAGE_KEY = 'hamdaan_studies_pro_v5_clean';

export const formatLocalDate = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function getLocalData(): AppStateData {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === 'object') {
        // Merge categories ensuring all 8 core curriculum subjects exist
        const parsedCats: any[] = Array.isArray(parsed.categories) ? parsed.categories : [];
        const categoryMap = new Map<string, any>();
        
        // Put parsed first
        parsedCats.forEach(c => {
          if (c && c.id) categoryMap.set(c.id, c);
        });

        // Ensure all INITIAL_DATA categories exist
        INITIAL_DATA.categories.forEach(initialCat => {
          const existing = categoryMap.get(initialCat.id);
          if (!existing) {
            categoryMap.set(initialCat.id, initialCat);
          } else {
            // Guarantee chapters are intact
            categoryMap.set(initialCat.id, {
              ...initialCat,
              ...existing,
              chapters: Array.isArray(existing.chapters) && existing.chapters.length > 0 
                ? existing.chapters 
                : initialCat.chapters
            });
          }
        });

        const mergedCategories: SubjectCategory[] = Array.from(categoryMap.values());

        // Normalize theme ('dark', 'blue', 'white')
        let theme = parsed.theme;
        if (theme !== 'dark' && theme !== 'blue' && theme !== 'white') {
          theme = 'dark';
        }

        const safeGoals = {
          dailyTargetHours: Number(parsed.goals?.dailyTargetHours) || INITIAL_DATA.goals.dailyTargetHours,
          dailyTasksTarget: Number(parsed.goals?.dailyTasksTarget) || INITIAL_DATA.goals.dailyTasksTarget,
          weeklyTargetHours: Number(parsed.goals?.weeklyTargetHours) || INITIAL_DATA.goals.weeklyTargetHours,
          streakCount: typeof parsed.goals?.streakCount === 'number' && !isNaN(parsed.goals.streakCount) 
            ? parsed.goals.streakCount 
            : 0,
          longestStreak: typeof parsed.goals?.longestStreak === 'number' && !isNaN(parsed.goals.longestStreak)
            ? parsed.goals.longestStreak 
            : 0,
          lastActiveDate: typeof parsed.goals?.lastActiveDate === 'string' 
            ? parsed.goals.lastActiveDate 
            : '',
        };

        const result: AppStateData = {
          studentName: parsed.studentName || INITIAL_DATA.studentName,
          targetGpa: parsed.targetGpa || INITIAL_DATA.targetGpa,
          universityName: parsed.universityName || INITIAL_DATA.universityName,
          theme,
          dailyReminderEnabled: typeof parsed.dailyReminderEnabled === 'boolean' 
            ? parsed.dailyReminderEnabled 
            : INITIAL_DATA.dailyReminderEnabled,
          reminderTime: typeof parsed.reminderTime === 'string' && parsed.reminderTime 
            ? parsed.reminderTime 
            : INITIAL_DATA.reminderTime,
          goals: safeGoals,
          categories: mergedCategories.length > 0 ? mergedCategories : INITIAL_DATA.categories,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
          attendance: Array.isArray(parsed.attendance) && parsed.attendance.length > 0 
            ? parsed.attendance 
            : INITIAL_DATA.attendance,
          attendanceLogs: Array.isArray(parsed.attendanceLogs) ? parsed.attendanceLogs : [],
          collegeTimetable: Array.isArray(parsed.collegeTimetable) && parsed.collegeTimetable.length > 0 
            ? parsed.collegeTimetable 
            : INITIAL_DATA.collegeTimetable,
          dayRoutine: Array.isArray(parsed.dayRoutine) && parsed.dayRoutine.length > 0 
            ? parsed.dayRoutine 
            : INITIAL_DATA.dayRoutine,
        };

        return result;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage data', e);
  }

  saveLocalData(INITIAL_DATA);
  return INITIAL_DATA;
}

export function saveLocalData(data: AppStateData): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
}

// Backup file download (Offline-first)
export function exportBackupJson(data: AppStateData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Hamdaan-Studies-Pro-Backup-${formatLocalDate()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export single or all deadlines to .ics for Apple Calendar, Outlook, Google Calendar
export function exportCalendarIcs(tasks: AppStateData['tasks'], categories: AppStateData['categories']) {
  const categoryMap = new Map((categories || []).map(c => [c.id, c]));

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hamdaan Studies Pro//Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Hamdaan Studies Pro Deadlines',
    'X-WR-TIMEZONE:UTC',
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  (tasks || []).forEach(task => {
    if (!task || !task.dueDate) return;
    const cat = categoryMap.get(task.categoryId);
    const dateClean = task.dueDate.replace(/-/g, '');
    const startTime = (task.dueTime ? task.dueTime.replace(':', '') + '00' : '235900');
    const dtStamp = `${dateClean}T${startTime}Z`;

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:task-${task.id}@hamdaanstudiespro`);
    icsLines.push(`DTSTAMP:${nowStamp}`);
    icsLines.push(`DTSTART:${dtStamp}`);
    icsLines.push(`DTEND:${dtStamp}`);
    icsLines.push(`SUMMARY:[${cat ? cat.code : 'TASK'}] ${(task.title || '').replace(/[,;]/g, ' ')}`);
    icsLines.push(`DESCRIPTION:${(task.description || '').replace(/\n/g, '\\n')}\\nPriority: ${(task.priority || 'MEDIUM').toUpperCase()}\\nCategory: ${cat?.name || 'General'}`);
    icsLines.push(`STATUS:${task.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Hamdaan-Studies-Deadlines.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
