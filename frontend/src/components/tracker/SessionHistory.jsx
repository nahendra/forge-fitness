import { useEffect, useState } from 'react';
import { listWorkouts, deleteWorkout } from '../../api/workouts.api.js';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../common/Spinner.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';
import { formatDate } from '../../utils/formatDate.js';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'Chest', label: 'Chest' },
  { id: 'Back', label: 'Back' },
  { id: 'Legs', label: 'Legs' },
  { id: 'other', label: 'Other' },
];

export default function SessionHistory({ refreshSignal, onDeleted }) {
  const [filter, setFilter] = useState('all');
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    try {
      const { sessions: items } = await listWorkouts({ bodyPart: filter === 'all' ? undefined : filter, limit: 50 });
      setSessions(items);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, refreshSignal]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await deleteWorkout(id);
      showToast('Session deleted');
      load();
      onDeleted?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="font-mono text-[0.62rem] uppercase tracking-widest text-white/45 mb-2.5">
        // Session History + PR Detection
      </div>

      <div className="flex border border-border rounded-sm overflow-hidden mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex-1 py-2 font-mono text-[0.55rem] uppercase tracking-wide border-r border-border last:border-r-0 ${
              filter === t.id ? 'bg-orange text-black font-bold' : 'bg-dim text-white/35'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} />

      {!sessions ? (
        <Spinner label="Loading sessions" />
      ) : sessions.length === 0 ? (
        <div className="text-center py-10 text-white/20 font-mono text-[0.65rem] uppercase tracking-widest leading-loose">
          No sessions found.
          <br />
          Log a workout →
        </div>
      ) : (
        <div className="max-h-[480px] overflow-y-auto">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} open={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} onDelete={() => handleDelete(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, open, onToggle, onDelete }) {
  return (
    <div className="bg-card border border-border rounded-sm mb-2.5 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3.5 py-3 bg-dim text-left">
        <div>
          <div className="font-mono text-[0.6rem] text-orange uppercase tracking-widest">{formatDate(session.date)}</div>
          <div className="font-display text-base tracking-wide">
            {session.bodyPart} · {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[0.58rem] text-white/45">{Math.round(session.volumeKg).toLocaleString()} kg vol</div>
          <div className="text-white/45 text-xs">{open ? '▲' : '▼'}</div>
        </div>
      </button>

      {open && (
        <div className="px-3.5 py-3">
          {session.notes && <div className="text-white/45 text-sm italic mb-2.5 pb-2 border-b border-border">"{session.notes}"</div>}
          {session.exercises.map((ex) => (
            <div key={ex.id} className="mb-2.5">
              <div className="font-display text-base tracking-wide flex items-center gap-1.5 flex-wrap">
                {ex.name}
                {ex.isPR && (
                  <span className="inline-flex items-center gap-1 bg-green/10 border border-green/25 text-green font-mono text-[0.55rem] px-1.5 py-0.5 rounded-sm uppercase">
                    ▲ +{ex.prGainKg}kg PR!
                  </span>
                )}
                {ex.isPlateau && (
                  <span className="inline-flex items-center gap-1 bg-red/10 border border-red/25 text-red font-mono text-[0.55rem] px-1.5 py-0.5 rounded-sm uppercase">
                    ⚠ Plateau
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ex.sets.map((s) => (
                  <span key={s.setNumber} className="bg-dim border border-border rounded-sm px-2 py-0.5 font-mono text-[0.58rem] text-white/55">
                    S{s.setNumber}: {s.reps}×{s.weightKg}kg
                  </span>
                ))}
              </div>
              {ex.nextTargetKg && (
                <div className="text-white/45 text-xs mt-1 font-mono italic">→ Target: {ex.nextTargetKg}kg next session</div>
              )}
            </div>
          ))}
          <button onClick={onDelete} className="text-white/15 hover:text-red font-mono text-[0.58rem] uppercase tracking-wide mt-1">
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}
