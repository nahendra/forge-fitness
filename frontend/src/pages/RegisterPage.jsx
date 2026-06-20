import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const { loading, error, run } = useAsyncAction();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    await run(async () => {
      await register(form);
      showToast('Account created — welcome to FORGE!');
      navigate('/calculators', { replace: true });
    }).catch(() => {});
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card title="Create Account">
        <ErrorBanner message={error} />
        <form onSubmit={onSubmit} noValidate>
          <Input
            label="Name"
            name="name"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
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
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-white/30 text-xs font-mono mb-3 -mt-1">Min 8 characters, at least one letter and one number.</p>
          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Account
          </Button>
        </form>
        <p className="text-center text-white/40 text-sm mt-4 font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-orange hover:text-orange-2">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
