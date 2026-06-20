export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="bg-red/10 border border-red/30 text-red text-sm rounded px-4 py-3 mb-4 font-mono">
      {message}
    </div>
  );
}
