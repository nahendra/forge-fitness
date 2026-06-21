import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const NON_OTHER_PARTS = ['Chest', 'Back', 'Legs'];

function exerciseCreateInput(exercises) {
  return exercises.map((ex, exIndex) => ({
    name: ex.name,
    order: exIndex,
    sets: {
      create: ex.sets.map((s, setIndex) => ({
        setNumber: setIndex + 1,
        reps: s.reps,
        weightKg: s.weightKg,
      })),
    },
  }));
}

// Best-effort personalization: any exercise name a user logs gets remembered
// against their account for that muscle group, so it shows up as a dropdown
// suggestion next time — whether or not it was already one of the built-in
// suggestions. The unique constraint makes re-using a name a no-op.
async function upsertCustomExercises(userId, bodyPart, names) {
  const uniqueNames = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  await Promise.all(
    uniqueNames.map((name) =>
      prisma.customExercise.upsert({
        where: { userId_bodyPart_name: { userId, bodyPart, name } },
        update: {},
        create: { userId, bodyPart, name },
      })
    )
  );
}

export async function getCustomExercises(userId) {
  return prisma.customExercise.findMany({
    where: { userId },
    select: { bodyPart: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export async function createWorkoutSession(userId, { date, bodyPart, notes, exercises }) {
  const session = await prisma.workoutSession.create({
    data: {
      userId,
      date,
      bodyPart,
      notes,
      exercises: { create: exerciseCreateInput(exercises) },
    },
    include: { exercises: { include: { sets: true }, orderBy: { order: 'asc' } } },
  });

  await upsertCustomExercises(userId, bodyPart, exercises.map((e) => e.name));

  return session;
}

export async function updateWorkoutSession(userId, sessionId, { date, bodyPart, notes, exercises }) {
  const existing = await prisma.workoutSession.findFirst({ where: { id: sessionId, userId } });
  if (!existing) throw ApiError.notFound('Workout session not found.');

  await prisma.$transaction([
    prisma.exercise.deleteMany({ where: { sessionId } }),
    prisma.workoutSession.update({
      where: { id: sessionId },
      data: { date, bodyPart, notes, exercises: { create: exerciseCreateInput(exercises) } },
    }),
  ]);

  await upsertCustomExercises(userId, bodyPart, exercises.map((e) => e.name));

  return getWorkoutSession(userId, sessionId);
}

async function getAllSessionsRaw(userId) {
  return prisma.workoutSession.findMany({
    where: { userId },
    include: { exercises: { include: { sets: true }, orderBy: { order: 'asc' } } },
    orderBy: { date: 'desc' },
  });
}

export function calcSessionVolume(session) {
  return session.exercises.reduce(
    (total, ex) => total + ex.sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0),
    0
  );
}

function maxWeight(exercise) {
  if (!exercise.sets.length) return 0;
  return Math.max(...exercise.sets.map((s) => s.weightKg || 0));
}

export { maxWeight };

function findPrevSession(allSessions, current) {
  return (
    allSessions
      .filter(
        (s) =>
          s.bodyPart === current.bodyPart &&
          s.id !== current.id &&
          new Date(s.date).getTime() < new Date(current.date).getTime()
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null
  );
}

export { findPrevSession };

function annotateSession(session, allSessions) {
  const prev = findPrevSession(allSessions, session);
  const exercises = session.exercises.map((ex) => {
    const prevEx = prev?.exercises.find((pe) => pe.name.toLowerCase() === ex.name.toLowerCase());
    const max = maxWeight(ex);
    const prevMax = prevEx ? maxWeight(prevEx) : null;
    const isPR = prevMax !== null && max > prevMax;
    const isPlateau = prevMax !== null && max === prevMax && max > 0;

    return {
      id: ex.id,
      name: ex.name,
      sets: ex.sets.map((s) => ({ setNumber: s.setNumber, reps: s.reps, weightKg: s.weightKg })),
      maxWeightKg: max,
      isPR,
      prGainKg: isPR ? Math.round((max - prevMax) * 10) / 10 : null,
      isPlateau,
      nextTargetKg: !isPR && max > 0 ? Math.round((max + 2.5) * 10) / 10 : null,
    };
  });

  return {
    id: session.id,
    date: session.date,
    bodyPart: session.bodyPart,
    notes: session.notes,
    createdAt: session.createdAt,
    volumeKg: calcSessionVolume(session),
    exercises,
  };
}

export async function listWorkoutSessions(userId, { bodyPart, page, limit }) {
  const all = await getAllSessionsRaw(userId);

  const filtered = !bodyPart
    ? all
    : bodyPart === 'other'
      ? all.filter((s) => !NON_OTHER_PARTS.includes(s.bodyPart))
      : all.filter((s) => s.bodyPart === bodyPart);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const pageItems = filtered.slice(start, start + limit);

  return {
    sessions: pageItems.map((s) => annotateSession(s, all)),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getWorkoutSession(userId, sessionId) {
  const all = await getAllSessionsRaw(userId);
  const session = all.find((s) => s.id === sessionId);
  if (!session) throw ApiError.notFound('Workout session not found.');
  return annotateSession(session, all);
}

export async function deleteWorkoutSession(userId, sessionId) {
  const result = await prisma.workoutSession.deleteMany({ where: { id: sessionId, userId } });
  if (result.count === 0) throw ApiError.notFound('Workout session not found.');
}

/**
 * Mirrors the original client-side `detectPlateaus`: flags any exercise whose
 * max weight has been flat across the 3 most recent sessions of a muscle group.
 */
export function detectPlateaus(allSessions) {
  const byBodyPart = new Map();
  for (const session of allSessions) {
    const list = byBodyPart.get(session.bodyPart) || [];
    list.push(session);
    byBodyPart.set(session.bodyPart, list);
  }

  const alerts = [];
  for (const [bodyPart, sessions] of byBodyPart.entries()) {
    if (sessions.length < 3) continue;
    const recent = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    const exNames = new Set(recent.flatMap((s) => s.exercises.map((e) => e.name)));

    for (const exName of exNames) {
      const maxWeights = recent
        .map((s) => {
          const ex = s.exercises.find((e) => e.name === exName);
          return ex ? maxWeight(ex) : null;
        })
        .filter((v) => v !== null);

      if (maxWeights.length >= 3) {
        const diff = Math.max(...maxWeights) - Math.min(...maxWeights);
        if (diff === 0 && maxWeights[0] > 0) {
          alerts.push({
            bodyPart,
            exercise: exName,
            message: `${exName} (${bodyPart}) — no weight increase in last 3 sessions. Try adding 2.5kg next session or change rep range.`,
          });
        }
      }
    }
  }
  return alerts;
}

export async function getUserPlateauAlerts(userId) {
  const all = await getAllSessionsRaw(userId);
  return detectPlateaus(all);
}

export { getAllSessionsRaw };
