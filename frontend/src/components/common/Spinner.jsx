export default function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center gap-2 text-white/40 font-mono text-xs uppercase tracking-widest py-6 justify-center">
      <span className="w-3 h-3 border-2 border-orange border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      {label}…
    </div>
  );
}
