import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { chartBaseOptions } from '../../charts/chartSetup.js';
import { logWeight } from '../../api/weights.api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function WeightChart({ series, onLogged }) {
  const [value, setValue] = useState('');
  const { showToast } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    const weightKg = Number(value);
    if (!weightKg) return showToast('Enter weight first!', 'error');
    try {
      await logWeight({ weightKg });
      setValue('');
      showToast('Weight logged!');
      onLogged?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const data = {
    labels: series.map((p) => p.date.slice(5, 10)),
    datasets: [
      {
        data: series.map((p) => p.weightKg),
        borderColor: '#ff4500',
        backgroundColor: 'rgba(255,69,0,.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ff4500',
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="font-display text-lg tracking-wide mb-3">📈 Weight Progress</div>
      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input
          type="number"
          step={0.1}
          placeholder="Enter today's weight (kg)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-dim border border-border rounded px-3 py-2 text-sm outline-none focus:border-orange"
          aria-label="Today's weight in kilograms"
        />
        <button type="submit" className="bg-orange text-black px-4 py-2 rounded font-mono text-[0.65rem] font-bold uppercase tracking-wide">
          Log
        </button>
      </form>
      <div style={{ height: 200 }}>
        {series.length ? <Line data={data} options={chartBaseOptions} /> : <EmptyState />}
      </div>
    </div>
  );
}

function EmptyState() {
  return <div className="flex items-center justify-center h-full text-white/20 font-mono text-xs uppercase tracking-widest">Log your first weight entry</div>;
}
