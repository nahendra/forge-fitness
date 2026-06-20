const VARIANTS = {
  fire: 'bg-orange text-black hover:bg-orange-2',
  ghost: 'bg-transparent text-white border border-border hover:border-orange hover:text-orange',
  dim: 'bg-dim text-white border border-border hover:border-orange',
};

export default function Button({ variant = 'fire', loading = false, disabled, children, className = '', ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`font-display text-lg tracking-wide px-6 py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
