import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface LoanTerm {
  months: number;
  apr: number;
  label: string;
  aprLabel: string;
  costLabel: string;
  recommended?: boolean;
}

const LOAN_TERMS: LoanTerm[] = [
  { months: 3, apr: 12, label: '3 Months', aprLabel: '12% APR', costLabel: 'Low overall cost' },
  {
    months: 6,
    apr: 14,
    label: '6 Months',
    aprLabel: '14% APR',
    costLabel: 'Optimal cash flow',
    recommended: true,
  },
  {
    months: 12,
    apr: 16,
    label: '12 Months',
    aprLabel: '16% APR',
    costLabel: 'Smallest installments',
  },
];

const QUICK_AMOUNTS = [10000, 25000, 50000, 75000, 100000];
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 100000;
const AMOUNT_STEP = 5000;
const ORIGINATION_FEE_RATE = 0.015;
const CIRCLE_RADIUS = 14;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const LOAN_PURPOSES = [
  { value: 'working-capital', label: 'Working Capital & Inventory Restocking' },
  { value: 'equipment-upgrade', label: 'Agricultural or Commercial Equipment Purchase' },
  { value: 'payroll-bridging', label: 'Payroll & Supplier Invoice Bridging' },
  { value: 'store-expansion', label: 'Retail Store Expansion or Fit-out' },
  { value: 'personal-emergency', label: 'Personal Emergency / Educational Tuition' },
];

