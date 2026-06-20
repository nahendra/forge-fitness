import { prisma } from '../lib/prisma.js';

/**
 * Real leaderboard computed from opted-in users (publicLeaderboard=true) —
 * replaces the static fake rows in the original prototype. Ranked by
 * all-time training volume; weight change is shown when available.
 * Rank-change-over-time ("Δ Rank") is intentionally omitted rather than
 * faked — it would require a periodic ranking-snapshot job to compute honestly.
 */
export async function getLeaderboard(limit = 10) {
  const users = await prisma.user.findMany({
    where: { publicLeaderboard: true },
    select: {
      name: true,
      goal: true,
      weightLogs: { orderBy: { date: 'asc' }, select: { weightKg: true } },
      workoutSessions: {
        select: { exercises: { select: { sets: { select: { reps: true, weightKg: true } } } } },
      },
    },
  });

  const rows = users.map((u) => {
    const volumeKg = u.workoutSessions.reduce(
      (total, session) =>
        total + session.exercises.reduce((s, ex) => s + ex.sets.reduce((ss, set) => ss + set.reps * set.weightKg, 0), 0),
      0
    );
    const first = u.weightLogs[0]?.weightKg ?? null;
    const last = u.weightLogs[u.weightLogs.length - 1]?.weightKg ?? null;
    const weightChangeKg = first !== null && last !== null ? Math.round((last - first) * 10) / 10 : null;

    return { name: u.name, goal: u.goal, volumeKg: Math.round(volumeKg), weightChangeKg };
  });

  return rows
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, limit)
    .map((row, index) => ({ rank: index + 1, ...row }));
}

export async function getStories() {
  return prisma.transformationStory.findMany({ orderBy: { shares: 'desc' } });
}
