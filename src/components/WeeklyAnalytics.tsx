import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { TrendingUp, Flame, Target, Trophy, Clock } from 'lucide-react';
import { StudySession } from '../types';
import { formatLocalDate } from '../utils/storage';

interface WeeklyAnalyticsProps {
  sessions: StudySession[];
  dailyTargetHours: number;
  weeklyTargetHours?: number;
}

interface DayData {
  dateStr: string;
  dayName: string;
  formattedDate: string;
  hours: number;
  minutes: number;
  sessionsCount: number;
  isToday: boolean;
  metGoal: boolean;
}

export const WeeklyAnalytics: React.FC<WeeklyAnalyticsProps> = ({
  sessions,
  dailyTargetHours,
  weeklyTargetHours = 30
}) => {
  // Generate the last 7 days data
  const { chartData, totalWeeklyHours, dailyAverage, bestDay, goalHitCount } = useMemo(() => {
    const data: DayData[] = [];
    const today = new Date();
    const todayStr = formatLocalDate(today);

    let totalMinutes = 0;
    let maxMinutes = -1;
    let peakDayName = 'None';
    let metGoalCount = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = formatLocalDate(d);

      const daySessions = sessions.filter(s => s.date === dateStr);
      const dayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      const dayHours = Number((dayMinutes / 60).toFixed(1));
      const metGoal = dayHours >= dailyTargetHours;

      totalMinutes += dayMinutes;
      if (dayMinutes > maxMinutes) {
        maxMinutes = dayMinutes;
        peakDayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      }
      if (metGoal) {
        metGoalCount++;
      }

      data.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: dayHours,
        minutes: dayMinutes,
        sessionsCount: daySessions.length,
        isToday: dateStr === todayStr,
        metGoal
      });
    }

    const totalHours = Number((totalMinutes / 60).toFixed(1));
    const avg = Number((totalHours / 7).toFixed(1));

    return {
      chartData: data,
      totalWeeklyHours: totalHours,
      dailyAverage: avg,
      bestDay: `${peakDayName} (${(Math.max(0, maxMinutes) / 60).toFixed(1)}h)`,
      goalHitCount: metGoalCount
    };
  }, [sessions, dailyTargetHours]);

  // Max value for Y-axis scaling
  const maxRecordedHours = Math.max(...chartData.map(d => d.hours), 0);
  const yAxisMax = Math.max(Math.ceil(maxRecordedHours + 1), Math.ceil(dailyTargetHours + 2), 6);

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DayData;
      return (
        <div className="p-3.5 rounded-2xl glass-panel-elevated border border-white/20 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>{data.dayName}</span>
              <span className="text-slate-400 font-normal">({data.formattedDate})</span>
            </span>
            {data.isToday && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-300">Total Focus:</span>
            <span className="font-mono font-black text-indigo-300 text-sm">{data.hours} hrs</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Sessions:</span>
            <span className="font-mono text-white">{data.sessionsCount} session{data.sessionsCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Goal:</span>
            <span className={`font-semibold ${data.metGoal ? 'text-emerald-400' : 'text-amber-400'}`}>
              {data.metGoal ? `✓ Met (${dailyTargetHours}h)` : `Pending (${(dailyTargetHours - data.hours).toFixed(1)}h left)`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel-elevated p-6 rounded-3xl border border-white/10 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Weekly Productivity Analytics
            </span>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>
          <h2 className="text-lg font-extrabold text-white mt-1">
            Total Study Hours per Day
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-indigo-500" />
            <span>Study Hours</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Goal Achieved</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-4 h-0.5 bg-emerald-400 border-dashed border-t-2" />
            <span>Target ({dailyTargetHours}h)</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">7-Day Total</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-indigo-300 font-mono">{totalWeeklyHours}</span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
          <div className="text-[10px] text-slate-400">Target: {weeklyTargetHours}h</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Daily Average</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-teal-300 font-mono">{dailyAverage}</span>
            <span className="text-xs text-slate-400">h / day</span>
          </div>
          <div className="text-[10px] text-slate-400">Consistency index</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Goal Met</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{goalHitCount}</span>
            <span className="text-xs text-slate-400">/ 7 days</span>
          </div>
          <div className="text-[10px] text-slate-400">{Math.round((goalHitCount / 7) * 100)}% success rate</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Peak Day</span>
          <div className="text-sm font-extrabold text-amber-300 truncate font-mono mt-0.5">
            {bestDay}
          </div>
          <div className="text-[10px] text-slate-400">Highest focus block</div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.06)" 
              vertical={false} 
            />

            <XAxis 
              dataKey="dayName" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
            />

            <YAxis 
              domain={[0, yAxisMax]}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
              unit="h"
            />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 12 }} 
            />

            {/* Target Goal Dotted Line */}
            <ReferenceLine 
              y={dailyTargetHours} 
              stroke="#10b981" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ 
                value: `Goal ${dailyTargetHours}h`, 
                position: 'right', 
                fill: '#10b981', 
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 700
              }} 
            />

            <Bar 
              dataKey="hours" 
              radius={[10, 10, 4, 4]} 
              maxBarSize={48}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => {
                // Color bar green if goal met, vibrant indigo otherwise, with extra pop for today
                const fillColor = entry.metGoal
                  ? '#10b981' // Emerald
                  : entry.isToday
                  ? '#818cf8' // Light Indigo
                  : '#6366f1'; // Indigo

                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fillColor}
                    stroke={entry.isToday ? '#ffffff' : 'none'}
                    strokeWidth={entry.isToday ? 1.5 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
