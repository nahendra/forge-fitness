import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { loading, error, run } = useAsyncAction();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    await run(async () => {
      await login(form);
      showToast('Welcome back!');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    }).catch(() => {});
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card title="Sign In">
        <ErrorBanner message={error} />
        <form onSubmit={onSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="text-right -mt-2 mb-3">
            <Link to="/forgot-password" className="text-white/40 hover:text-orange text-xs font-mono">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>
        <p className="text-center text-white/40 text-sm mt-4 font-mono">
          No account?{' '}
          <Link to="/register" className="text-orange hover:text-orange-2">
            Create one
          </Link>
        </p>
        <p className="text-center text-white/25 text-xs mt-4 font-mono">
          Demo login: demo@forge.fitness / DemoPass123!
        </p>
      </Card>
    </div>
  );
}
