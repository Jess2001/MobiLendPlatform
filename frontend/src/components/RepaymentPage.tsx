import React, { useEffect, useRef, useState } from 'react';
import Card from './ui/Card';
import Badge from './ui/Badge';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type PresetKey = 'due' | 'double' | 'full' | 'custom';
type PaymentMethod = 'mpesa' | 'pesalink' | 'card';
type CtaState = 'idle' | 'requesting' | 'sent';

interface Preset {
  key: PresetKey;
  label: string;
  amount: number | null;
  valueLabel: string;
}

const PRESETS: Preset[] = [
  { key: 'due', label: 'Next Due', amount: 5000, valueLabel: 'KES 5,000' },
  { key: 'double', label: 'Double Pay', amount: 10000, valueLabel: 'KES 10,000' },
  { key: 'full', label: 'Full Payoff', amount: 42500, valueLabel: 'KES 42,500' },
  { key: 'custom', label: 'Custom', amount: null, valueLabel: 'Other' },
];

const PAYMENT_METHODS: {
  value: PaymentMethod;
  name: string;
  description: string;
  badge?: string;
  feeTag?: string;
  meta?: string;
}[] = [
  {
    value: 'mpesa',
    name: 'M-Pesa Mobile Money',
    description: 'Instant prompt on your registered Safaricom line',
    badge: 'Instant STK Push',
    feeTag: 'Zero Fee',
  },
  {
    value: 'pesalink',
    name: 'Direct Bank Transfer / PesaLink',
    description: 'Co-operative Bank, Equity Bank, or KCB Virtual Account clearance',
    meta: '15-30m clearing',
  },
  {
    value: 'card',
    name: 'Debit Card (Visa / Mastercard)',
    description: 'Direct 3D-Secure debit through authenticated local card',
    meta: '3DS Verified',
  },
];

const METHOD_DISPLAY_NAME: Record<PaymentMethod, string> = {
  mpesa: 'M-Pesa',
  pesalink: 'PesaLink',
  card: 'Card',
};

const CURRENT_OUTSTANDING = 42500;
const COUNTDOWN_START = 48;

