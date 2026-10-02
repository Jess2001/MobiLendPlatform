import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../ui/Button';
import { authApi } from '../../lib/api';

const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [stage, setStage] = useState<'request' | 'confirmation'>('request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError(null);
    setIsSubmitting(true);
    try {
      // The backend always returns the same neutral response, whether or
      // not the identifier matches an account — that's intentional
      // (anti-enumeration), not an error case we need to branch on.
      await authApi.forgotPassword(identifier);
      setStage('confirmation');
    } catch (err) {
      setNetworkError(
        err instanceof Error ? err.message : "We couldn't send that right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandPanel = (
    <div className="flex flex-col gap-space-md h-full justify-between">
      <div className="flex flex-col gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs mb-space-sm">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              shield
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-container font-semibold">
              Security by Design
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-space-xs">
            Account Security &amp; Recovery
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            We take your account security seriously. Follow the simple steps to securely reset your
            password.
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
          <div className="flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary-container">
              <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md text-on-surface mb-1">
                Secure Verification Code
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-normal">
                To protect your privacy, we send a one-time code to your registered mobile line or
                email address — never to a new or unverified contact.
              </p>
            </div>
          </div>
          <div className="my-space-md h-px bg-surface-variant" />
          <div className="flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/50 flex items-center justify-center shrink-0 text-on-secondary-container">
              <span className="material-symbols-outlined text-[24px]">timer</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs mb-0.5">
                <h2 className="font-title-md text-title-md text-on-surface">
                  10-Minute Expiry for your safety
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                  Protected
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-normal">
                For your peace of mind, reset codes automatically expire shortly after being issued.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-primary-container rounded-xl p-space-lg text-on-primary shadow-sm">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary-fixed-dim text-[20px]">
              support_agent
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed-dim font-semibold">
              Account Protection Desk
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
        </div>
        <p className="font-body-sm text-body-sm text-surface-container-high/90 mb-space-md">
          Need help? Call our support team anytime. We&apos;re here 24/7 to help you access your
          account safely.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-sm bg-primary/40 rounded-lg p-space-sm">
          <div>
            <span className="block font-label-sm text-label-sm text-surface-container-high/70">
              Nairobi Priority Desk
            </span>
            <span className="font-tabular-stat text-tabular-stat text-on-primary font-semibold tracking-wide">
              +254 20 790 4000
            </span>
          </div>
          <a
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary-container font-label-md text-label-md font-semibold hover:bg-surface-container-low transition-colors"
            href="tel:+254207904000"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            Call Desk
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout brandPanel={brandPanel} maxWidthClassName="max-w-7xl">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg sm:p-space-xl shadow-md">
        {stage === 'request' ? (
          <>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
              Reset your password
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
              Enter the email or phone number associated with your account and we&apos;ll send you
              instructions.
            </p>

            {networkError && (
              <div className="flex items-start gap-space-sm p-space-sm mb-space-md bg-error-container text-on-error-container rounded-lg">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
                  error
                </span>
                <p className="font-body-sm text-body-sm">{networkError}</p>
              </div>
            )}

            <form className="space-y-space-md" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface mb-2 font-medium"
                  htmlFor="identifierInput"
                >
                  Email address or phone number
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    alternate_email
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                    id="identifierInput"
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. adan.farah@example.com or +254 7..."
                    required
                    type="text"
                    value={identifier}
                  />
                </div>
                <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">info</span>
                  Compatible with M-Pesa registered mobile lines and institutional emails.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    verified_user
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Encrypted &amp; Secure Connection
                  </span>
                </div>
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  check_circle
                </span>
              </div>

              <div className="pt-space-xs flex flex-col sm:flex-row items-center gap-space-sm justify-between">
                <Link
                  className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1 order-2 sm:order-1"
                  to="/login"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to sign in
                </Link>
                <Button
                  className="w-full sm:w-auto order-1 sm:order-2"
                  disabled={isSubmitting}
                  icon="arrow_forward"
                  type="submit"
                >
                  {isSubmitting ? 'Sending...' : 'Send reset instructions'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-secondary-container/60 text-on-secondary-container flex items-center justify-center mb-space-sm">
              <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs">
              Check your messages
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md leading-relaxed">
              We&apos;ve sent password reset instructions if an account matches the information
              provided. Please check your SMS and email inbox.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-md">
              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                </div>
                <div className="min-w-0">
                  <span className="block font-label-sm text-label-sm text-on-surface font-semibold truncate">
                    SMS Gateway
                  </span>
                  <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">
                    Sent to registered SIM
                  </span>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div className="min-w-0">
                  <span className="block font-label-sm text-label-sm text-on-surface font-semibold truncate">
                    Email Server
                  </span>
                  <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">
                    Instructions dispatched
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container rounded-lg p-space-md mb-space-lg">
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-outline text-[20px] mt-0.5">
                  schedule
                </span>
                <div>
                  <span className="font-label-md text-label-md text-on-surface font-semibold block mb-0.5">
                    Didn&apos;t get instructions?
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Wait a couple of minutes or check your spam/junk folder. The code is valid for
                    10 minutes — after that, request a new one from this same page.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-xs">
              <button
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
                onClick={() => setStage('request')}
                type="button"
              >
                Try a different identifier
              </button>
              <Link
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                to="/login"
              >
                <span>Back to sign in</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
