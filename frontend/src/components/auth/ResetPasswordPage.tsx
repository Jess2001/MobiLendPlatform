import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import PasswordRequirements, { evaluatePassword } from '../ui/PasswordRequirements';
import { authApi, ApiError } from '../../lib/api';

const brandPanel = (
  <div className="flex flex-col gap-space-md">
    <div className="flex items-center gap-space-xs mb-space-sm">
      <span className="material-symbols-outlined text-primary-container text-[20px]">shield</span>
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-container font-semibold">
        Security by Design
      </span>
    </div>
    <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-space-xs">
      Create a new password
    </h1>
    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
      Choose a strong password to protect your MobiLend account, loan history, and payment details.
    </p>
    <div className="bg-primary-container rounded-xl p-space-lg text-on-primary shadow-sm mt-space-md">
      <div className="flex items-center gap-space-xs mb-space-sm">
        <span className="material-symbols-outlined text-secondary-fixed-dim text-[20px]">
          security_update_good
        </span>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed-dim font-semibold">
          After you reset
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-surface-container-high/90">
        All previous sessions and active tokens are invalidated automatically once your password
        changes, so you&apos;ll need to sign in again everywhere.
      </p>
    </div>
  </div>
);

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const identifier = searchParams.get('identifier');
  const code = searchParams.get('code');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const criteria = evaluatePassword(newPassword);
  const passwordValid = Object.values(criteria).every(Boolean);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // No link params at all — this page was opened directly, not from a
  // real reset email/SMS. Nothing to do here but point back.
  if (!identifier || !code) {
    return (
      <AuthLayout brandPanel={brandPanel} maxWidthClassName="max-w-7xl">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-space-sm">
            <span className="material-symbols-outlined text-[28px]">link_off</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
            This reset link is incomplete
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
            The link you opened is missing its reset code. Request a fresh one below.
          </p>
          <Link
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary shadow-sm transition-all"
            to="/forgot-password"
          >
            Request a new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!passwordValid || !passwordsMatch) return;

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        email_or_phone: identifier,
        code,
        new_password: newPassword,
      });
      setSucceeded(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.detail ?? 'This reset code is invalid or has expired. Please request a new one.',
        );
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout brandPanel={brandPanel} maxWidthClassName="max-w-7xl">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md">
        {!succeeded ? (
          <>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
              Create a new password
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
              Choose a high-entropy password to protect your account.
            </p>

            {errorMessage && (
              <div className="flex items-start gap-space-sm p-space-sm mb-space-md bg-error-container text-on-error-container rounded-lg">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
                  error
                </span>
                <div className="flex-1">
                  <p className="font-body-sm text-body-sm">{errorMessage}</p>
                  <Link
                    className="font-label-sm text-label-sm font-semibold underline hover:no-underline"
                    to="/forgot-password"
                  >
                    Request a new code
                  </Link>
                </div>
              </div>
            )}

            <form className="space-y-space-md" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface mb-2 font-medium"
                  htmlFor="newPasswordInput"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all pr-10"
                    id="newPasswordInput"
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter secure password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    onClick={() => setShowPassword((v) => !v)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface mb-2 font-medium"
                  htmlFor="confirmPasswordInput"
                >
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all pr-10"
                    id="confirmPasswordInput"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    Passwords do not match
                  </p>
                )}
              </div>

              <PasswordRequirements criteria={criteria} />

              <div className="pt-space-xs flex items-center justify-end">
                <Button
                  disabled={isSubmitting || !passwordValid || !passwordsMatch}
                  icon="lock"
                  type="submit"
                >
                  {isSubmitting ? 'Resetting password...' : 'Reset password'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-space-sm sm:py-space-md">
            <div className="w-16 h-16 rounded-full bg-tertiary-fixed text-on-tertiary-fixed mx-auto flex items-center justify-center mb-space-md shadow-sm">
              <span
                className="material-symbols-outlined text-[36px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                check_circle
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
              Password updated
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-space-lg leading-relaxed">
              Your password has been changed successfully. You can now sign in with your new
              credentials.
            </p>
            <div className="bg-surface-container-low rounded-xl p-space-md max-w-md mx-auto mb-space-lg text-left">
              <div className="flex items-center gap-space-sm mb-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  security_update_good
                </span>
                <span className="font-title-md text-title-md text-on-surface">
                  Security Confirmation
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                All previous browser sessions and active tokens have been invalidated for your
                safety.
              </p>
            </div>
            <Button icon="login" onClick={() => navigate('/login')} size="lg">
              Sign in to MobiLend
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
