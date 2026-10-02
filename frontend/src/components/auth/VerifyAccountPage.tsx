import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import OtpInputGroup from '../ui/OtpInputGroup';
import { useAuth } from '../../context/AuthContext';
import { authApi, ApiError, type VerifyFailureReason } from '../../lib/api';

const RESEND_COOLDOWN_SECONDS = 42;

const VerifyAccountPage: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'locked'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // If there's no session at all, this page has nothing to verify against.
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const submitCode = async (submittedCode: string) => {
    if (status === 'submitting' || status === 'locked') return;
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const res = await authApi.verify(submittedCode);
      setUser(res.user);
      setSucceeded(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const reason = err.reason as VerifyFailureReason | undefined;
        if (reason === 'already_verified') {
          // Session is stale — treat as success rather than an error.
          setSucceeded(true);
          return;
        }
        setErrorMessage(err.detail ?? 'That code is incorrect.');
        setStatus(reason === 'too_many_attempts' || reason === 'expired' ? 'locked' : 'error');
        setCode('');
        return;
      }
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
      setStatus('error');
      return;
    }
    setStatus('idle');
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      await authApi.resendVerification();
      setCode('');
      setStatus('idle');
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.reason === 'already_verified') {
        setSucceeded(true);
      } else if (err instanceof ApiError && err.reason === 'too_many_attempts') {
        // Seed the existing countdown from the backend's actual window
        // instead of a generic error — the resend button just re-hides
        // itself until the real throttle clears.
        setSecondsLeft(err.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS);
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Couldn't send a new code. Please try again.",
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const otpStatus = status === 'error' ? 'error' : status === 'locked' ? 'disabled' : 'default';

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="w-full bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin h-16 flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[28px]">
                account_balance
              </span>
              <span className="font-title-lg text-title-lg text-primary tracking-tight">
                MobiLend
              </span>
            </div>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span className="hidden sm:inline-block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Financial Services
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                verified_user
              </span>
              <span className="font-label-sm text-label-sm font-medium">256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-center p-gutter-mobile lg:p-margin">
        <div className="flex flex-col w-full items-center justify-center py-space-xl">
          <div className="w-full max-w-lg relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-fixed/30 via-secondary-container/20 to-primary/10 rounded-2xl blur-xl opacity-60 pointer-events-none" />
            <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10 flex flex-col">
              {!succeeded ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-low shadow-sm">
                      <div className="absolute inset-0 bg-secondary-container/30 rounded-2xl blur-sm" />
                      <div className="relative w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                        <span
                          className="material-symbols-outlined text-[28px]"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          shield_person
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                      Verify your account
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm mx-auto leading-relaxed">
                      We&apos;ve sent a 6-digit verification code to{' '}
                      {user?.phone_number && (
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          {user.phone_number}
                        </span>
                      )}
                      {user?.phone_number && user?.email && ' and '}
                      {user?.email && (
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          {user.email}
                        </span>
                      )}
                      .
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="block text-center font-label-sm text-label-sm uppercase tracking-wider text-outline mb-3 font-semibold">
                      Enter 6-Digit OTP
                    </label>
                    <OtpInputGroup
                      onChange={setCode}
                      onComplete={submitCode}
                      status={otpStatus}
                      value={code}
                    />
                  </div>

                  {status === 'error' && errorMessage && (
                    <div className="my-3 p-3 rounded-xl bg-error-container text-on-error-container flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0 mt-0.5">
                        error
                      </span>
                      <div className="flex-1">
                        <p className="font-label-sm text-label-sm font-bold text-error">
                          Incorrect verification code
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {status === 'locked' && errorMessage && (
                    <div className="my-3 p-3 rounded-xl bg-surface-container-high text-on-surface flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-outline flex-shrink-0 mt-0.5">
                        timer_off
                      </span>
                      <div className="flex-1">
                        <p className="font-label-sm text-label-sm font-bold text-on-surface">
                          Code no longer valid
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 my-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">touch_app</span>
                    <span className="font-body-sm text-body-sm text-center">
                      Code will auto-submit once all 6 digits are entered.
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center my-3 py-2 bg-surface-container-low rounded-xl">
                    {secondsLeft > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">
                          schedule
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Resend code in{' '}
                          <span className="font-tabular-stat font-semibold text-on-surface">
                            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Didn&apos;t receive the SMS or email code?
                        </span>
                        <button
                          className="font-label-md text-label-md font-bold text-primary hover:text-primary-container inline-flex items-center gap-1 disabled:opacity-50"
                          disabled={isResending}
                          onClick={handleResend}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">replay</span>
                          <span>{isResending ? 'Sending...' : 'Resend new code'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2.5">
                    <Button
                      disabled={status === 'submitting' || code.length < 6}
                      fullWidth
                      icon="arrow_forward"
                      onClick={() => submitCode(code)}
                      size="lg"
                    >
                      {status === 'submitting' ? 'Verifying...' : 'Verify & Continue'}
                    </Button>
                    <div className="flex items-center justify-center gap-2 pt-1 text-outline">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span className="font-body-sm text-body-sm">
                        Protected by Central Bank of Kenya Consumer Security Standard
                      </span>
                    </div>
                    <button
                      className="font-label-sm text-label-sm text-outline hover:text-on-surface transition-colors py-1"
                      onClick={logout}
                      type="button"
                    >
                      Sign out and use a different account
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-container-low shadow-sm">
                      <div className="absolute inset-0 bg-tertiary-fixed/40 rounded-2xl blur-md" />
                      <div className="relative w-16 h-16 rounded-2xl bg-tertiary-container flex items-center justify-center text-on-tertiary shadow-md">
                        <span
                          className="material-symbols-outlined text-[36px]"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          check_circle
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed/30 text-tertiary-container mx-auto mb-3">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      Identity Confirmed
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                    Your account is verified
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm mx-auto leading-relaxed">
                    Your MobiLend account is ready. Next, we&apos;ll help you complete your profile
                    to assess your borrowing limit.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    <Button fullWidth icon="arrow_forward" onClick={() => navigate('/')} size="lg">
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-3 text-outline w-full max-w-lg">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span className="font-body-sm text-body-sm">
                CBK Authorized Digital Credit Provider
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              <span className="font-body-sm text-body-sm">Help: 0800 720 000</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyAccountPage;
