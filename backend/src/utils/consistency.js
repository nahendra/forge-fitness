const MS_PER_DAY = 86400000;
export const CONSISTENCY_WINDOW_DAYS = 180;

export function toDateKey(d) {
  return new Date(d).toISOString().slice(0, 10);
}

/**
 * Pure day-by-day activity + streak calculation, separated from the Prisma
 * lookup so it can be unit tested with controlled input/clock values. Works
 * entirely in UTC epoch-day arithmetic (no local-timezone Date methods) so
 * the result doesn't depend on what timezone the server happens to run in.
 *
 * @param {{dateKey: string, volumeKg: number}[]} sessionEntries - one entry per session (same dateKey can repeat)
 * @param {number} nowMs - epoch ms to treat as "now" (defaults to real time; overridable for tests)
 */
export function buildConsistency(sessionEntries, nowMs = Date.now()) {
  const countByDate = new Map();
  const volumeByDate = new Map();
  for (const { dateKey, volumeKg } of sessionEntries) {
    countByDate.set(dateKey, (countByDate.get(dateKey) || 0) + 1);
    volumeByDate.set(dateKey, (volumeByDate.get(dateKey) || 0) + volumeKg);
  }

  const todayUtcMidnight = Math.floor(nowMs / MS_PER_DAY) * MS_PER_DAY;
  const days = [];
  for (let i = CONSISTENCY_WINDOW_DAYS - 1; i >= 0; i--) {
    const key = new Date(todayUtcMidnight - i * MS_PER_DAY).toISOString().slice(0, 10);
    days.push({
      date: key,
      sessionCount: countByDate.get(key) || 0,
      volumeKg: Math.round(volumeByDate.get(key) || 0),
    });
  }

  let bestStreak = 0;
  let running = 0;
  for (const day of days) {
    if (day.sessionCount > 0) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }

  let currentStreak = 0;
  let i = days.length - 1;
  if (days[i].sessionCount === 0) i -= 1; // don't break the streak before today is even over
  while (i >= 0 && days[i].sessionCount > 0) {
    currentStreak += 1;
    i -= 1;
  }

  return { days, currentStreak, bestStreak };
}
