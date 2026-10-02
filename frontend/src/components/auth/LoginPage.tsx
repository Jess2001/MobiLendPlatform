import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../lib/api';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [retrySecondsLeft, setRetrySecondsLeft] = useState(0);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  // Countdown for a 429 (too-many-attempts) response, so the button
  // re-enables itself once the backend's window clears.
  useEffect(() => {
    if (retrySecondsLeft <= 0) return;
    const interval = setInterval(() => setRetrySecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [retrySecondsLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || retrySecondsLeft > 0) return; // guard against double-submit while loading
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(identifier, password);
      if (!user.is_verified) {
        navigate('/verify');
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.reason === 'too_many_attempts') {
          setRetrySecondsLeft(err.retryAfterSeconds ?? 60);
          setError({
            title: 'Too many sign-in attempts',
            message: err.detail ?? 'Too many sign-in attempts. Please try again later.',
          });
        } else if (err.reason === 'account_inactive') {
          setError({
            title: 'Account unavailable',
            message: err.detail ?? 'Your account is currently unavailable. Please contact support.',
          });
        } else {
          setError({
            title: 'Authentication failed',
            message: err.detail ?? 'Email/phone number or password is incorrect.',
          });
        }
      } else {
        setError({
          title: 'Sign-in failed',
          message:
            err instanceof Error
              ? err.message
              : "We couldn't sign you in right now. Check your connection and try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      brandPanel={
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-lowest rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
                Licensed &amp; Regulated
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Central Bank of Kenya
            </span>
          </div>
          <div className="flex flex-col gap-space-xs mt-space-sm">
            <div className="flex items-center gap-space-xs text-primary font-headline-sm text-headline-sm">
              <span className="material-symbols-outlined text-[26px]">toll</span>
              <span className="tracking-tight">MobiLend</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Digital lending,
              <br />
              made clear.
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs leading-relaxed">
              Sign in to access your MobiLend account, track your loan, and manage repayments.
            </p>
          </div>
          <div className="flex flex-col gap-space-sm mt-space-xs">
            <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface">
                  Regulated Credit Rails
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Central bank compliant, sovereign capital underwriting.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-secondary-container/50 flex items-center justify-center shrink-0 text-secondary">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface">
                  Direct M-Pesa Rails
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Disbursements finalized in under 120 seconds post-approval.
                </span>
              </div>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-md">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[24px]">groups</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md font-semibold text-on-surface">
                  Over 50,000+ Kenyans
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Trust MobiLend for fair, transparent and rapid loans.
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-md flex flex-col">
        <div className="flex flex-col gap-1 mb-space-md">
          <span className="font-label-sm text-label-sm text-primary font-semibold tracking-wider uppercase">
            Customer Access
          </span>
          <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            Welcome back
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sign in to access your MobiLend account.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-space-sm p-space-sm mb-space-md bg-error-container text-on-error-container rounded-lg">
            <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-title-md text-title-md font-semibold text-error">
                  {error.title}
                </span>
                <button
                  className="text-on-error-container hover:opacity-75"
                  onClick={() => setError(null)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <p className="font-body-sm text-body-sm mt-0.5">{error.message}</p>
            </div>
          </div>
        )}

        <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                className="font-label-md text-label-md font-medium text-on-surface"
                htmlFor="identifier"
              >
                Email or phone number
              </label>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Kenya (KE)
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                person
              </span>
              <input
                autoComplete="username"
                className="w-full h-11 pl-10 pr-space-md bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:outline-none shadow-sm transition-all"
                id="identifier"
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or phone number"
                required
                type="text"
                value={identifier}
              />
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Enter your Kenyan MSISDN (+254 7XX XXX XXX) or registered email address.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                className="font-label-md text-label-md font-medium text-on-surface"
                htmlFor="password"
              >
                Password
              </label>
              <Link
                className="font-label-sm text-label-sm font-semibold text-primary hover:text-primary-container transition-colors"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                key
              </span>
              <input
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-12 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:outline-none shadow-sm transition-all"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 p-1 rounded-md text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                checked={rememberMe}
                className="w-4 h-4 rounded text-primary focus:ring-0 bg-surface-container-low cursor-pointer"
                onChange={(e) => setRememberMe(e.target.checked)}
                type="checkbox"
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Remember this device for 30 days
              </span>
            </label>
          </div>

          <Button
            disabled={isSubmitting || retrySecondsLeft > 0}
            fullWidth
            icon={isSubmitting || retrySecondsLeft > 0 ? undefined : 'arrow_forward'}
            size="lg"
            type="submit"
          >
            {retrySecondsLeft > 0
              ? `Try again in ${retrySecondsLeft}s`
              : isSubmitting
                ? 'Signing in...'
                : 'Sign in to MobiLend'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 pt-space-xs text-center">
            <span className="font-body-md text-body-md text-on-surface-variant">
              Don&apos;t have an account?
            </span>
            <Link
              className="font-title-md text-title-md font-semibold text-primary hover:underline"
              to="/register"
            >
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
