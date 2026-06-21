import { useEffect, useState } from 'react';
import { fetchConsistency } from '../../api/dashboard.api.js';
import Spinner from '../common/Spinner.jsx';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function intensityClass(day) {
  if (!day || day.sessionCount === 0) return 'bg-dim border border-border/60';
  if (day.sessionCount === 1) return 'bg-orange/35 border border-orange/40';
  if (day.sessionCount === 2) return 'bg-orange/70 border border-orange/70';
  return 'bg-orange border border-orange-2 shadow-[0_0_6px_rgba(255,69,0,0.55)]';
}

// Pads the front of the day list so week 0's rows line up on the correct
// weekday (Sunday-first, same convention GitHub's contribution graph uses),
// then chunks into 7-day columns.
function buildWeeks(days) {
  if (!days.length) return [];
  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells = [...Array(firstWeekday).fill(null), ...days];
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function ConsistencyHeatmap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchConsistency()
      .then(setData)
      .catch(() => setData({ days: [], currentStreak: 0, bestStreak: 0, totalSessions: 0 }));
  }, []);

  if (!data) return <Spinner label="Loading consistency" />;

  const weeks = buildWeeks(data.days);
  let lastMonth = null;

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="font-display text-lg tracking-wide mb-4">🔥 Consistency</div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, wi) => {
            const firstReal = week.find(Boolean);
            const month = firstReal ? new Date(`${firstReal.date}T00:00:00Z`).getUTCMonth() : null;
            const showLabel = month !== null && month !== lastMonth;
            if (showLabel) lastMonth = month;

            return (
              <div key={wi} className="flex flex-col gap-[3px]">
                <div className="h-3 text-[0.5rem] font-mono text-white/30 leading-3 whitespace-nowrap">
                  {showLabel ? MONTH_LABELS[month] : ''}
                </div>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day ? `${day.date} — ${day.sessionCount} session${day.sessionCount === 1 ? '' : 's'}${day.volumeKg ? ` · ${day.volumeKg}kg` : ''}` : ''}
                    className={`w-[10px] h-[10px] rounded-sm ${intensityClass(day)}`}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-4 font-mono text-[0.65rem]">
        <span className="text-orange">🔥 Current streak: {data.currentStreak} day{data.currentStreak === 1 ? '' : 's'}</span>
        <span className="text-white/45">🏆 Best streak: {data.bestStreak} day{data.bestStreak === 1 ? '' : 's'}</span>
        <span className="text-white/45">Total: {data.totalSessions} session{data.totalSessions === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}
