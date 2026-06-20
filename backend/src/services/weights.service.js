import { prisma } from '../lib/prisma.js';

export async function logWeight(userId, { date, weightKg }) {
  return prisma.weightLog.create({
    data: { userId, weightKg, date: date || new Date() },
  });
}

export async function listWeightLogs(userId) {
  return prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });
}
