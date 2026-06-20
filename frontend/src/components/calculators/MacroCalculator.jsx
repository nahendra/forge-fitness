import { useState } from 'react';
import { calcMacros } from '../../api/calculators.api.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import Card from '../common/Card.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Button from '../common/Button.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';

const MACRO_COLORS = { protein: '#ff4500', carbs: '#4d9fff', fats: '#39e07a' };

export default function MacroCalculator() {
  const [form, setForm] = useState({ weightKg: '', bodyFatPercent: '', goal: 'cut', activity: '1.55' });
  const [result, setResult] = useState(null);
  const { loading, error, run } = useAsyncAction();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await run(async () =>
      setResult(
        await calcMacros({
          weightKg: Number(form.weightKg),
          bodyFatPercent: form.bodyFatPercent ? Number(form.bodyFatPercent) : undefined,
          goal: form.goal,
          activity: Number(form.activity),
        })
      )
    ).catch(() => {});
  };

  return (
    <Card title="📊 Calorie Intake + Macros">
      <form onSubmit={onSubmit} noValidate>
        <div className="flex gap-2">
          <Input type="number" placeholder="Weight (kg)" required min={20} max={400} value={form.weightKg} onChange={update('weightKg')} />
          <Input type="number" placeholder="BF %" min={3} max={70} value={form.bodyFatPercent} onChange={update('bodyFatPercent')} />
        </div>
        <Select value={form.goal} onChange={update('goal')}>
          <option value="cut">Fat Loss (Cut)</option>
          <option value="bulk">Muscle Gain (Bulk)</option>
          <option value="maint">Maintain</option>
        </Select>
        <Select value={form.activity} onChange={update('activity')}>
          <option value="1.2">Sedentary</option>
          <option value="1.375">Light</option>
          <option value="1.55">Moderate</option>
          <option value="1.725">Very Active</option>
        </Select>
        <ErrorBanner message={error} />
        <Button type="submit" loading={loading} className="w-full text-sm py-2.5">
          Get Macros
        </Button>
      </form>

      {result && (
        <div className="mt-4">
          <div className="font-display text-5xl text-orange leading-none">{result.calories.toLocaleString()}</div>
          <div className="font-mono text-[0.6rem] text-white/45 uppercase tracking-wide mb-3">Calories/day</div>
          {Object.entries(result.macros).map(([key, m]) => (
            <div key={key} className="flex items-center gap-3 my-2">
              <span className="font-mono text-[0.68rem] uppercase text-white/45 w-16 shrink-0">{key}</span>
              <div className="flex-1 h-1 bg-dim rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.percent}%`, background: MACRO_COLORS[key] }} />
              </div>
              <span className="font-mono text-[0.65rem] w-12 text-right shrink-0">{m.grams}g</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
