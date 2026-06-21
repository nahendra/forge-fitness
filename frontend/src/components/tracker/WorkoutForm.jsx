import { useEffect, useState } from 'react';
import { createWorkout, updateWorkout, fetchCustomExercises } from '../../api/workouts.api.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useToast } from '../../context/ToastContext.jsx';
import { uid } from '../../utils/uid.js';
import { BODY_PARTS, EXERCISES_BY_BODY_PART } from '../../data/exercisesByBodyPart.js';
import ErrorBanner from '../common/ErrorBanner.jsx';

function freshSet(reps, weightKg) {
  return {
    id: uid(),
    reps: reps == null ? '' : String(reps),
    weightKg: weightKg == null ? '' : String(weightKg),
  };
}
function freshExercise() {
  return { id: uid(), name: '', sets: [freshSet(), freshSet(), freshSet()] };
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sessionToFormState(session) {
  return {
    date: session.date.slice(0, 10),
    notes: session.notes || '',
    bodyPart: session.bodyPart,
    exercises: session.exercises.map((ex) => ({
      id: uid(),
      name: ex.name,
      sets: ex.sets.length ? ex.sets.map((s) => freshSet(s.reps, s.weightKg)) : [freshSet(), freshSet(), freshSet()],
    })),
  };
}

export default function WorkoutForm({ onSaved, editingSession, onCancelEdit }) {
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [bodyPart, setBodyPart] = useState('Chest');
  const [exercises, setExercises] = useState([freshExercise()]);
  const [customExercises, setCustomExercises] = useState([]);
  const { loading, error, run, setError } = useAsyncAction();
  const { showToast } = useToast();

  const isEditing = Boolean(editingSession);

  useEffect(() => {
    fetchCustomExercises()
      .then((r) => setCustomExercises(r.exercises))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editingSession) {
      const state = sessionToFormState(editingSession);
      setDate(state.date);
      setNotes(state.notes);
      setBodyPart(state.bodyPart);
      setExercises(state.exercises);
    }
  }, [editingSession]);

  const updateExercise = (id, patch) => setExercises((ex) => ex.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const updateSet = (exId, setId, patch) =>
    setExercises((ex) => ex.map((e) => (e.id === exId ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) } : e)));

  const addExercise = () => setExercises((ex) => [...ex, freshExercise()]);
  const removeExercise = (id) => setExercises((ex) => ex.filter((e) => e.id !== id));
  const addSetToExercise = (exId) =>
    setExercises((ex) => ex.map((e) => (e.id === exId ? { ...e, sets: [...e.sets, freshSet()] } : e)));
  const removeSet = (exId, setId) =>
    setExercises((ex) => ex.map((e) => (e.id === exId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e)));

  const resetForm = () => {
    setExercises([freshExercise()]);
    setNotes('');
    setBodyPart('Chest');
    setDate(todayISO());
  };

  const cancelEdit = () => {
    resetForm();
    onCancelEdit?.();
  };

  const onSave = async (e) => {
    e.preventDefault();

    const payloadExercises = exercises
      .map((ex) => ({
        name: ex.name.trim(),
        sets: ex.sets
          .map((s) => ({ reps: Number(s.reps) || 0, weightKg: Number(s.weightKg) || 0 }))
          .filter((s) => s.reps > 0 || s.weightKg > 0),
      }))
      .filter((ex) => ex.name && ex.sets.length > 0);

    if (!payloadExercises.length) {
      setError('Add at least one exercise with a logged set.');
      return;
    }

    await run(async () => {
      if (isEditing) {
        await updateWorkout(editingSession.id, { date, bodyPart, notes, exercises: payloadExercises });
        showToast('Session Updated ✓');
        resetForm();
        onCancelEdit?.();
      } else {
        await createWorkout({ date, bodyPart, notes, exercises: payloadExercises });
        showToast('Session Saved ✓');
        resetForm();
      }
      fetchCustomExercises().then((r) => setCustomExercises(r.exercises)).catch(() => {});
      onSaved?.();
    }).catch(() => {});
  };

  const suggestionsFor = (bp) => {
    const builtin = EXERCISES_BY_BODY_PART[bp] || [];
    const custom = customExercises.filter((c) => c.bodyPart === bp).map((c) => c.name);
    return [...new Set([...builtin, ...custom])];
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="bg-dim px-5 py-3 flex items-center gap-2 border-b border-border">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-auto font-mono text-[0.62rem] text-white/45 uppercase tracking-widest">
          {isEditing ? 'Editing Session' : "Today's Session"}
        </span>
      </div>

      <form onSubmit={onSave} className="p-5">
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block font-mono text-[0.6rem] uppercase tracking-widest text-white/45 mb-1.5" htmlFor="wl-date">
              Date
            </label>
            <input id="wl-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-dim border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-orange" />
          </div>
          <div className="flex-[2]">
            <label className="block font-mono text-[0.6rem] uppercase tracking-widest text-white/45 mb-1.5" htmlFor="wl-notes">
              Session Notes
            </label>
            <input
              id="wl-notes"
              type="text"
              placeholder="Sleep, energy, mood…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={280}
              className="w-full bg-dim border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-orange"
            />
          </div>
        </div>

        <div className="font-mono text-[0.6rem] uppercase tracking-widest text-white/45 mb-2">Muscle Group</div>
        <div className="grid grid-cols-4 gap-1.5 mb-5">
          {BODY_PARTS.map((bp) => (
            <button
              type="button"
              key={bp.id}
              onClick={() => setBodyPart(bp.id)}
              aria-pressed={bodyPart === bp.id}
              className={`bg-dim border rounded-sm py-2 px-1 text-center font-mono text-[0.58rem] uppercase tracking-wide leading-relaxed ${
                bodyPart === bp.id ? 'border-orange text-orange bg-orange/10' : 'border-border text-white/45 hover:border-orange/50'
              }`}
            >
              <span className="block text-base mb-0.5">{bp.icon}</span>
              {bp.id}
            </button>
          ))}
        </div>

        <div className="font-mono text-[0.6rem] uppercase tracking-widest text-white/45 mb-2.5">Exercises</div>
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-card border border-border rounded-sm mb-3 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-dim border-b border-border">
              <input
                list={`dl-${ex.id}`}
                placeholder="Exercise name… (type a new one if it's not listed)"
                value={ex.name}
                onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                className="flex-1 bg-transparent border-none font-display text-base tracking-wide outline-none"
                aria-label="Exercise name"
              />
              <datalist id={`dl-${ex.id}`}>
                {suggestionsFor(bodyPart).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {exercises.length > 1 && (
                <button type="button" onClick={() => removeExercise(ex.id)} aria-label="Remove exercise" className="text-white/20 hover:text-red">
                  ✕
                </button>
              )}
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="font-mono text-[0.55rem] uppercase tracking-widest text-white/25 px-3 py-1.5 text-left">#</th>
                  <th className="font-mono text-[0.55rem] uppercase tracking-widest text-white/25 px-2 py-1.5 text-left">Reps</th>
                  <th className="font-mono text-[0.55rem] uppercase tracking-widest text-white/25 px-2 py-1.5 text-left">Weight (kg)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((s, i) => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs text-orange text-center w-6 px-2 py-1">{i + 1}</td>
                    <td className="px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={s.reps}
                        onChange={(e) => updateSet(ex.id, s.id, { reps: e.target.value })}
                        className="w-full bg-dim border border-transparent rounded px-2 py-1.5 text-sm text-center outline-none focus:border-orange"
                        aria-label={`Set ${i + 1} reps`}
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="0"
                        value={s.weightKg}
                        onChange={(e) => updateSet(ex.id, s.id, { weightKg: e.target.value })}
                        className="w-full bg-dim border border-transparent rounded px-2 py-1.5 text-sm text-center outline-none focus:border-orange"
                        aria-label={`Set ${i + 1} weight in kilograms`}
                      />
                    </td>
                    <td className="px-1">
                      <button type="button" onClick={() => removeSet(ex.id, s.id)} aria-label="Remove set" className="text-white/15 hover:text-red px-1">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => addSetToExercise(ex.id)}
              className="w-full border-t border-dashed border-border text-white/25 hover:text-orange py-1.5 font-mono text-[0.6rem] uppercase tracking-widest"
            >
              + Add Set
            </button>
          </div>
        ))}

        <button type="button" onClick={addExercise} className="w-full bg-dim border border-dashed border-border text-white/30 hover:border-orange hover:text-orange py-2.5 rounded-sm font-mono text-[0.62rem] uppercase tracking-widest mb-2">
          + Add Exercise
        </button>

        <ErrorBanner message={error} />

        <div className="flex gap-2 mt-2">
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 bg-dim border border-border text-white/50 py-3.5 rounded-sm font-mono text-xs uppercase tracking-widest hover:border-red hover:text-red transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-orange text-black py-3.5 rounded-sm font-display text-xl tracking-widest hover:bg-orange-2 transition-colors disabled:opacity-60"
          >
            {loading ? 'SAVING…' : isEditing ? 'UPDATE SESSION ✓' : 'SAVE SESSION →'}
          </button>
        </div>
      </form>
    </div>
  );
}
