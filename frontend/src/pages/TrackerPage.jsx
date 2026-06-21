import { useState } from 'react';
import WorkoutForm from '../components/tracker/WorkoutForm.jsx';
import SessionHistory from '../components/tracker/SessionHistory.jsx';
import PlateauAlertBanner from '../components/tracker/PlateauAlertBanner.jsx';

export default function TrackerPage() {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [editingSession, setEditingSession] = useState(null);
  const bump = () => setRefreshSignal((n) => n + 1);

  const handleEdit = (session) => {
    setEditingSession(session);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="font-mono text-[0.62rem] uppercase tracking-widest text-orange mb-2">// Progressive Overload Tracker</div>
      <h1 className="font-display text-[clamp(2.2rem,7vw,3.5rem)] leading-none mb-2">
        WORKOUT
        <br />
        <span style={{ WebkitTextStroke: '2px #ff4500', color: 'transparent' }}>LOG</span>
      </h1>
      <p className="text-white/45 max-w-md mb-8">Log every rep. Beat last week. That's how you grow.</p>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <WorkoutForm onSaved={bump} editingSession={editingSession} onCancelEdit={() => setEditingSession(null)} />
        <div className="lg:sticky lg:top-[80px]">
          <SessionHistory refreshSignal={refreshSignal} onDeleted={bump} onEdit={handleEdit} />
          <PlateauAlertBanner refreshSignal={refreshSignal} />
        </div>
      </div>
    </div>
  );
}