const formatKES = (value: number) => `KES ${Math.round(value).toLocaleString()}`;

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const ApplyPage: React.FC = () => {
  const [principal, setPrincipal] = useState(50000);
  const [principalInputText, setPrincipalInputText] = useState('50,000');
  const [selectedTermMonths, setSelectedTermMonths] = useState(6);
  const [purpose, setPurpose] = useState('working-capital');
  const [purposeNote, setPurposeNote] = useState(
    'Purchasing solar irrigation pumps and hardware supplies for Q4 retail rush',
  );

  const selectedTerm = useMemo(
    () => LOAN_TERMS.find((term) => term.months === selectedTermMonths) ?? LOAN_TERMS[1],
    [selectedTermMonths],
  );

  const {
    originationFee,
    totalInterest,
    totalRepayment,
    monthlyRepayment,
    netDisbursement,
    principalPercent,
    interestPercent,
  } = useMemo(() => {
    const fee = principal * ORIGINATION_FEE_RATE;
    const interest = principal * (selectedTerm.apr / 100) * (selectedTerm.months / 12);
    const repayment = principal + interest;
    const monthly = repayment / selectedTerm.months;
    const net = principal - fee;
    const principalPct = (principal / repayment) * 100;
    const interestPct = (interest / repayment) * 100;
    return {
      originationFee: fee,
      totalInterest: interest,
      totalRepayment: repayment,
      monthlyRepayment: monthly,
      netDisbursement: net,
      principalPercent: principalPct,
      interestPercent: interestPct,
    };
  }, [principal, selectedTerm]);

  const clampPrincipal = (value: number) => Math.min(Math.max(value, MIN_AMOUNT), MAX_AMOUNT);

  const applyPrincipal = (value: number) => {
    const clamped = clampPrincipal(value);
    setPrincipal(clamped);
    setPrincipalInputText(clamped.toLocaleString());
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyPrincipal(parseInt(e.target.value, 10));
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrincipalInputText(e.target.value);
  };

  const handleAmountInputBlur = () => {
    const cleaned = parseInt(principalInputText.replace(/[^0-9]/g, ''), 10) || MIN_AMOUNT;
    applyPrincipal(cleaned);
  };

  const principalDash = (principalPercent / 100) * CIRCLE_CIRCUMFERENCE;
  const interestDash = (interestPercent / 100) * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 pt-6 pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-2">
          <span className="hover:text-primary transition-colors cursor-pointer">Overview</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-semibold">Apply</span>
          <span className="ml-3 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium tracking-wide">
            ID: ML-9824-APP
          </span>
        </div>

        {/* Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-8">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Apply for a Business or Personal Loan
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Institutional-grade liquidity calculated instantly. Zero collateral required up to KES
              100,000.
            </p>
          </div>
          <div className="inline-flex items-center gap-space-sm self-start md:self-auto bg-surface-container-lowest shadow-sm px-space-md py-space-xs rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Instant Automated Scoring Engine
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-sm mb-space-xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 gap-x-2 relative">
            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shadow-md shadow-primary/20">
                  01
                </span>
                <div className="h-1 flex-1 bg-primary rounded-full hidden md:block" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm font-bold text-primary block">
                  Loan Amount
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Step in progress
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-label-md text-label-md font-bold">
                  02
                </span>
                <div className="h-1 flex-1 bg-surface-container-high rounded-full hidden md:block" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface block">
                  Purpose &amp; Term
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Configured below
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 relative opacity-60">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-semibold">
                  03
                </span>
                <div className="h-1 flex-1 bg-surface-container-high rounded-full hidden md:block" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm font-medium text-on-surface block">
                  Financial KYC
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  M-Pesa Statement
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 relative opacity-60">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-semibold">
                  04
                </span>
                <div className="h-1 flex-1 bg-surface-container-high rounded-full hidden md:block" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm font-medium text-on-surface block">
                  Offer Acceptance
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Credit agreement
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 relative opacity-60">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-semibold">
                  05
                </span>
              </div>
              <div>
                <span className="font-label-sm text-label-sm font-medium text-on-surface block">
                  Disbursement
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Mobile Wallet or Bank
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left: inputs */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Amount selection */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-title-md">
                    payments
                  </span>
                  <h2 className="font-title-md text-title-md text-on-surface font-semibold">
                    How much would you like to borrow?
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-primary-fixed-variant font-label-sm text-label-sm font-medium">
                  Step 01
                </span>
              </div>

              <div className="relative bg-surface-container-low rounded-xl p-space-md mb-space-md">
                <div className="flex items-baseline justify-between mb-1">
                  <label
                    className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider"
                    htmlFor="loanAmountInput"
                  >
                    Disbursement Request
                  </label>
                  <span className="font-body-sm text-body-sm text-secondary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span> Pre-approved
                    tier
                  </span>
                </div>
                <div className="flex items-center gap-space-sm bg-surface-container-lowest rounded-lg px-4 py-3 shadow-inner">
                  <span className="font-headline-md text-headline-md text-on-surface-variant font-bold">
                    KES
                  </span>
                  <div className="w-[1px] h-8 bg-outline-variant" />
                  <input
                    aria-label="Borrowing Amount"
                    className="w-full bg-transparent font-display text-display text-primary font-bold focus:outline-none tracking-tight tabular-nums"
                    id="loanAmountInput"
                    type="text"
                    value={principalInputText}
                    onChange={handleAmountInputChange}
                    onBlur={handleAmountInputBlur}
                  />
                </div>

                <div className="mt-space-md px-1">
                  <input
                    className="w-full h-2.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    id="loanAmountRange"
                    max={MAX_AMOUNT}
                    min={MIN_AMOUNT}
                    step={AMOUNT_STEP}
                    type="range"
                    value={principal}
                    onChange={handleSliderChange}
                  />
                  <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm mt-3 pt-1">
                    {QUICK_AMOUNTS.map((amount, index) => (
                      <span
                        key={amount}
                        className={`cursor-pointer transition-colors ${
                          principal === amount ? 'text-primary font-bold' : 'hover:text-primary'
                        } ${index === 1 || index === 3 ? 'hidden sm:inline' : ''}`}
                        onClick={() => applyPrincipal(amount)}
                      >
                        {formatKES(amount)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-primary text-title-md shrink-0 mt-0.5">
                  verified_user
                </span>
                <div className="flex-1">
                  <span className="font-label-md text-label-md font-bold block text-primary">
                    Available limit based on KYC Level 2: KES 10,000 – KES 100,000
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Complete M-Pesa transaction statements upload in Step 03 to unlock up to KES
                    250,000 in revolving credit.
                  </p>
                </div>
              </div>
            </div>

            {/* Term selection */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-title-md">
                    schedule
                  </span>
                  <h2 className="font-title-md text-title-md text-on-surface font-semibold">
                    Repayment Term
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-primary-fixed-variant font-label-sm text-label-sm font-medium">
                  Step 02
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Select your repayment cadence. Longer amortizations reduce monthly pressure, while
                shorter terms minimize total interest.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                {LOAN_TERMS.map((term) => {
                  const isActive = term.months === selectedTermMonths;
                  return (
                    <div
                      key={term.months}
                      className={`cursor-pointer p-space-md rounded-xl transition-all relative flex flex-col justify-between h-32 ${
                        isActive
                          ? 'bg-surface-container-lowest shadow-md shadow-primary/10 ring-2 ring-primary'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                      onClick={() => setSelectedTermMonths(term.months)}
                    >
                      {term.recommended && (
                        <div className="absolute -top-2.5 right-3 bg-secondary text-on-secondary px-2 py-0.5 rounded-full font-label-sm text-[10px] uppercase font-bold tracking-wider">
                          Recommended
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <span className="font-title-md text-title-md font-bold text-on-surface">
                          {term.label}
                        </span>
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-primary' : 'bg-surface-container-highest opacity-0'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs text-on-primary">
                            check
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary block">
                          {term.aprLabel}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {term.costLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Purpose */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
              <div className="flex items-center gap-2 mb-space-md">
                <span className="material-symbols-outlined text-primary text-title-md">
                  category
                </span>
                <h2 className="font-title-md text-title-md text-on-surface font-semibold">
                  Loan Purpose &amp; Business Context
                </h2>
              </div>
              <div className="space-y-space-md">
                <div>
                  <label
                    className="block font-label-md text-label-md font-semibold text-on-surface mb-2"
                    htmlFor="loanPurposeSelect"
                  >
                    Primary Utilization Category
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-11 px-4 pr-10 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                      id="loanPurposeSelect"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    >
                      {LOAN_PURPOSES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant">
                      expand_more
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      className="font-label-md text-label-md font-semibold text-on-surface"
                      htmlFor="purposeNote"
                    >
                      Use of Funds Specification{' '}
                      <span className="text-on-surface-variant font-normal">(Optional)</span>
                    </label>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Recommended for Tier 2 loans
                    </span>
                  </div>
                  <textarea
                    className="w-full p-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-outline resize-none leading-relaxed"
                    id="purposeNote"
                    placeholder="Provide clarity on how these funds generate return for your enterprise..."
                    rows={3}
                    value={purposeNote}
                    onChange={(e) => setPurposeNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-space-md pt-2">
              <button
                className="w-full sm:flex-1 h-12 px-6 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                type="button"
              >
                <span>Save and continue to financial verification</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
              <button
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">bookmark_border</span>
                <span>Save draft and exit</span>
              </button>
            </div>

            {/* Trust strip */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-title-lg">gavel</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <strong className="font-semibold text-on-surface">
                  256-bit Bank-Grade Encryption
                </strong>{' '}
                · Licensed Digital Credit Provider under Central Bank of Kenya (CBK) regulations.
                Your privacy and credit sovereignty are preserved.
              </p>
            </div>
          </div>

          {/* Right: estimator */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
              <div className="flex items-center justify-between pb-space-md mb-space-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-title-md">
                    calculate
                  </span>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                    Estimated Loan Summary
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary-container font-label-sm text-label-sm font-semibold">
                  Live Quote
                </span>
              </div>

              <div className="bg-primary text-on-primary rounded-xl p-space-md mb-space-md shadow-md">
                <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider block mb-1">
                  Estimated Monthly Repayment
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-display font-bold tracking-tight">
                    {formatKES(monthlyRepayment)}
                  </span>
                  <span className="font-label-md text-label-md text-primary-fixed-dim font-medium">
                    / month
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-body-sm text-primary-fixed-dim mt-2 pt-2 bg-white/5 px-2.5 py-1.5 rounded-lg">
                  <span>First Installment Due:</span>
                  <span className="font-semibold text-on-primary">30 Oct 2026</span>
                </div>
              </div>

              <div className="space-y-space-sm mb-space-lg">
                <div className="flex justify-between items-center py-1 font-body-md text-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Requested Principal
                  </span>
                  <span className="font-semibold text-on-surface tabular-nums">
                    {formatKES(principal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 font-body-md text-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Total Interest ({selectedTerm.apr}% fixed p.a.)
                    <span
                      className="material-symbols-outlined text-xs text-outline cursor-help"
                      title="Calculated uniformly across designated tenure"
                    >
                      info
                    </span>
                  </span>
                  <span className="font-semibold text-on-surface tabular-nums">
                    {formatKES(totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 font-body-md text-body-md">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    Origination Fee (1.5%)
                    <span className="text-[11px] text-outline font-normal">
                      (deducted at disbursement)
                    </span>
                  </span>
                  <span className="font-semibold text-error tabular-nums">
                    {formatKES(originationFee)}
                  </span>
                </div>
                <div className="h-[1px] bg-surface-container-highest my-2" />
                <div className="flex justify-between items-center py-1">
                  <span className="font-title-md text-title-md font-bold text-on-surface">
                    Total Repayment Amount
                  </span>
                  <span className="font-title-lg text-title-lg font-bold text-primary tabular-nums">
                    {formatKES(totalRepayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md">
                  <span className="font-semibold text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">
                      account_balance_wallet
                    </span>{' '}
                    Net Disbursed Funds
                  </span>
                  <span className="font-bold text-secondary tabular-nums">
                    {formatKES(netDisbursement)}
                  </span>
                </div>
              </div>

              {/* Donut chart */}
              <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant block mb-3 uppercase tracking-wider">
                  Capital vs Interest Amortization
                </span>
                <div className="flex items-center gap-space-md">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle
                        className="text-surface-container-highest stroke-current"
                        cx="18"
                        cy="18"
                        fill="none"
                        r={CIRCLE_RADIUS}
                        strokeWidth="4"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        fill="none"
                        r={CIRCLE_RADIUS}
                        stroke="#00236f"
                        strokeDasharray={`${principalDash} ${CIRCLE_CIRCUMFERENCE}`}
                        strokeLinecap="round"
                        strokeWidth="4"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        fill="none"
                        r={CIRCLE_RADIUS}
                        stroke="#006a61"
                        strokeDasharray={`${interestDash} ${CIRCLE_CIRCUMFERENCE}`}
                        strokeDashoffset={-principalDash}
                        strokeLinecap="round"
                        strokeWidth="4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm font-bold text-on-surface">
                      {Math.round(principalPercent)}%
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 text-body-sm text-body-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                        <span>Principal Capital</span>
                      </span>
                      <span className="font-semibold tabular-nums">
                        {principalPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" />
                        <span>Borrowing Cost</span>
                      </span>
                      <span className="font-semibold tabular-nums">
                        {interestPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-space-sm rounded-xl bg-surface-container text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-base text-outline shrink-0 mt-0.5">
                    policy
                  </span>
                  <p>
                    Final terms and interest rate are determined after automated credit and mobile
                    money statement underwriting. Submitting this request does not impact your
                    credit bureau standing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-headline-sm">
                  speed
                </span>
              </div>
              <div>
                <h4 className="font-title-md text-title-md font-bold text-on-surface">
                  Disbursement in &lt; 5 Minutes
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Direct integration with Safaricom M-Pesa B2C corridors guarantees instant wallet
                  delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
