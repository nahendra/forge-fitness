import { Link } from 'react-router-dom';
import PlanGenerator from '../components/plan/PlanGenerator.jsx';

export default function HomePage() {
  return (
    <div>
      <div className="bg-orange overflow-hidden whitespace-nowrap py-2">
        <div className="inline-flex gap-16 animate-[tick_22s_linear_infinite]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="inline-flex gap-16 font-display text-sm tracking-wide text-black">
              <span>🔥 AI PLAN GENERATOR</span>
              <span>💪 PROGRESSIVE OVERLOAD TRACKER</span>
              <span>📊 PROGRESS DASHBOARD</span>
              <span>⚡ DAILY MOTIVATION ENGINE</span>
              <span>🏆 COMMUNITY LEADERBOARD</span>
            </span>
          ))}
        </div>
      </div>

      <section className="relative px-4 sm:px-6 py-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-orange/10 border border-orange/30 text-orange font-mono text-[0.65rem] uppercase tracking-widest px-3 py-1.5 rounded-sm mb-5">
          <span className="w-1.5 h-1.5 bg-orange rounded-full pulse-dot" />
          AI-Powered · Free to Start
        </div>

        <h1 className="font-display leading-[0.9] text-[clamp(3rem,12vw,6rem)] mb-4">
          GET
          <br />
          <em className="not-italic" style={{ WebkitTextStroke: '2px #ff4500', color: 'transparent' }}>
            SHREDDED
          </em>
          <br />
          IN 60 SEC
        </h1>
        <p className="text-white/45 max-w-sm mb-8">
          Select your body type, pick your goal. AI generates your complete plan — workout, diet, macros — instantly.
        </p>

        <div className="flex gap-3 flex-wrap mb-10">
          <Link to="/calculators" className="bg-orange text-black px-7 py-3 rounded font-display text-lg hover:bg-orange-2 transition-colors">
            Build My Plan
          </Link>
          <Link to="/community" className="border border-border px-7 py-3 rounded font-mono text-xs uppercase tracking-wide hover:border-orange hover:text-orange transition-colors">
            See Transformations
          </Link>
        </div>

        <PlanGenerator />

        <div className="flex gap-8 pt-6 mt-8 border-t border-border flex-wrap">
          <Stat n="48K+" l="Plans Generated" />
          <Stat n="92%" l="Hit Their Goal" />
          <Stat n="Free" l="No Card Needed" />
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div className="font-display text-3xl text-orange leading-none">{n}</div>
      <div className="font-mono text-[0.65rem] uppercase tracking-widest text-white/45 mt-1">{l}</div>
    </div>
  );
}
