import { useState } from 'react';
import { calcBmi } from '../../api/calculators.api.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import Card from '../common/Card.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';

export default function BmiCalculator() {
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [result, setResult] = useState(null);
  const { loading, error, run } = useAsyncAction();

  const onSubmit = async (e) => {
    e.preventDefault();
    await run(async () => setResult(await calcBmi({ heightCm: Number(heightCm), weightKg: Number(weightKg) }))).catch(() => {});
  };

  return (
    <Card title="📐 BMI Calculator">
      <form onSubmit={onSubmit} noValidate>
        <Input type="number" placeholder="Height (cm)" aria-label="Height in centimetres" required min={50} max={272} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
        <Input type="number" placeholder="Weight (kg)" aria-label="Weight in kilograms" required min={20} max={400} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        <ErrorBanner message={error} />
        <Button type="submit" loading={loading} className="w-full text-sm py-2.5">
          Calculate BMI
        </Button>
      </form>

      {result && (
        <div className="mt-4">
          <div className="font-display text-5xl text-orange leading-none">{result.bmi}</div>
          <div className="font-mono text-[0.6rem] text-white/45 uppercase tracking-wide">{result.category}</div>
          <div className="h-2 bg-dim rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${result.percent}%`, background: result.color }} />
          </div>
          <div className="flex justify-between font-mono text-[0.55rem] text-white/40 mt-1">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </div>
      )}
    </Card>
  );
}
