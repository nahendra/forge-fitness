import { useState } from 'react';
import { calcFatLoss } from '../../api/calculators.api.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import Card from '../common/Card.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Button from '../common/Button.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';

export default function FatLossCalculator() {
  const [form, setForm] = useState({ age: '', weightKg: '', heightCm: '', gender: 'm', activity: '1.55' });
  const [result, setResult] = useState(null);
  const { loading, error, run } = useAsyncAction();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await run(async () =>
      setResult(
        await calcFatLoss({
          age: Number(form.age),
          weightKg: Number(form.weightKg),
          heightCm: Number(form.heightCm),
          gender: form.gender,
          activity: Number(form.activity),
        })
      )
    ).catch(() => {});
  };

  return (
    <Card title="🔥 Fat Loss Calculator">
      <form onSubmit={onSubmit} noValidate>
        <Input type="number" placeholder="Age" required min={10} max={100} value={form.age} onChange={update('age')} />
        <Input type="number" placeholder="Weight (kg)" required min={20} max={400} value={form.weightKg} onChange={update('weightKg')} />
        <Input type="number" placeholder="Height (cm)" required min={50} max={272} value={form.heightCm} onChange={update('heightCm')} />
        <Select value={form.gender} onChange={update('gender')}>
          <option value="m">Male</option>
          <option value="f">Female</option>
        </Select>
        <Select value={form.activity} onChange={update('activity')}>
          <option value="1.2">Sedentary</option>
          <option value="1.375">Light active</option>
          <option value="1.55">Moderately active</option>
          <option value="1.725">Very active</option>
          <option value="1.9">Athlete</option>
        </Select>
        <ErrorBanner message={error} />
        <Button type="submit" loading={loading} className="w-full text-sm py-2.5">
          Calculate
        </Button>
      </form>

      {result && (
        <div className="mt-4">
          <div className="font-display text-5xl text-orange leading-none">{result.targetCalories.toLocaleString()}</div>
          <div className="font-mono text-[0.6rem] text-white/45 uppercase tracking-wide">Calories/day (fat loss)</div>
          <p className="text-sm text-white/45 mt-2">
            TDEE: {result.tdee} cal · Deficit: {result.deficit} cal · Expected: ~{result.expectedWeeklyLossKg}kg/week fat loss
          </p>
        </div>
      )}
    </Card>
  );
}
