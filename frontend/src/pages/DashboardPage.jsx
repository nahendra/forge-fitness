import { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../api/dashboard.api.js';
import StatCard from '../components/dashboard/StatCard.jsx';
import WeightChart from '../components/dashboard/WeightChart.jsx';
import StrengthChart from '../components/dashboard/StrengthChart.jsx';
import VolumeChart from '../components/dashboard/VolumeChart.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  if (error) return <div className="max-w-4xl mx-auto px-4 py-10"><ErrorBanner message={error} /></div>;
  if (!summary) return <Spinner label="Loading dashboard" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="font-mono text-[0.62rem] uppercase tracking-widest text-orange mb-2">// Progress Dashboard</div>
      <h1 className="font-display text-[clamp(2.2rem,7vw,3.5rem)] leading-none mb-2">
        YOUR
        <br />
        PROGRESS
      </h1>
      <p className="text-white/45 max-w-md mb-8">Weight, strength, volume — all tracked, visualised, weekly.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Current Weight"
          value={summary.currentWeight ? summary.currentWeight.weightKg : '—'}
          sub="kg"
          trend={summary.currentWeight?.trend}
        />
        <StatCard label="Total Sessions" value={summary.totals.sessions} sub="logged" />
        <StatCard label="PRs This Week" value={summary.totals.prsThisWeek} sub="personal records" valueColor="text-green" />
        <StatCard label="Total Volume" value={summary.totals.volumeKg.toLocaleString()} sub="kg lifted all time" />
      </div>

      <div className="space-y-4">
        <WeightChart series={summary.weightSeries} onLogged={load} />
        <StrengthChart />
        <VolumeChart weeklyVolume={summary.weeklyVolume} />

        <div className="bg-card border border-border rounded-md p-5">
          <div className="font-display text-lg tracking-wide mb-3">📋 This Week's Summary</div>
          {summary.weeklySummary.sessions ? (
            <p className="text-white/60 text-sm leading-loose">
              <strong className="text-orange">{summary.weeklySummary.sessions}</strong> sessions ·{' '}
              <strong className="text-orange">{summary.weeklySummary.muscles.join(', ')}</strong> trained ·{' '}
              <strong className="text-green">{summary.weeklySummary.prs} PRs</strong> hit · Total volume:{' '}
              <strong className="text-orange">{summary.weeklySummary.volumeKg.toLocaleString()} kg</strong>
            </p>
          ) : (
            <p className="text-white/45 text-sm">No sessions this week yet. Go train!</p>
          )}
        </div>

        {summary.plateauAlerts.length > 0 && (
          <div className="bg-red/[0.08] border border-red/20 rounded-sm px-4 py-3">
            <div className="font-display text-base text-red tracking-wide mb-0.5">⚠️ Plateau Detected</div>
            <div className="text-white/60 text-sm">{summary.plateauAlerts[0].message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
