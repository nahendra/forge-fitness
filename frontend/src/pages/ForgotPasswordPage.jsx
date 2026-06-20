import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/auth.api.js';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { loading, error, run } = useAsyncAction();

  const onSubmit = async (e) => {
    e.preventDefault();
    await run(async () => {
      await forgotPasswordRequest({ email });
      setSubmitted(true);
    }).catch(() => {});
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card title="Reset Password">
        {submitted ? (
          <p className="text-white/70 text-sm leading-relaxed">
            If an account exists for <strong className="text-white">{email}</strong>, we've sent a link to reset
            your password. It expires in 60 minutes — check your inbox (and spam folder).
          </p>
        ) : (
          <>
            <p className="text-white/45 text-sm mb-4">
              Enter the email on your account and we'll send you a link to reset your password.
            </p>
            <ErrorBanner message={error} />
            <form onSubmit={onSubmit} noValidate>
              <Input
                label="Email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" loading={loading} className="w-full mt-2">
                Send Reset Link
              </Button>
            </form>
          </>
        )}
        <p className="text-center text-white/40 text-sm mt-4 font-mono">
          <Link to="/login" className="text-orange hover:text-orange-2">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
