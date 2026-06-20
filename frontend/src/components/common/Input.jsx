export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="block font-mono text-[0.6rem] uppercase tracking-widest text-white/45 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-dim border rounded px-3 py-2.5 text-sm outline-none transition-colors ${
          error ? 'border-red' : 'border-border focus:border-orange'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-red text-xs mt-1 font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
