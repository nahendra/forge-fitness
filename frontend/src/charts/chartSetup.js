import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Tooltip,
  Filler
);

export const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: 'rgba(244,239,232,.35)', font: { family: 'Space Mono', size: 9 } } },
    y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: 'rgba(244,239,232,.35)', font: { family: 'Space Mono', size: 9 } } },
  },
};
