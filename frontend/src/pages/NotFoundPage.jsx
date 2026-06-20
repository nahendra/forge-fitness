import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24 px-4">
      <h1 className="font-display text-6xl text-orange mb-2">404</h1>
      <p className="text-white/50 mb-6">That page doesn't exist.</p>
      <Link to="/" className="bg-orange text-black px-6 py-3 rounded font-display text-lg">
        Back Home
      </Link>
    </div>
  );
}
