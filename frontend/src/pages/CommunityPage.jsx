import { useEffect, useState } from 'react';
import { fetchLeaderboard, fetchStories } from '../api/community.api.js';
import Spinner from '../components/common/Spinner.jsx';

export default function CommunityPage() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [stories, setStories] = useState(null);

  useEffect(() => {
    fetchLeaderboard().then((r) => setLeaderboard(r.leaderboard)).catch(() => setLeaderboard([]));
    fetchStories().then((r) => setStories(r.stories)).catch(() => setStories([]));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="font-mono text-[0.62rem] uppercase tracking-widest text-orange mb-2">// Community + Leaderboard</div>
      <h1 className="font-display text-[clamp(2.2rem,7vw,3.5rem)] leading-none mb-2">
        REAL PEOPLE
        <br />
        REAL RESULTS
      </h1>
      <p className="text-white/45 max-w-md mb-8">Compete, share, and get inspired.</p>

      <div className="mb-10">
        <div className="font-mono text-[0.62rem] uppercase tracking-widest text-white/45 mb-3">// Transformation Leaderboard</div>
        {!leaderboard ? (
          <Spinner label="Loading leaderboard" />
        ) : leaderboard.length === 0 ? (
          <p className="text-white/30 text-sm font-mono">
            No public athletes yet. Opt in to the leaderboard from your profile once you've logged a few sessions.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['#', 'Athlete', 'Goal', 'Volume Lifted', 'Weight Change'].map((h) => (
                  <th key={h} className="text-left font-mono text-[0.58rem] uppercase tracking-widest text-white/45 px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.rank} className="border-b border-white/[0.03]">
                  <td className="px-3 py-3 font-display text-lg text-white/20">{String(row.rank).padStart(2, '0')}</td>
                  <td className="px-3 py-3 font-semibold">{row.name}</td>
                  <td className="px-3 py-3 text-white/60">{row.goal}</td>
                  <td className="px-3 py-3 text-white/60">{row.volumeKg.toLocaleString()} kg</td>
                  <td className="px-3 py-3 font-mono text-xs text-white/60">
                    {row.weightChangeKg === null ? '—' : `${row.weightChangeKg > 0 ? '+' : ''}${row.weightChangeKg} kg`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="font-mono text-[0.62rem] uppercase tracking-widest text-white/45 mb-3">// Transformation Stories</div>
      {!stories ? (
        <Spinner label="Loading stories" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {stories.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-md overflow-hidden hover:border-orange transition-colors">
              <div
                className="h-32 flex items-center justify-center text-5xl relative"
                style={{ background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})` }}
              >
                {s.emoji}
                <span className="absolute top-2.5 left-2.5 bg-orange text-black font-mono text-[0.55rem] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                  {s.badge}
                </span>
              </div>
              <div className="p-4">
                <div className="font-mono text-[0.58rem] uppercase tracking-widest text-orange mb-1">{s.category}</div>
                <div className="font-display text-lg leading-tight mb-1.5">{s.title}</div>
                <p className="text-white/45 text-sm leading-relaxed">{s.description}</p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                  <span className="font-mono text-[0.62rem] text-white/30">🔥 {(s.shares / 1000).toFixed(1)}K shares</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
