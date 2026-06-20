import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  bodyType: true,
  goal: true,
  publicLeaderboard: true,
  createdAt: true,
};

export function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash: _passwordHash, updatedAt: _updatedAt, ...rest } = user;
  return rest;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: PUBLIC_USER_FIELDS,
  });
  return user;
}

export async function authenticateUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Generic message on purpose — do not reveal whether the email is registered.
  if (!user) throw ApiError.unauthorized('Invalid email or password.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password.');

  return toPublicUser(user);
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_FIELDS });
  if (!user) throw ApiError.notFound('User not found.');
  return user;
}
