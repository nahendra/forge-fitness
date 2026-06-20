import { randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const TOKEN_TTL_MINUTES = 60;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Returns null if no account matches — callers MUST NOT let that difference
 * leak into the HTTP response (always reply with the same generic message),
 * otherwise this endpoint becomes an email-enumeration oracle.
 */
export async function createPasswordResetToken(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    // Invalidate any earlier outstanding reset links for this user.
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
  ]);

  return { user, rawToken, expiresInMinutes: TOKEN_TTL_MINUTES };
}

export async function resetPasswordWithToken({ token, password }) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    throw ApiError.badRequest('This reset link is invalid or has expired. Request a new one.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    // One-time use: consume every outstanding token for this user, not just
    // the one used, so an older emailed link can't be replayed afterwards.
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
}
