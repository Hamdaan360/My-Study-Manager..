import { AppStateData } from '../types';
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all categories retain chapters
      const categories = (parsed.categories || []).map((cat: any) => {
        const initialCat = INITIAL_DATA.categories.find(c => c.id === cat.id);
        return {
          ...cat,
          chapters: cat.chapters && cat.chapters.length > 0 ? cat.chapters : (initialCat?.chapters || [])
        };
      });

      // Normalize theme
      let theme = parsed.theme;
      if (theme !== 'dark' && theme !== 'blue' && theme !== 'white') {
        theme = 'dark';
      }

      return {
        ...INITIAL_DATA,
        ...parsed,
        theme,
        categories: categories.length > 0 ? categories : INITIAL_DATA.categories,
        tasks: parsed.tasks || [],
        assignments: parsed.assignments || [],
        sessions: parsed.sessions || [],
        attendance: parsed.attendance && parsed.attendance.length > 0 ? parsed.attendance : INITIAL_DATA.attendance,
        attendanceLogs: parsed.attendanceLogs || [],
        collegeTimetable: parsed.collegeTimetable && parsed.collegeTimetable.length > 0 ? parsed.collegeTimetable : INITIAL_DATA.collegeTimetable,
        dayRoutine: parsed.dayRoutine && parsed.dayRoutine.length > 0 ? parsed.dayRoutine : INITIAL_DATA.dayRoutine,
        goals: {
          ...INITIAL_DATA.goals,
          ...(parsed.goals || {}),
        }
      };
    }
  } catch (e) {
    console.error('Error reading localStorage data', e);
  }
  saveLocalData(INITIAL_DATA);
  return INITIAL_DATA;
}

export function saveLocalData(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  const categoryMap = new Map(categories.map(c => [c.id, c]));

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

  tasks.forEach(task => {
    if (!task.dueDate) return;
    const cat = categoryMap.get(task.categoryId);
    const dateClean = task.dueDate.replace(/-/g, '');
    const startTime = (task.dueTime ? task.dueTime.replace(':', '') + '00' : '235900');
    const dtStamp = `${dateClean}T${startTime}Z`;

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:task-${task.id}@hamdaanstudiespro`);
    icsLines.push(`DTSTAMP:${nowStamp}`);
    icsLines.push(`DTSTART:${dtStamp}`);
    icsLines.push(`DTEND:${dtStamp}`);
    icsLines.push(`SUMMARY:[${cat ? cat.code : 'TASK'}] ${task.title.replace(/[,;]/g, ' ')}`);
    icsLines.push(`DESCRIPTION:${(task.description || '').replace(/\n/g, '\\n')}\\nPriority: ${task.priority.toUpperCase()}\\nCategory: ${cat?.name || 'General'}`);
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
