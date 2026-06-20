export default function Select({ label, className = '', id, children, ...props }) {
  const selectId = id || props.name;
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={selectId} className="block font-mono text-[0.6rem] uppercase tracking-widest text-white/45 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-dim border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-orange ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
