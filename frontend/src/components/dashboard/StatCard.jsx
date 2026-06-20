export default function StatCard({ label, value, sub, valueColor = 'text-orange', trend }) {
  return (
    <div className="bg-card border border-border rounded-md p-5">
      <div className="font-mono text-[0.6rem] uppercase tracking-widest text-white/45 mb-1.5">{label}</div>
      <div className={`font-display text-4xl leading-none ${valueColor}`}>{value}</div>
      {sub && <div className="text-white/45 text-xs mt-1">{sub}</div>}
      {trend && (
        <div className={`font-mono text-[0.65rem] mt-1.5 ${trend.direction === 'up' ? 'text-green' : trend.direction === 'down' ? 'text-red' : 'text-white/45'}`}>
          {trend.direction === 'up' ? `▲ +${trend.diffKg}kg` : trend.direction === 'down' ? `▼ ${trend.diffKg}kg` : '― No change'}
        </div>
      )}
    </div>
  );
}
