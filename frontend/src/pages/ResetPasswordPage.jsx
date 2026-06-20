import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordRequest } from '../api/auth.api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { loading, error, run, setError } = useAsyncAction();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    await run(async () => {
      await resetPasswordRequest({ token, password });
      showToast('Password reset — sign in with your new password');
      navigate('/login', { replace: true });
    }).catch(() => {});
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <Card title="Reset Password">
          <ErrorBanner message="This reset link is missing its token. Request a new one." />
          <Link to="/forgot-password" className="text-orange hover:text-orange-2 text-sm">
            Request a new reset link
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card title="Choose a New Password">
        <ErrorBanner message={error} />
        <form onSubmit={onSubmit} noValidate>
          <Input
            label="New Password"
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <p className="text-white/30 text-xs font-mono mb-3 -mt-1">Min 8 characters, at least one letter and one number.</p>
          <Button type="submit" loading={loading} className="w-full mt-2">
            Reset Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
