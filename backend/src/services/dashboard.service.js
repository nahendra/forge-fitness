import { getAllSessionsRaw, calcSessionVolume, detectPlateaus, maxWeight, findPrevSession } from './workouts.service.js';
import { listWeightLogs } from './weights.service.js';

function getWeekNumber(date) {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
}

export async function getDashboardSummary(userId) {
  const sessions = await getAllSessionsRaw(userId);
  const weightLogs = await listWeightLogs(userId);

  const totalVolumeKg = sessions.reduce((t, s) => t + calcSessionVolume(s), 0);
  const totalSessions = sessions.length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = sessions.filter((s) => new Date(s.date) >= weekAgo);

  let prCount = 0;
  for (const session of weekSessions) {
    const prev = findPrevSession(sessions, session);
    if (!prev) continue;
    for (const ex of session.exercises) {
      const prevEx = prev.exercises.find((pe) => pe.name.toLowerCase() === ex.name.toLowerCase());
      if (!prevEx) continue;
      if (maxWeight(ex) > maxWeight(prevEx)) prCount++;
    }
  }

  const latestWeight = weightLogs[weightLogs.length - 1] || null;
  const previousWeight = weightLogs[weightLogs.length - 2] || null;
  let weightTrend = null;
  if (latestWeight && previousWeight) {
    const diff = Math.round((latestWeight.weightKg - previousWeight.weightKg) * 10) / 10;
    weightTrend = { diffKg: diff, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' };
  }

  const volumeByWeek = new Map();
  for (const session of sessions) {
    const d = new Date(session.date);
    const key = `W${getWeekNumber(d)} ${d.getFullYear()}`;
    volumeByWeek.set(key, (volumeByWeek.get(key) || 0) + calcSessionVolume(session));
  }
  const weeklyVolumeLabels = [...volumeByWeek.keys()].slice(-8);
  const weeklyVolume = weeklyVolumeLabels.map((label) => ({ label, volumeKg: volumeByWeek.get(label) }));

  const musclesThisWeek = [...new Set(weekSessions.map((s) => s.bodyPart))];
  const volumeThisWeek = weekSessions.reduce((t, s) => t + calcSessionVolume(s), 0);

  return {
    totals: { sessions: totalSessions, volumeKg: Math.round(totalVolumeKg), prsThisWeek: prCount },
    currentWeight: latestWeight ? { weightKg: latestWeight.weightKg, date: latestWeight.date, trend: weightTrend } : null,
    weightSeries: weightLogs.slice(-30).map((w) => ({ date: w.date, weightKg: w.weightKg })),
    weeklyVolume,
    weeklySummary: {
      sessions: weekSessions.length,
      muscles: musclesThisWeek,
      prs: prCount,
      volumeKg: Math.round(volumeThisWeek),
    },
    plateauAlerts: detectPlateaus(sessions),
  };
}

export async function getStrengthSeries(userId, exerciseName) {
  const sessions = await getAllSessionsRaw(userId);
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

  const points = [];
  for (const session of sorted) {
    const ex = session.exercises.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase());
    if (!ex) continue;
    const max = maxWeight(ex);
    if (max > 0) points.push({ date: session.date, weightKg: max });
  }
  return points;
}
