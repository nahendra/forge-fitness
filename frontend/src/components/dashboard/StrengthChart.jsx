import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { chartBaseOptions } from '../../charts/chartSetup.js';
import { fetchStrengthSeries } from '../../api/dashboard.api.js';

const EXERCISES = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press'];

export default function StrengthChart() {
  const [exercise, setExercise] = useState('Bench Press');
  const [points, setPoints] = useState([]);

  useEffect(() => {
    fetchStrengthSeries(exercise)
      .then((r) => setPoints(r.points))
      .catch(() => setPoints([]));
  }, [exercise]);

  const data = {
    labels: points.map((p) => p.date.slice(5, 10)),
    datasets: [
      {
        data: points.map((p) => p.weightKg),
        borderColor: '#39e07a',
        backgroundColor: 'rgba(57,224,122,.06)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#39e07a',
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="font-display text-lg tracking-wide mb-3 flex items-center justify-between flex-wrap gap-2">
        💪 Strength Progression
        <div className="flex bg-dim border border-border rounded-sm overflow-hidden">
          {EXERCISES.map((ex) => (
            <button
              key={ex}
              onClick={() => setExercise(ex)}
              className={`px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-wide border-r border-border last:border-r-0 ${
                exercise === ex ? 'bg-orange text-black' : 'text-white/45'
              }`}
            >
              {ex.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 200 }}>
        {points.length ? (
          <Line data={data} options={chartBaseOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 font-mono text-xs uppercase tracking-widest">
            No {exercise} sets logged yet
          </div>
        )}
      </div>
    </div>
  );
}
