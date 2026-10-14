import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));

  // Initialize Gemini AI Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Daily Focus Plan Generator API
  app.post('/api/ai/daily-plan', async (req, res) => {
    try {
      const { tasks, categories, targetStudyHours, currentDate } = req.body;
      const today = currentDate || new Date().toISOString().split('T')[0];

      // Prepare task summary for the AI prompt
      const taskList = (tasks || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        categoryId: t.categoryId,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        estimatedMinutes: t.estimatedMinutes,
        completedMinutes: t.completedMinutes,
      }));

      const catMap = new Map((categories || []).map((c: any) => [c.id, c.name + ' (' + c.code + ')']));

      const taskPromptPayload = taskList.length > 0 
        ? taskList.map((t: any) => {
            const isOverdue = t.status !== 'completed' && t.dueDate < today;
            const isToday = t.status !== 'completed' && t.dueDate === today;
            return `- [${t.status === 'completed' ? 'DONE' : isOverdue ? 'OVERDUE' : isToday ? 'DUE TODAY' : 'UPCOMING'}] ${t.title} | Subject: ${catMap.get(t.categoryId) || 'General'} | Priority: ${t.priority} | Due: ${t.dueDate} ${t.dueTime || ''} | Est: ${t.estimatedMinutes}m`;
          }).join('\n')
        : 'No specific tasks entered yet by the student. Provide a balanced foundation study plan for Physics, Mathematics 1 & 2, Chemistry, and Computer Science 1 & 2.';

      const systemPrompt = `You are an elite academic productivity strategist for high-achieving university student Hamdaan.
Hamdaan's curriculum includes: Physics, Mathematics 1, Mathematics 2, Chemistry, Computer Science 1, Computer Science 2, English, and EVS (Environmental Studies).
Hamdaan's daily target focus is ${targetStudyHours || 5.0} hours. Current Date: ${today}.

Analyze all tasks, prioritizing:
1. Overdue tasks (must be tackled first or given emergency recovery).
2. Tasks due today or tomorrow.
3. High cognitive load subjects (Maths, Physics, CS) during prime focus hours, alternated with lighter subjects (English, EVS) to prevent mental fatigue.

Provide an actionable, structured daily focus plan with recommended time-blocked slots and tactical strategy notes.`;

      let aiPlan: any = null;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Here are Hamdaan's current tasks and upcoming deadlines:\n${taskPromptPayload}\n\nGenerate the optimal Daily Focus Plan for today.`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  summary: {
                    type: Type.STRING,
                    description: 'A 2-3 sentence strategic executive briefing for Hamdaan for today.'
                  },
                  totalPlannedMinutes: {
                    type: Type.NUMBER,
                    description: 'Total suggested study minutes for today.'
                  },
                  focusBlocks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        timeSlot: { type: Type.STRING, description: 'e.g. 09:00 - 10:30 AM' },
                        taskId: { type: Type.STRING, description: 'Matching task id if applicable' },
                        subjectName: { type: Type.STRING, description: 'e.g. Physics or Mathematics 1' },
                        title: { type: Type.STRING, description: 'Task title or focus objective' },
                        durationMinutes: { type: Type.NUMBER, description: 'Focus block length in minutes' },
                        urgency: { type: Type.STRING, description: 'CRITICAL, HIGH, or MODERATE' },
                        strategyNote: { type: Type.STRING, description: 'Why this order and how to study it' }
                      },
                      required: ['timeSlot', 'subjectName', 'title', 'durationMinutes', 'urgency', 'strategyNote']
                    }
                  },
                  highAchieverTip: {
                    type: Type.STRING,
                    description: 'A punchy high-performance cognitive tip for today.'
                  }
                },
                required: ['summary', 'totalPlannedMinutes', 'focusBlocks', 'highAchieverTip']
              }
            }
          });

          if (response.text) {
            aiPlan = JSON.parse(response.text.trim());
          }
        } catch (apiErr) {
          console.error('Gemini API call error:', apiErr);
        }
      }

      // Algorithmic Fallback if Gemini unavailable or if no tasks yet
      if (!aiPlan) {
        const incomplete = (tasks || []).filter((t: any) => t.status !== 'completed');
        const overdue = incomplete.filter((t: any) => t.dueDate < today);
        const dueToday = incomplete.filter((t: any) => t.dueDate === today);
        const upcoming = incomplete.filter((t: any) => t.dueDate > today);

        const prioritized = [...overdue, ...dueToday, ...upcoming];

        let blocks: any[] = [];
        if (prioritized.length > 0) {
          let currentHour = 9;
          blocks = prioritized.slice(0, 5).map((t: any) => {
            const duration = Math.min(90, Math.max(30, t.estimatedMinutes || 60));
            const slot = `${String(currentHour).padStart(2, '0')}:00 - ${String(currentHour + Math.ceil(duration / 60)).padStart(2, '0')}:00`;
            currentHour += Math.ceil(duration / 60) + 1;

            const catName = (categories || []).find((c: any) => c.id === t.categoryId)?.name || 'Academic Core';
            const isOver = t.dueDate < today;

            return {
              timeSlot: slot,
              taskId: t.id,
              subjectName: catName,
              title: t.title,
              durationMinutes: duration,
              urgency: isOver ? 'CRITICAL' : t.dueDate === today ? 'HIGH' : 'MODERATE',
              strategyNote: isOver 
                ? 'Overdue item: Complete high-priority concepts before starting new topics.' 
                : 'Target deadline focus: Maintain uninterrupted pomodoro flow.'
            };
          });
        } else {
          // Foundational study slots for Hamdaan's curriculum
          blocks = [
            {
              timeSlot: '09:00 - 10:30 AM',
              subjectName: 'Physics',
              title: 'Physics Wave Optics & Formula Derivations',
              durationMinutes: 90,
              urgency: 'HIGH',
              strategyNote: 'Fresh morning focus: Derive key equations and practice numerical sets.'
            },
            {
              timeSlot: '11:00 - 12:30 PM',
              subjectName: 'Mathematics 1',
              title: 'Calculus & Matrices Problem Solving',
              durationMinutes: 90,
              urgency: 'HIGH',
              strategyNote: 'Deep algebraic work: Work through textbook problem sets.'
            },
            {
              timeSlot: '02:00 - 03:15 PM',
              subjectName: 'Computer Science 1',
              title: 'C++ Logic Building & Algorithm Coding',
              durationMinutes: 75,
              urgency: 'MODERATE',
              strategyNote: 'Active hands-on coding sprint with timer.'
            },
            {
              timeSlot: '04:00 - 05:00 PM',
              subjectName: 'Chemistry',
              title: 'Thermodynamics & Reaction Mechanisms',
              durationMinutes: 60,
              urgency: 'MODERATE',
              strategyNote: 'Review chemical equations and core definitions.'
            }
          ];
        }

        aiPlan = {
          summary: `Welcome Hamdaan! Your curriculum schedule is set up for Physics, Maths 1 & 2, Chemistry, and Computer Science 1 & 2. Ready to input your assignments and build high-achiever momentum.`,
          totalPlannedMinutes: blocks.reduce((acc: number, b: any) => acc + b.durationMinutes, 0),
          focusBlocks: blocks,
          highAchieverTip: 'Break heavy derivation & coding tasks into 50-minute deep blocks with 10-minute active recovery breaks.'
        };
      }

      return res.json({ success: true, plan: aiPlan });
    } catch (err: any) {
      console.error('Daily focus plan error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to generate plan' });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