const formatKES = (value: number) =>
  `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const RepaymentPage: React.FC = () => {
  const [amount, setAmount] = useState(5000);
  const [amountInputText, setAmountInputText] = useState('5,000.00');
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('due');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [ctaState, setCtaState] = useState<CtaState>('idle');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_START);

  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Countdown timer for the "waiting for PIN" step, mirrors the original demo
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clean up any pending CTA state timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const applyAmount = (value: number, preset: PresetKey) => {
    const clean = isNaN(value) || value <= 0 ? 0 : value;
    setAmount(clean);
    setSelectedPreset(preset);
  };

  const handlePresetClick = (preset: Preset) => {
    if (preset.key === 'custom') {
      setSelectedPreset('custom');
      return;
    }
    setAmountInputText(preset.amount!.toLocaleString('en-KE', { minimumFractionDigits: 2 }));
    applyAmount(preset.amount!, preset.key);
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setAmountInputText(raw);
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    applyAmount(parsed, 'custom');
  };

  const handleReset = () => {
    setAmountInputText('5,000.00');
    applyAmount(5000, 'due');
  };

  const handleTriggerPay = () => {
    setCtaState('requesting');
    const t1 = setTimeout(() => setCtaState('sent'), 1200);
    const t2 = setTimeout(() => setCtaState('idle'), 5000);
    timeoutRefs.current.push(t1, t2);
  };

  const newBalance = Math.max(0, CURRENT_OUTSTANDING - amount);
  const countdownLabel =
    secondsLeft > 0
      ? `Timeout in 00:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`
      : 'Session refreshed';

  const ctaLabel =
    ctaState === 'requesting'
      ? 'Requesting Safaricom STK Push...'
      : ctaState === 'sent'
        ? 'Push Sent! Enter PIN on your phone'
        : `Confirm repayment of ${formatKES(amount)} via ${METHOD_DISPLAY_NAME[paymentMethod]}`;

  return (
    <div className="w-full py-space-md lg:py-space-lg">
      {/* Breadcrumbs & meta bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm"
        >
          <a className="hover:text-primary transition-colors" href="#">
            Overview
          </a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <a className="hover:text-primary transition-colors" href="#">
            My Loan
          </a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Make a Repayment</span>
        </nav>
        <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-1 rounded-full text-on-surface-variant font-label-sm text-label-sm">
          <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping" />
          <span>Facility Active • Account #ML-LN-2026-0924</span>
        </div>
      </div>

      {/* Page title */}
      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          Make a Loan Repayment
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Fast, secure direct payment towards Loan Facility{' '}
          <span className="font-semibold text-primary">#ML-LN-2026-0924</span>
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left: form */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Outstanding balance overview */}
          <div className="relative overflow-hidden bg-primary-container text-on-primary rounded-xl p-space-lg shadow-md">
            <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-primary/40 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-on-primary-container">
                  Current Outstanding Balance
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-title-md text-title-md opacity-80">KES</span>
                  <span className="font-display text-display font-bold tracking-tight">
                    42,500<span className="text-title-lg font-normal">.00</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-primary-fixed mt-1">
                  Tier 1 Micro-Enterprise Growth Facility
                </p>
              </div>
              <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-lg p-space-md flex flex-col border-l-2 border-secondary-container">
                <span className="font-label-sm text-label-sm text-secondary-container font-medium">
                  Next Minimum Due
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-surface-bright mt-0.5">
                  KES 5,000.00
                </span>
                <div className="flex items-center gap-1 font-body-sm text-body-sm text-surface-variant mt-1">
                  <span className="material-symbols-outlined text-[14px]">event</span>
                  <span>Due 30 Sep 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: amount */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">
                  Select Repayment Amount
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                No early payoff penalty
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mb-space-md">
              {PRESETS.map((preset) => {
                const isActive = selectedPreset === preset.key;
                return (
                  <button
                    key={preset.key}
                    className={`flex flex-col p-space-sm rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                    onClick={() => handlePresetClick(preset)}
                    type="button"
                  >
                    <span
                      className={`font-label-sm text-label-sm ${
                        isActive ? 'font-semibold text-on-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {preset.label}
                    </span>
                    <span className="font-tabular-stat text-tabular-stat mt-0.5">
                      {preset.valueLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="font-label-md text-label-md text-on-surface-variant"
                htmlFor="repay-amount"
              >
                Payment Amount (KES)
              </label>
              <div className="relative flex items-center bg-surface-container-low rounded-lg focus-within:bg-surface-container-lowest focus-within:shadow-sm transition-all">
                <span className="px-space-md font-bold text-on-surface-variant font-label-md text-label-md">
                  KES
                </span>
                <div className="w-[1px] h-6 bg-outline-variant" />
                <input
                  className="w-full py-2.5 px-space-md bg-transparent text-on-surface font-headline-sm text-headline-sm font-semibold focus:outline-none"
                  id="repay-amount"
                  type="text"
                  value={amountInputText}
                  onChange={handleAmountInputChange}
                />
                <button
                  className="px-space-md text-primary hover:text-primary-container font-label-sm text-label-sm font-medium"
                  onClick={handleReset}
                  type="button"
                >
                  Reset
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  verified
                </span>
                Principal reduction applied in real-time upon CBK clearing.
              </p>
            </div>
          </section>

          {/* Step 2: payment method */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">
                Choose Payment Method
              </h2>
            </div>
            <div className="space-y-space-md">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.value;
                return (
                  <label
                    key={method.value}
                    className={`relative flex flex-col p-space-md rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-surface-container-low' : 'bg-surface-container-low'
                    } hover:bg-surface-container`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-space-md">
                        <input
                          checked={isSelected}
                          className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                          name="payment_method"
                          onChange={() => setPaymentMethod(method.value)}
                          type="radio"
                          value={method.value}
                        />
                        <div>
                          <div className="flex items-center gap-space-sm flex-wrap">
                            <span className="font-title-md text-title-md font-semibold text-on-surface">
                              {method.name}
                            </span>
                            {method.badge && (
                              <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-space-sm py-0.5 rounded-full font-medium">
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      {method.feeTag && (
                        <span className="px-2 py-1 rounded bg-tertiary-container text-on-tertiary font-label-sm text-[11px] font-bold tracking-wide uppercase">
                          {method.feeTag}
                        </span>
                      )}
                      {method.meta && !method.feeTag && (
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {method.meta}
                        </span>
                      )}
                    </div>
                    {method.value === 'mpesa' && (
                      <div className="mt-space-md pt-space-md bg-surface-container-lowest rounded-lg p-space-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                          <div>
                            <span className="font-label-sm text-label-sm text-on-surface-variant block">
                              Recipient Safaricom Line
                            </span>
                            <span className="font-title-md text-title-md font-bold text-on-surface tracking-wide">
                              +254 712 345 678
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-tertiary-container font-label-sm text-label-sm">
                            <span className="material-symbols-outlined text-[16px]">
                              check_circle
                            </span>
                            <span>KYC Match: Jecinta Wangui</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </section>

          {/* Step 3: review & confirm */}
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">
                Review &amp; Summary Breakdown
              </h2>
            </div>
            <div className="space-y-space-sm bg-surface-container-low rounded-lg p-space-md">
              <div className="flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
                <span>Repayment Principal Amount</span>
                <span className="font-tabular-stat text-tabular-stat text-on-surface">
                  {formatKES(amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-body-md text-body-md">
                <span>Payment Processing Fee</span>
                <span className="font-tabular-stat text-tabular-stat text-secondary font-medium">
                  KES 0.00 (Waived)
                </span>
              </div>
              <div className="w-full h-[1px] bg-outline-variant my-space-xs" />
              <div className="flex items-center justify-between font-title-md text-title-md text-on-surface pt-1">
                <span className="font-bold">Total Charge</span>
                <span className="font-bold font-tabular-stat text-tabular-stat text-primary">
                  {formatKES(amount)}
                </span>
              </div>
            </div>
            <div className="mt-space-md p-space-md bg-secondary-container/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary">trending_down</span>
                <span className="font-body-md text-body-md text-on-surface">
                  New Outstanding Balance After Payment:
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                {formatKES(newBalance)}
              </span>
            </div>

            <div className="mt-space-lg flex flex-col gap-space-sm">
              <button
                className={`w-full py-3.5 px-space-md bg-primary-container hover:bg-primary text-on-primary rounded-lg font-title-md text-title-md font-semibold transition-all shadow-md flex items-center justify-center gap-space-sm ${
                  ctaState === 'requesting' ? 'opacity-80 cursor-wait' : ''
                }`}
                disabled={ctaState === 'requesting'}
                onClick={handleTriggerPay}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span>{ctaLabel}</span>
              </button>
              <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
                By confirming, an automated prompt will appear on your phone asking for your M-Pesa
                PIN.
              </p>
            </div>
          </section>
        </div>

        {/* Right: async gateway + amortization + trust */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Transaction clearing gateway */}
          <Card padding="lg" className="relative overflow-hidden">
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                <h3 className="font-title-md text-title-md font-bold text-on-surface">
                  Transaction Clearing Gateway
                </h3>
              </div>
              <span className="bg-surface-container px-space-sm py-0.5 rounded text-[11px] font-mono text-on-surface-variant">
                LIVE PROTOCOL
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              MobiLend reconciles institutional payments asynchronously via low-latency switches.
              Track step progression in real time:
            </p>

            <div className="space-y-space-md relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
              {/* Step 1 */}
              <div className="relative flex items-start gap-space-sm">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center text-[12px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">check</span>
                </span>
                <div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface block">
                    1. STK push request sent
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Dispatched to <span className="font-medium">+254 712 345 678</span>
                  </span>
                  <div className="text-[11px] font-mono text-secondary mt-0.5">
                    UUID: mob-pay-90234123-x
                  </div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="relative flex items-start gap-space-sm">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[12px] font-bold ring-4 ring-surface-container-high">
                  <span className="material-symbols-outlined text-[13px] animate-spin">sync</span>
                </span>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      2. Waiting for customer PIN entry...
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Please unlock phone and confirm prompt with M-Pesa PIN
                  </span>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-high rounded text-on-surface font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[14px] text-secondary">
                      phone_iphone
                    </span>
                    <span>{countdownLabel}</span>
                  </div>
                </div>
              </div>
              {/* Step 3 */}
              <div className="relative flex items-start gap-space-sm opacity-60">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[12px] font-bold">
                  3
                </span>
                <div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface block">
                    3. Provider callback reconciliation
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Safaricom Daraja B2C/C2B switch validation
                  </span>
                </div>
              </div>
              {/* Step 4 */}
              <div className="relative flex items-start gap-space-sm opacity-60">
                <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[12px] font-bold">
                  4
                </span>
                <div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface block">
                    4. Balance adjustment &amp; digital receipt
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Real-time ledger amortization &amp; SMS delivery
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-space-lg bg-surface-container-low p-space-md rounded-lg flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                info
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Transactions usually settle in <strong>3–15 seconds</strong>. You do not need to
                refresh this page; automated websocket listeners update your balance immediately.
              </p>
            </div>
          </Card>

          {/* Amortization progress */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold">
                  Repayment Impact
                </span>
                <h4 className="font-title-md text-title-md font-bold text-on-surface">
                  Loan Amortization Progress
                </h4>
              </div>
              <Badge tone="success" className="!bg-tertiary-container !text-on-tertiary">
                74% Repaid
              </Badge>
            </div>
            <div className="relative flex items-center justify-center py-space-sm">
              <svg className="w-48 h-28 overflow-visible" viewBox="0 0 100 50">
                <path
                  className="text-surface-container-high"
                  d="M 10,50 A 40,40 0 0,1 90,50"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <path
                  className="text-primary"
                  d="M 10,50 A 40,40 0 0,1 90,50"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="125.66"
                  strokeDashoffset="32.67"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute bottom-1 text-center">
                <span className="font-title-lg text-title-lg font-bold text-on-surface block">
                  KES 120,000
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Original Limit
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-space-sm mt-space-md pt-space-sm border-t border-surface-container">
              <div className="text-left">
                <span className="font-body-sm text-body-sm text-on-surface-variant block">
                  Cumulative Paid
                </span>
                <span className="font-tabular-stat text-tabular-stat text-secondary font-semibold">
                  KES 77,500
                </span>
              </div>
              <div className="text-right">
                <span className="font-body-sm text-body-sm text-on-surface-variant block">
                  Remaining Principal
                </span>
                <span className="font-tabular-stat text-tabular-stat text-on-surface font-semibold">
                  {formatKES(newBalance).replace('.00', '')}
                </span>
              </div>
            </div>
          </Card>

          {/* Trust card */}
          <div className="bg-surface-container rounded-xl p-space-md flex items-start gap-space-md">
            <div className="p-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <div>
              <h5 className="font-title-md text-title-md font-bold text-on-surface">
                CBK Regulated Digital Credit Provider
              </h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                Directly settled through Central Bank regulated payment switches. Digital receipt
                instantly delivered via SMS and email. Data encrypted under ISO/IEC 27001 standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepaymentPage;
