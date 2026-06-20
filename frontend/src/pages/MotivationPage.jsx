import { useEffect, useState } from 'react';
import { fetchRandomMotivation, fetchFitnessTruths } from '../api/motivation.api.js';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function MotivationPage() {
  const [motivation, setMotivation] = useState(null);
  const [truths, setTruths] = useState([]);
  const { loading, error, run } = useAsyncAction();
  const { showToast } = useToast();

  const loadMotivation = () =>
    run(async () => setMotivation(await fetchRandomMotivation())).catch(() => {});

  useEffect(() => {
    loadMotivation();
    fetchFitnessTruths().then((r) => setTruths(r.truths)).catch(() => {});
  }, []);

  const share = (platform) => {
    const text = `"${motivation?.quote?.quote}" — FORGE AI Fitness Engine. Get your free plan 💪`;
    if (platform === 'wa') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    else if (platform === 'tw') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    else {
      navigator.clipboard?.writeText(text);
      showToast('Copied for Instagram!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="font-mono text-[0.62rem] uppercase tracking-widest text-orange mb-2">// Daily Motivation Engine</div>
      <h1 className="font-display text-[clamp(2.2rem,7vw,3.5rem)] leading-none mb-2">
        FUEL YOUR
        <br />
        <span style={{ WebkitTextStroke: '2px #ff4500', color: 'transparent' }}>MINDSET</span>
      </h1>
      <p className="text-white/45 max-w-md mb-8">AI-generated, no-fluff content to keep you consistent.</p>

      <div className="bg-card border border-border rounded-md p-8 text-center relative overflow-hidden">
        <ErrorBanner message={error} />
        {loading && !motivation ? (
          <Spinner label="Loading motivation" />
        ) : motivation ? (
          <>
            <span className="text-4xl block mb-4">{motivation.quote?.icon}</span>
            <div className="font-display text-[clamp(1.5rem,5vw,2.2rem)] leading-tight mb-3">{motivation.quote?.quote}</div>
            <div className="font-mono text-[0.65rem] text-white/45 uppercase tracking-widest mb-6">— {motivation.quote?.author}</div>
            <div className="bg-dim border border-border rounded-sm p-4 text-left mb-5">
              <div className="font-mono text-[0.58rem] text-orange uppercase tracking-widest mb-1.5">// Today's Fitness Truth</div>
              <div className="text-white/70 text-sm">{motivation.tip?.text}</div>
            </div>
            <div className="flex gap-2 mb-4">
              <ShareBtn onClick={() => share('wa')} className="bg-[#25D366]">📱 WhatsApp</ShareBtn>
              <ShareBtn onClick={() => share('ig')} className="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]">📸 Instagram</ShareBtn>
              <ShareBtn onClick={() => share('tw')} className="bg-[#1DA1F2]">🐦 Twitter</ShareBtn>
            </div>
            <button onClick={loadMotivation} className="bg-dim border border-border text-white/45 px-6 py-2.5 rounded-sm font-mono text-[0.65rem] uppercase tracking-widest hover:border-orange hover:text-orange">
              ↻ Generate New
            </button>
          </>
        ) : null}
      </div>

      <div className="mt-10">
        <div className="font-mono text-[0.62rem] uppercase tracking-widest text-orange mb-3">// 1-Minute Fitness Truths</div>
        {truths.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-md p-4 mb-3">
            <div className="font-display text-lg text-orange mb-1.5">{t.title}</div>
            <div className="text-white/45 text-sm leading-relaxed">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareBtn({ onClick, className, children }) {
  return (
    <button onClick={onClick} className={`flex-1 text-white text-[0.6rem] font-bold uppercase tracking-wide py-2 rounded-sm ${className}`}>
      {children}
    </button>
  );
}
