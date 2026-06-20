import BmiCalculator from '../components/calculators/BmiCalculator.jsx';
import FatLossCalculator from '../components/calculators/FatLossCalculator.jsx';
import MacroCalculator from '../components/calculators/MacroCalculator.jsx';
import MuscleGainCalculator from '../components/calculators/MuscleGainCalculator.jsx';

export default function CalculatorsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="font-mono text-[0.62rem] uppercase tracking-widest text-orange mb-2">// Fitness Calculators</div>
      <h1 className="font-display text-[clamp(2.2rem,7vw,3.5rem)] leading-none mb-2">
        KNOW YOUR
        <br />
        EXACT NUMBERS
      </h1>
      <p className="text-white/45 max-w-md mb-8">Four calculators. Real science. Zero guessing.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <BmiCalculator />
        <FatLossCalculator />
        <MacroCalculator />
        <MuscleGainCalculator />
      </div>
    </div>
  );
}
