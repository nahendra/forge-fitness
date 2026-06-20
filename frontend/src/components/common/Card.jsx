export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-md p-5 ${className}`}>
      {title && <div className="font-display text-lg tracking-wide mb-3 flex items-center gap-2">{title}</div>}
      {children}
    </div>
  );
}
