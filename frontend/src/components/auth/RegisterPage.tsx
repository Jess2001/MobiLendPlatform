import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import PasswordRequirements, { evaluatePassword } from '../ui/PasswordRequirements';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../lib/api';

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
  confirm_password?: string;
  terms?: string;
}

// Maps DRF field names (snake_case, matching the backend serializer) to
// this form's field error keys — they're the same today, kept separate in
// case the two ever diverge.
const FIELD_MAP: Record<string, keyof FieldErrors> = {
  first_name: 'first_name',
  last_name: 'last_name',
  email: 'email',
  phone_number: 'phone_number',
  password: 'password',
};

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criteria = evaluatePassword(password);
  const passwordValid = Object.values(criteria).every(Boolean);

  const validateClientSide = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!firstName.trim()) errors.first_name = 'First name is required';
    if (!lastName.trim()) errors.last_name = 'Last name is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email format';
    if (!/^0?7\d{8}$/.test(phone.replace(/\s/g, '')))
      errors.phone_number = 'Valid 9 or 10-digit Kenyan phone number required';
    if (!passwordValid) errors.password = 'Password must fulfill all 4 security criteria';
    if (password !== confirmPassword) errors.confirm_password = 'Passwords do not match';
    if (!agreedToTerms) errors.terms = 'You must accept terms and conditions to proceed';
    return errors;
  };

  const toE164 = (raw: string) => {
    const digits = raw.replace(/\s/g, '').replace(/^0/, '');
    return `+254${digits}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMessage(null);

    const clientErrors = validateClientSide();
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const user = await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: toE164(phone),
        password,
      });
      navigate(user.is_verified ? '/' : '/verify');
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const mapped: FieldErrors = {};
        let sawConflict = false;
        for (const [key, messages] of Object.entries(err.fieldErrors)) {
          const formKey = FIELD_MAP[key];
          const text = messages?.[0];
          if (!text) continue;
          if (/already exists/i.test(text)) {
            sawConflict = true;
          } else if (formKey) {
            mapped[formKey] = text;
          }
        }
        setFieldErrors(mapped);
        if (sawConflict) {
          setConflictMessage(
            'This email or phone number may already be associated with an account. Try signing in or resetting your password.',
          );
        }
      } else {
        setConflictMessage(
          err instanceof Error
            ? err.message
            : "We couldn't create your account right now. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-sans antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="w-full bg-surface border-b border-outline-variant/40 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              aria-label="Go back"
              className="p-2 -ml-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center"
              to="/login"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
              <span className="text-on-surface text-lg font-bold tracking-tight">MobiLend</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-body-sm">
            <span className="text-on-surface-variant hidden sm:inline">Already registered?</span>
            <Link className="font-semibold text-primary hover:underline" to="/login">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-stretch justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: context + pathway */}
          <section className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 text-secondary font-semibold text-xs uppercase tracking-wider bg-surface-container-lowest w-fit px-3 py-1 rounded-full border border-secondary/20">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Simple &amp; Transparent Lending
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface leading-tight">
                Fast, transparent lending engineered for Kenya.
              </h1>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                Get started in under 60 seconds. Set up your secure account with basic details to
                check your eligibility and loan options.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col gap-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                Registration Pathway
              </h2>
              <div className="grid grid-cols-[36px_1fr] gap-x-3 items-start">
                <div className="flex flex-col items-center">
                  <div className="size-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-primary-fixed">
                    1
                  </div>
                  <div className="w-[2px] bg-primary h-12 my-1" />
                </div>
                <div className="pb-5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      Step 1: Account Creation
                    </span>
                    <span className="text-[10px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Current
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Quick and simple account setup. No unnecessary documents required.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[36px_1fr] gap-x-3 items-start">
                <div className="flex flex-col items-center">
                  <div className="size-9 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-medium text-sm">
                    2
                  </div>
                  <div className="w-[2px] bg-outline-variant/50 h-12 my-1" />
                </div>
                <div className="pb-5 pt-1">
                  <span className="text-sm font-semibold text-on-surface">
                    Step 2: Account Verification
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1">
                    6-digit SMS / Email OTP verification sent directly to your handset.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[36px_1fr] gap-x-3 items-start">
                <div className="flex flex-col items-center">
                  <div className="size-9 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-medium text-sm">
                    3
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-sm font-semibold text-on-surface">
                    Step 3: Profile &amp; KYC
                  </span>
                  <p className="text-xs text-on-surface-variant mt-1">
                    National ID &amp; M-Pesa statement for instantaneous automated credit scoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-surface-container border border-outline-variant/30">
              <span
                className="material-symbols-outlined text-secondary mt-0.5"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                lock
              </span>
              <div className="text-xs leading-relaxed text-on-surface-variant">
                <strong className="text-on-surface block font-semibold mb-0.5">
                  Bank-Grade Privacy
                </strong>
                We protect your data and never share your details without permission. We will never
                ask for your M-Pesa PIN or banking passwords.
              </div>
            </div>
          </section>

          {/* Right: form */}
          <section className="lg:col-span-7">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 sm:p-8 shadow-sm">
              {conflictMessage && (
                <div className="mb-6 p-4 rounded-xl bg-error-container border border-error/20 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-error shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="flex-1 text-sm text-on-error-container">
                    <p className="font-semibold">Phone number or email is already registered</p>
                    <p className="text-xs mt-1 leading-relaxed">{conflictMessage}</p>
                    <div className="mt-3 flex gap-3">
                      <Link
                        className="text-xs font-semibold underline hover:no-underline"
                        to="/login"
                      >
                        Sign In Now
                      </Link>
                      <span className="text-xs">•</span>
                      <Link
                        className="text-xs font-semibold underline hover:no-underline"
                        to="/forgot-password"
                      >
                        Reset Password
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                  Create your MobiLend account
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Set up your account to check your eligibility and apply for a loan.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-semibold text-on-surface mb-1.5"
                      htmlFor="first-name"
                    >
                      First name
                    </label>
                    <input
                      className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                      id="first-name"
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      type="text"
                      value={firstName}
                    />
                    {fieldErrors.first_name && (
                      <p className="text-xs text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {fieldErrors.first_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold text-on-surface mb-1.5"
                      htmlFor="last-name"
                    >
                      Last name
                    </label>
                    <input
                      className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                      id="last-name"
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      type="text"
                      value={lastName}
                    />
                    {fieldErrors.last_name && (
                      <p className="text-xs text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {fieldErrors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold text-on-surface mb-1.5"
                    htmlFor="email-address"
                  >
                    Email address
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                    id="email-address"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold text-on-surface mb-1.5"
                    htmlFor="phone-number"
                  >
                    Mobile Phone Number
                  </label>
                  <div className="flex rounded-lg shadow-sm border border-outline-variant focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent bg-surface overflow-hidden">
                    <div className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-surface-container-high border-r border-outline-variant text-on-surface shrink-0 select-none">
                      <span aria-label="Kenya Flag" className="text-base" role="img">
                        🇰🇪
                      </span>
                      <span className="text-xs font-bold text-on-surface">+254</span>
                    </div>
                    <input
                      className="w-full px-3.5 py-2.5 border-0 text-sm text-on-surface placeholder:text-outline focus:ring-0 bg-transparent"
                      id="phone-number"
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0712 345 678"
                      type="tel"
                      value={phone}
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Used for instant M-Pesa disbursement and verification OTP.
                  </p>
                  {fieldErrors.phone_number && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {fieldErrors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      className="block text-xs font-semibold text-on-surface"
                      htmlFor="password"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                    <button
                      aria-label="Toggle password visibility"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
                      onClick={() => setShowPassword((v) => !v)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <div className="mt-3.5">
                    <PasswordRequirements criteria={criteria} />
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold text-on-surface mb-1.5"
                    htmlFor="confirm-password"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                      id="confirm-password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                    />
                    <button
                      aria-label="Toggle confirm password visibility"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {fieldErrors.confirm_password && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {fieldErrors.confirm_password}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      checked={agreedToTerms}
                      className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary size-4"
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-xs text-on-surface-variant leading-normal">
                      By creating an account, you agree to the MobiLend{' '}
                      <a className="text-primary font-semibold hover:underline" href="#">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a className="text-primary font-semibold hover:underline" href="#">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p className="text-xs text-error mt-1 pl-7 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {fieldErrors.terms}
                    </p>
                  )}
                </div>

                <div className="pt-3">
                  <Button
                    disabled={isSubmitting}
                    fullWidth
                    icon="arrow_forward"
                    size="lg"
                    type="submit"
                  >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-on-surface-variant">
                    Already have an account?{' '}
                    <Link className="text-primary font-semibold hover:underline ml-0.5" to="/login">
                      Sign in
                    </Link>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/30 text-center">
                  <p className="text-[11px] text-outline flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    We do not ask for financial details or bank PINs during registration.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
