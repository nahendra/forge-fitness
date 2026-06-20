import { useEffect, useState } from 'react';
import { fetchPlateauAlerts } from '../../api/workouts.api.js';

export default function PlateauAlertBanner({ refreshSignal }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchPlateauAlerts()
      .then((r) => setAlerts(r.alerts))
      .catch(() => setAlerts([]));
  }, [refreshSignal]);

  if (!alerts.length) return null;

  return (
    <div className="bg-red/[0.08] border border-red/20 rounded-sm px-4 py-3 mt-3">
      <div className="font-display text-base text-red tracking-wide mb-0.5">⚠️ Plateau Detected</div>
      <div className="text-white/60 text-sm">{alerts[0].message}</div>
    </div>
  );
}
