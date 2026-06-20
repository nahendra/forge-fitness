import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const TABS = [
  { to: '/', label: 'Home' },
  { to: '/calculators', label: 'Calculators' },
  { to: '/tracker', label: 'Workout Log' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/motivation', label: 'Motivation' },
  { to: '/community', label: 'Community' },
];

const tabClass = ({ isActive }) =>
  `px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-widest rounded-sm transition-colors whitespace-nowrap ${
    isActive ? 'bg-orange text-black font-bold' : 'text-white/45 hover:text-white'
  }`;

export default function NavBar() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Signed out');
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-black/95 backdrop-blur-md border-b border-border">
        <NavLink to="/" className="font-display text-2xl tracking-wide text-orange shrink-0">
          FORGE<span className="text-white">.</span>
        </NavLink>
        <div className="hidden md:flex gap-0 bg-dim border border-border rounded-sm overflow-x-auto">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} className={tabClass} end={t.to === '/'}>
              {t.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <span className="hidden sm:inline font-mono text-xs text-white/50">{user.name}</span>
              <button onClick={handleLogout} className="font-mono text-[0.65rem] uppercase tracking-widest text-white/50 hover:text-orange">
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="bg-orange text-black px-4 py-2 rounded-sm font-mono text-[0.65rem] font-bold uppercase tracking-widest hover:bg-orange-2">
              Sign in
            </NavLink>
          )}
        </div>
      </nav>

      <div className="md:hidden fixed top-[57px] inset-x-0 z-40 flex gap-2 overflow-x-auto px-4 py-2 bg-dim border-b border-border">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `shrink-0 px-3 py-1.5 border rounded-sm font-mono text-[0.6rem] uppercase tracking-widest ${
                isActive ? 'bg-orange text-black border-orange' : 'border-border text-white/45'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
