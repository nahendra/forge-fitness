import { useState } from 'react';
import { calcMuscleGain } from '../../api/calculators.api.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import Card from '../common/Card.jsx';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Button from '../common/Button.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';

export default function MuscleGainCalculator() {
  const [form, setForm] = useState({ age: '', trainingYears: '', weightKg: '', gender: 'm' });
  const [result, setResult] = useState(null);
  const { loading, error, run } = useAsyncAction();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await run(async () =>
      setResult(
        await calcMuscleGain({
          age: Number(form.age),
          trainingYears: form.trainingYears ? Number(form.trainingYears) : 0,
          weightKg: Number(form.weightKg),
          gender: form.gender,
        })
      )
    ).catch(() => {});
  };

  return (
    <Card title="📈 Muscle Gain Projection">
      <form onSubmit={onSubmit} noValidate>
        <Input type="number" placeholder="Age" required min={10} max={100} value={form.age} onChange={update('age')} />
        <Input type="number" placeholder="Training years" min={0} max={50} value={form.trainingYears} onChange={update('trainingYears')} />
        <Input type="number" placeholder="Current weight (kg)" required min={20} max={400} value={form.weightKg} onChange={update('weightKg')} />
        <Select value={form.gender} onChange={update('gender')}>
          <option value="m">Male</option>
          <option value="f">Female</option>
        </Select>
        <ErrorBanner message={error} />
        <Button type="submit" loading={loading} className="w-full text-sm py-2.5">
          Project Growth
        </Button>
      </form>

      {result && (
        <div className="mt-4">
          <div className="font-display text-5xl text-orange leading-none">{result.gainKgPerYear}</div>
          <div className="font-mono text-[0.6rem] text-white/45 uppercase tracking-wide">kg lean mass / year (realistic)</div>
          <p className="text-sm text-white/45 mt-2">
            Based on {result.trainingYears} training year(s). Realistic natural limit. Diet, sleep, and consistency are the
            variables you control.
          </p>
        </div>
      )}
    </Card>
  );
}
