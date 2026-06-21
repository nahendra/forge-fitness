import { buildConsistency } from '../src/utils/consistency.js';

const DAY = 86400000;
// Fixed reference "now" — a UTC midday timestamp, deliberately not midnight,
// to make sure the day-bucketing logic doesn't depend on what time of day it is.
const NOW = new Date('2026-06-21T15:00:00.000Z').getTime();

describe('buildConsistency', () => {
  it('returns a 180-day window ending today with zero counts when there are no sessions', () => {
    const { days, currentStreak, bestStreak } = buildConsistency([], NOW);
    expect(days).toHaveLength(180);
    expect(days[days.length - 1].date).toBe('2026-06-21');
    expect(days.every((d) => d.sessionCount === 0)).toBe(true);
    expect(currentStreak).toBe(0);
    expect(bestStreak).toBe(0);
  });

  it('counts multiple sessions on the same day and sums their volume', () => {
    const { days } = buildConsistency(
      [
        { dateKey: '2026-06-21', volumeKg: 500 },
        { dateKey: '2026-06-21', volumeKg: 300 },
      ],
      NOW
    );
    const today = days[days.length - 1];
    expect(today.sessionCount).toBe(2);
    expect(today.volumeKg).toBe(800);
  });

  it('computes current streak as consecutive logged days ending today', () => {
    const entries = [0, 1, 2].map((i) => ({
      dateKey: new Date(NOW - i * DAY).toISOString().slice(0, 10),
      volumeKg: 100,
    }));
    const { currentStreak } = buildConsistency(entries, NOW);
    expect(currentStreak).toBe(3);
  });

  it('does not break the current streak just because today has no session yet', () => {
    // Logged yesterday and the day before, nothing today — streak should
    // still read 2, not 0, since today isn't over.
    const entries = [1, 2].map((i) => ({
      dateKey: new Date(NOW - i * DAY).toISOString().slice(0, 10),
      volumeKg: 100,
    }));
    const { currentStreak } = buildConsistency(entries, NOW);
    expect(currentStreak).toBe(2);
  });

  it('breaks the current streak if yesterday was skipped (even with today logged)', () => {
    const entries = [
      { dateKey: new Date(NOW).toISOString().slice(0, 10), volumeKg: 100 },
      { dateKey: new Date(NOW - 2 * DAY).toISOString().slice(0, 10), volumeKg: 100 },
    ];
    const { currentStreak } = buildConsistency(entries, NOW);
    expect(currentStreak).toBe(1);
  });

  it('finds the best streak even if it is not the current one', () => {
    // A 5-day streak 10-14 days ago, then a gap, then just today.
    const entries = [];
    for (let i = 10; i <= 14; i++) entries.push({ dateKey: new Date(NOW - i * DAY).toISOString().slice(0, 10), volumeKg: 50 });
    entries.push({ dateKey: new Date(NOW).toISOString().slice(0, 10), volumeKg: 50 });

    const { bestStreak, currentStreak } = buildConsistency(entries, NOW);
    expect(bestStreak).toBe(5);
    expect(currentStreak).toBe(1);
  });
});
