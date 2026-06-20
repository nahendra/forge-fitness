import { useState } from 'react';
import { generatePlan } from '../../api/plans.api.js';
import { useAsyncAction } from '../../hooks/useAsyncAction.js';
import { useToast } from '../../context/ToastContext.jsx';
import { shareText, shareToWhatsApp, shareToTwitter } from '../../utils/share.js';
import ErrorBanner from '../common/ErrorBanner.jsx';

const BODY_TYPES = [
  { id: 'ectomorph', icon: '🪶', label: 'Ecto / Skinny' },
  { id: 'mesomorph', icon: '💪', label: 'Meso / Athletic' },
  { id: 'endomorph', icon: '🔥', label: 'Endo / Heavy' },
];

const GOALS = [
  { id: 'cut', icon: '🔥', label: 'Cut Fat' },
  { id: 'bulk', icon: '💪', label: 'Bulk Up' },
  { id: 'shred', icon: '⚡', label: 'Shred' },
];

export default function PlanGenerator() {
  const [bodyType, setBodyType] = useState('ectomorph');
  const [goal, setGoal] = useState('cut');
  const [plan, setPlan] = useState(null);
  const { loading, error, run } = useAsyncAction();
  const { showToast } = useToast();

  const handleGenerate = async () => {
    await run(async () => {
      const { plan: generated } = await generatePlan({ bodyType, goal });
      setPlan(generated);
    }).catch(() => {});
  };

  const shareCopy = `Got my personalised ${goal} plan for a ${bodyType} body type from FORGE! 💪`;

  return (
    <div className="bg-card border border-border rounded-md p-5 mt-4">
      <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/45 mb-3">// Step 1 — Select Your Body Type</div>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {BODY_TYPES.map((bt) => (
          <button
            key={bt.id}
            type="button"
            onClick={() => setBodyType(bt.id)}
            aria-pressed={bodyType === bt.id}
            className={`bg-dim border rounded-sm py-4 px-2 text-center transition-all ${
              bodyType === bt.id ? 'border-orange bg-orange/10' : 'border-border hover:border-orange/50'
            }`}
          >
            <span className="block text-2xl mb-1">{bt.icon}</span>
            <span className={`font-mono text-[0.7rem] uppercase tracking-wide ${bodyType === bt.id ? 'text-orange' : 'text-white/45'}`}>
              {bt.label}
            </span>
          </button>
        ))}
      </div>

      <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/45 mb-3">// Step 2 — Choose Your Goal</div>
      <div className="flex gap-2 mb-4">
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGoal(g.id)}
            aria-pressed={goal === g.id}
            className={`flex-1 border rounded-sm py-2 font-mono text-[0.68rem] uppercase tracking-wide transition-all ${
              goal === g.id ? 'border-orange text-orange bg-orange/10' : 'border-border text-white/45 hover:border-orange/50'
            }`}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-orange text-black font-mono text-[0.68rem] font-bold uppercase tracking-widest py-2.5 rounded-sm hover:bg-orange-2 transition-colors disabled:opacity-60"
      >
        {loading ? 'Generating…' : '⚡ Generate My AI Plan'}
      </button>

      {plan && (
        <div className="bg-dim border border-orange/20 rounded-sm p-4 mt-4 text-sm leading-relaxed text-white/80">
          <SectionTitle>🎯 Your Goal: {plan.goal.toUpperCase()} · Body Type: {plan.bodyType[0].toUpperCase() + plan.bodyType.slice(1)}</SectionTitle>
          <SectionTitle icon="🍽">Calories</SectionTitle>
          {plan.calories}
          <SectionTitle icon="🏋️">Training Split</SectionTitle>
          {plan.split}
          <SectionTitle icon="🥩">Protein</SectionTitle>
          {plan.protein} bodyweight
          <SectionTitle icon="🍚">Carbs</SectionTitle>
          {plan.carbs}
          <SectionTitle icon="🥑">Fats</SectionTitle>
          {plan.fats}
          <SectionTitle icon="⚡">Key Insight</SectionTitle>
          {plan.insight.text}
          {plan.insight.source === 'ai' && (
            <span className="block font-mono text-[0.55rem] text-orange/70 mt-1 uppercase tracking-wide">
              ✦ AI-enriched note ({plan.insight.model})
            </span>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={() => shareToWhatsApp(shareCopy)} className="flex-1 bg-[#25D366] text-white text-[0.6rem] font-bold uppercase tracking-wide py-2 rounded-sm">
              📱 WhatsApp
            </button>
            <button
              onClick={() => shareText(shareCopy, () => showToast('Copied to clipboard!'))}
              className="flex-1 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-[0.6rem] font-bold uppercase tracking-wide py-2 rounded-sm"
            >
              📸 Instagram
            </button>
            <button onClick={() => shareToTwitter(shareCopy)} className="flex-1 bg-[#1DA1F2] text-white text-[0.6rem] font-bold uppercase tracking-wide py-2 rounded-sm">
              🐦 Twitter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return <div className="font-display text-base text-orange tracking-wide mt-2.5 mb-0.5">{icon} {children}</div>;
}
