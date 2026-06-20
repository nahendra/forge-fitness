import { Bar } from 'react-chartjs-2';
import { chartBaseOptions } from '../../charts/chartSetup.js';

export default function VolumeChart({ weeklyVolume }) {
  const data = {
    labels: weeklyVolume.map((w) => w.label),
    datasets: [
      {
        data: weeklyVolume.map((w) => w.volumeKg),
        backgroundColor: 'rgba(255,69,0,.6)',
        borderColor: '#ff4500',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  };

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="font-display text-lg tracking-wide mb-3">📊 Weekly Volume (kg)</div>
      <div style={{ height: 180 }}>
        {weeklyVolume.length ? (
          <Bar data={data} options={chartBaseOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 font-mono text-xs uppercase tracking-widest">No sessions logged yet</div>
        )}
      </div>
    </div>
  );
}
