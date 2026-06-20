import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const QUOTES = [
  { icon: '🔥', quote: "Discipline is doing it when you don't feel like it.", author: 'The Gym Bible' },
  { icon: '⚡', quote: "You don't get what you wish for. You get what you work for.", author: 'Unknown' },
  { icon: '💪', quote: "The only bad workout is the one that didn't happen.", author: 'FORGE' },
  { icon: '🧠', quote: 'Your body achieves what your mind believes.', author: 'Unknown' },
  { icon: '🎯', quote: "Progressive overload isn't optional. It's the entire game.", author: 'FORGE Engine' },
  { icon: '📈', quote: 'Small daily improvements lead to staggering long-term results.', author: 'Robin Sharma' },
  { icon: '⚔️', quote: 'Pain is temporary. Gains are forever.', author: 'Gym Proverb' },
  { icon: '🌅', quote: "Wake up. Lift. Eat. Sleep. Repeat. That's the formula.", author: 'FORGE' },
  { icon: '💡', quote: 'Most people want the result but skip the process. Be different.', author: 'Unknown' },
  { icon: '🏆', quote: 'Every set you skip is a gift to your competition.', author: 'FORGE Engine' },
];

const TIPS = [
  "Protein synthesis peaks 24–48hrs after training. That's why rest days still count.",
  "Compound lifts (Squat, Bench, Deadlift, OHP) give 80% of results. Don't overcomplicate.",
  'Sleep deprivation drops testosterone by 10–15%. 8 hours is not optional.',
  'Water retention can mask fat loss. Track weekly averages, not daily weight.',
  'Progressive overload = add 2.5kg when you hit top rep range for 2 sessions in a row.',
  "The pump isn't the goal. Strength progression is. The pump is just a side effect.",
  'Ego lifting causes injury. Leave ego at the door, add plates slowly.',
  "You can't out-train a bad diet. Ever. Full stop.",
  'Creatine is the most studied and proven supplement. Everything else is marketing.',
  'Mind-muscle connection is real. Slow, controlled reps beat ego reps.',
];

const TRUTHS = [
  {
    title: "You don't overtrain. You under-recover.",
    description:
      'Most "overtraining" is actually inadequate sleep, nutrition, or hydration. Fix your recovery before cutting volume.',
  },
  {
    title: "Cardio doesn't kill gains — laziness does.",
    description: '30 min of cardio 3x per week actually improves recovery and cardiac output. Do it.',
  },
  {
    title: 'Beginner gains are a one-time opportunity.',
    description:
      "In your first 1–2 years, you can build muscle faster than any other time. Don't waste it on bad programs.",
  },
  {
    title: 'The best program is the one you actually follow.',
    description:
      'Perfect program + zero consistency = zero results. Mediocre program + 100% consistency = great results.',
  },
];

const STORIES = [
  {
    badge: 'Trending',
    emoji: '💪',
    category: 'Transformation · 90 days',
    title: '28% BF to 14% Without a Gym',
    description: 'Rahul cut 14kg using a ₹150/day diet and bodyweight training. Full plan shared.',
    shares: 12400,
    gradientFrom: '#1a0a00',
    gradientTo: '#2a1200',
  },
  {
    badge: 'Viral',
    emoji: '🧠',
    category: 'Mindset · 1-min read',
    title: 'The Habit That Killed My Gains for 3 Years',
    description: "It wasn't diet or training. One daily decision destroyed everything.",
    shares: 31000,
    gradientFrom: '#001520',
    gradientTo: '#001a2a',
  },
  {
    badge: 'Popular',
    emoji: '🍳',
    category: 'Diet · Budget India',
    title: 'High-Protein Diet Under ₹200/Day',
    description: 'Dal, eggs, paneer, oats. Full macro breakdown. Every broke gym bro needs this.',
    shares: 54000,
    gradientFrom: '#150015',
    gradientTo: '#1a0020',
  },
  {
    badge: 'New',
    emoji: '⚡',
    category: 'Training · Overload',
    title: 'How I Added 20kg to My Bench in 8 Weeks',
    description: "Progressive overload done right. Not magic, just the system. Here's the breakdown.",
    shares: 8200,
    gradientFrom: '#0a0a00',
    gradientTo: '#1a1a00',
  },
];

async function main() {
  await prisma.motivationQuote.deleteMany();
  await prisma.motivationTip.deleteMany();
  await prisma.fitnessTruth.deleteMany();
  await prisma.transformationStory.deleteMany();

  await prisma.motivationQuote.createMany({ data: QUOTES });
  await prisma.motivationTip.createMany({ data: TIPS.map((text) => ({ text })) });
  await prisma.fitnessTruth.createMany({ data: TRUTHS });
  await prisma.transformationStory.createMany({ data: STORIES });

  const demoEmail = 'demo@forge.fitness';
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    const passwordHash = await bcrypt.hash('DemoPass123!', 12);
    await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash,
        name: 'Demo Athlete',
        bodyType: 'MESOMORPH',
        goal: 'CUT',
        publicLeaderboard: true,
      },
    });
    console.log(`Seeded demo account: ${demoEmail} / DemoPass123! (local/dev only — remove before production)`);
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
