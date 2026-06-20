import { prisma } from '../lib/prisma.js';

const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  bodyType: true,
  goal: true,
  publicLeaderboard: true,
  createdAt: true,
};

export async function updateProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_USER_FIELDS,
  });
}
