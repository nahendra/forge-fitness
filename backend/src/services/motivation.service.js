import { prisma } from '../lib/prisma.js';

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)] || null;
}

export async function getRandomQuote() {
  const quotes = await prisma.motivationQuote.findMany();
  return pickRandom(quotes);
}

export async function getRandomTip() {
  const tips = await prisma.motivationTip.findMany();
  return pickRandom(tips);
}

export async function getFitnessTruths() {
  return prisma.fitnessTruth.findMany();
}
