import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import StatCard from './ui/StatCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LifecycleStatus = 'complete' | 'active' | 'upcoming';

interface LifecycleStage {
  key: string;
  label: string;
  sublabel: string;
  icon: string;
  status: LifecycleStatus;
  extraBadge?: string;
}

type InstallmentStatus = 'Paid' | 'Due Soon' | 'Scheduled';

interface Installment {
  number: string;
  dueDate: string;
  dueNote?: string;
  principal: number;
  interest: number;
  total: number;
  status: InstallmentStatus;
  receiptRef?: string;
  highlighted?: boolean;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    key: 'applied',
    label: 'Applied',
    sublabel: '01 Jul, 10:14',
    icon: 'check',
    status: 'complete',
  },
  {
    key: 'assessed',
    label: 'Assessed',
    sublabel: 'Score: 785/900',
    icon: 'check',
    status: 'complete',
  },
  {
    key: 'approved',
    label: 'Approved',
    sublabel: '01 Jul, 10:18',
    icon: 'check',
    status: 'complete',
  },
  {
    key: 'disbursement',
    label: 'Disbursement',
    sublabel: '01 Jul, 10:20',
    icon: 'check',
    status: 'complete',
  },
  {
    key: 'funds-received',
    label: 'Funds Received',
    sublabel: 'M-Pesa ···890',
    icon: 'account_balance_wallet',
    status: 'complete',
  },
  {
    key: 'repayments',
    label: 'Repayments',
    sublabel: '3 of 12 complete',
    icon: 'payments',
    status: 'active',
    extraBadge: 'Due in 14 days',
  },
  { key: 'completed', label: 'Completed', sublabel: 'Jun 2027', icon: 'flag', status: 'upcoming' },
];

const LIFECYCLE_PROGRESS_PERCENT = 82;

const VISIBLE_INSTALLMENTS: Installment[] = [
  {
    number: '#01',
    dueDate: '30 Jul 2026',
    principal: 4200,
    interest: 800,
    total: 5000,
    status: 'Paid',
    receiptRef: '#REC-77192',
  },
  {
    number: '#02',
    dueDate: '30 Aug 2026',
    principal: 4250,
    interest: 750,
    total: 5000,
    status: 'Paid',
    receiptRef: '#REC-88210',
  },
  {
    number: '#03',
    dueDate: '15 Sep 2026',
    dueNote: 'Early Settlement',
    principal: 6500,
    interest: 1000,
    total: 7500,
    status: 'Paid',
    receiptRef: '#REC-99481',
  },
  {
    number: '#04',
    dueDate: '30 Sep 2026',
    dueNote: '14 days left',
    principal: 4300,
    interest: 700,
    total: 5000,
    status: 'Due Soon',
    highlighted: true,
  },
  {
    number: '#05',
    dueDate: '30 Oct 2026',
    principal: 4350,
    interest: 650,
    total: 5000,
    status: 'Scheduled',
  },
  {
    number: '#06',
    dueDate: '30 Nov 2026',
    principal: 4400,
    interest: 600,
    total: 5000,
    status: 'Scheduled',
  },
];

const REMAINING_INSTALLMENTS: Installment[] = [
  {
    number: '#07',
    dueDate: '31 Dec 2026',
    principal: 4450,
    interest: 550,
    total: 5000,
    status: 'Scheduled',
  },
  {
    number: '#08',
    dueDate: '31 Jan 2027',
    principal: 4500,
    interest: 500,
    total: 5000,
    status: 'Scheduled',
  },
  {
    number: '#09',
    dueDate: '28 Feb 2027',
    principal: 4550,
    interest: 450,
    total: 5000,
    status: 'Scheduled',
  },
  {
    number: '#10',
    dueDate: '31 Mar 2027',
    principal: 4600,
    interest: 400,
    total: 5000,
    status: 'Scheduled',
  },
  {
    number: '#11',
    dueDate: '30 Apr 2027',
    principal: 4650,
    interest: 350,
    total: 5000,
    status: 'Scheduled',
  },
  {
    number: '#12',
    dueDate: '31 May 2027',
    principal: 4700,
    interest: 300,
    total: 5000,
    status: 'Scheduled',
  },
];

const REPAYMENT_PRESETS = [
  { label: '5,000 (Due)', amount: 5000 },
  { label: '10,000', amount: 10000 },
  { label: 'Full Settle', amount: 42500 },
];

const formatNumber = (value: number) => value.toLocaleString();

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LifecycleNode: React.FC<{ stage: LifecycleStage; width: string }> = ({ stage, width }) => {
  const isActive = stage.status === 'active';
  const isUpcoming = stage.status === 'upcoming';

  return (
    <div
      className={`relative z-10 flex flex-col items-center text-center ${width} ${isUpcoming ? 'opacity-60' : ''}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform ${
          isActive
            ? 'bg-primary text-on-primary ring-4 ring-primary/20 shadow-md'
            : isUpcoming
              ? 'bg-surface-container text-on-surface-variant'
              : 'bg-secondary-container text-on-secondary-container hover:scale-105'
        }`}
      >
        <span className={`material-symbols-outlined text-lg ${isActive ? 'animate-pulse' : ''}`}>
          {stage.icon}
        </span>
      </div>
      <span
        className={`font-label-sm text-label-sm mt-2 leading-snug ${
          isActive
            ? 'font-bold text-primary'
            : isUpcoming
              ? 'font-medium text-on-surface-variant'
              : 'font-semibold text-on-surface'
        }`}
      >
        {stage.label}
      </span>
      <span
        className={`font-body-sm text-body-sm text-[11px] leading-tight ${
          isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
        }`}
      >
        {stage.sublabel}
      </span>
      {stage.extraBadge && (
        <span className="mt-0.5 inline-block px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-medium tracking-tight">
          {stage.extraBadge}
        </span>
      )}
    </div>
  );
};

const INSTALLMENT_STATUS_STYLES: Record<InstallmentStatus, string> = {
  Paid: 'bg-secondary-container/60 text-secondary',
  'Due Soon': 'bg-error-container text-on-error-container',
  Scheduled: 'bg-surface-container text-on-surface-variant',
};

const InstallmentRow: React.FC<{ installment: Installment }> = ({ installment }) => {
  const isPaid = installment.status === 'Paid';
  const isDueSoon = installment.status === 'Due Soon';

  return (
    <tr
      className={`transition-colors ${
        isDueSoon
          ? 'bg-surface-container/60 hover:bg-surface-container shadow-sm'
          : 'hover:bg-surface-container-low/40'
      }`}
    >
      <td
        className={`py-3.5 px-space-md font-tabular-stat ${
          isDueSoon ? 'font-bold text-primary' : 'font-medium text-on-surface'
        }`}
      >
        {installment.number}
      </td>
      <td className="py-3.5 px-space-md">
        {installment.dueNote ? (
          <div className="flex flex-col">
            <span className={`${isDueSoon ? 'font-bold' : 'font-medium'} text-on-surface`}>
              {installment.dueDate}
            </span>
            <span
              className={`text-[10px] font-semibold ${isDueSoon ? 'text-error' : 'text-secondary'}`}
            >
              {installment.dueNote}
            </span>
          </div>
        ) : (
          <span className="text-on-surface-variant">{installment.dueDate}</span>
        )}
      </td>
      <td className="py-3.5 px-space-md text-right font-tabular-stat">
        {formatNumber(installment.principal)}
      </td>
      <td className="py-3.5 px-space-md text-right font-tabular-stat text-on-surface-variant">
        {formatNumber(installment.interest)}
      </td>
      <td
        className={`py-3.5 px-space-md text-right font-tabular-stat ${
          isDueSoon ? 'font-bold text-on-surface' : 'font-semibold'
        }`}
      >
        {formatNumber(installment.total)}
      </td>
      <td className="py-3.5 px-space-md text-center">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${INSTALLMENT_STATUS_STYLES[installment.status]}`}
        >
          {isDueSoon && <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />}
          {installment.status}
        </span>
      </td>
      <td className="py-3.5 px-space-md text-right">
        {isPaid && installment.receiptRef ? (
          <a
            className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold"
            href="#"
          >
            <span className="material-symbols-outlined text-sm">receipt</span>
            <span>{installment.receiptRef}</span>
          </a>
        ) : isDueSoon ? (
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-bold shadow-sm transition-all active:scale-95"
            type="button"
          >
            <span>Pay</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        ) : (
          <span className="text-on-surface-variant">—</span>
        )}
      </td>
    </tr>
  );
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const LoanDetailsPage: React.FC = () => {
  const [showAllRows, setShowAllRows] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(5000);

  const allInstallments = useMemo(
    () =>
      showAllRows ? [...VISIBLE_INSTALLMENTS, ...REMAINING_INSTALLMENTS] : VISIBLE_INSTALLMENTS,
    [showAllRows],
  );

  return (
    <div className="flex flex-col w-full gap-space-lg pb-12">
      {/* Sub-header & breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <a className="hover:text-primary transition-colors" href="#">
              Portfolios
            </a>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <a className="hover:text-primary transition-colors" href="#">
              SME Term Credit
            </a>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface font-medium">Facility #ML-LN-2026-0924</span>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm mt-1">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Loan Facility #ML-LN-2026-0924
            </h1>
            <Badge tone="info" className="!bg-secondary-container/40 !text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Active · In Good Standing
            </Badge>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-x-space-md gap-y-1 mt-0.5">
            <span className="font-medium text-on-surface">SME Working Capital Term Loan</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span>
              Disbursed: <strong className="text-on-surface font-medium">01 Jul 2026</strong>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span>
              Maturity: <strong className="text-on-surface font-medium">30 Jun 2027</strong> (12
              Mo.)
            </span>
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-start lg:self-center">
          <Button variant="secondary" icon="download" iconPosition="left">
            Statement
          </Button>
          <Button
            icon="bolt"
            iconPosition="left"
            onClick={() =>
              document.getElementById('quick-repay-card')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Make Repayment
          </Button>
        </div>
      </div>

      {/* Lifecycle progress tracker */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-title-md">
              account_tree
            </span>
            <span className="font-title-md text-title-md text-on-surface font-bold">
              Facility Lifecycle Progression
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            Underwritten via MobiLend Automated Engine
          </span>
        </div>
        <div className="relative overflow-x-auto pb-2">
          <div className="min-w-[820px] flex items-start justify-between relative">
            <div className="absolute top-5 left-6 right-6 h-1 bg-surface-container -z-0">
              <div
                className="h-full bg-secondary"
                style={{ width: `${LIFECYCLE_PROGRESS_PERCENT}%` }}
              />
            </div>
            {LIFECYCLE_STAGES.map((stage, index) => (
              <LifecycleNode
                key={stage.key}
                stage={stage}
                width={index === 5 ? 'w-40' : index === 1 || index === 4 ? 'w-36' : 'w-28'}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Financial summary bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
        <div className="xl:col-span-2 bg-primary text-on-primary rounded-xl p-space-lg shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          <div className="flex items-center justify-between z-10">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container">
              Current Balance
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-on-primary text-[11px] font-medium">
              Principal &amp; Interest
            </span>
          </div>
          <div className="my-space-md z-10">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-label-md text-label-md text-on-primary-container">KES</span>
              <span className="font-display text-display font-bold tracking-tight text-on-primary">
                42,500
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-primary-container mt-1">
              Reflects early pay reduction of KES 7,500
            </p>
          </div>
          <div className="pt-space-sm bg-white/5 -mx-space-lg -mb-space-lg px-space-lg pb-space-md z-10 flex items-center justify-between text-xs">
            <span className="text-on-primary-container">
              Total Facility: <strong>KES 68,400</strong>
            </span>
            <span className="text-secondary-fixed font-semibold">25.6% settled</span>
          </div>
        </div>

        <Card padding="sm" className="flex flex-col justify-between">
          <StatCard
            label="Principal Disbursed"
            value="60,000"
            helperText="Credited to M-Pesa 01 Jul"
            helperClassName="text-on-surface-variant"
          />
        </Card>

        <Card padding="sm" className="flex flex-col justify-between">
          <StatCard
            label="Annual Fixed Rate"
            value="14.0% p.a."
            helperText="CBK Tier-1 Regulated cap"
            helperClassName="text-secondary"
          />
        </Card>

        <Card padding="sm" className="flex flex-col justify-between">
          <StatCard
            label="Total Settled"
            value="17,500"
            valueClassName="text-secondary"
            helperText="3 Installments cleared"
            helperClassName="text-on-surface-variant"
          />
        </Card>

        <Card
          padding="sm"
          className="flex flex-col justify-between !bg-gradient-to-br from-surface-container-lowest to-surface-container-low"
        >
          <StatCard
            label="Next Installment"
            value="5,000"
            helperText="Due: 30 Sep 2026 (14d)"
            helperClassName="text-primary"
          />
        </Card>
      </div>

      {/* Main workspace grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: schedule table */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <Card padding="none" className="overflow-hidden">
            <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <h2 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Repayment Amortization Schedule
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Structured 12-month equal monthly installments (EMI)
                </p>
              </div>
              <Badge tone="neutral">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                Principal + Interest
              </Badge>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-3 px-space-md font-semibold">Inst #</th>
                    <th className="py-3 px-space-md font-semibold">Due Date</th>
                    <th className="py-3 px-space-md font-semibold text-right">Principal</th>
                    <th className="py-3 px-space-md font-semibold text-right">Interest</th>
                    <th className="py-3 px-space-md font-semibold text-right">Total Due</th>
                    <th className="py-3 px-space-md font-semibold text-center">Status</th>
                    <th className="py-3 px-space-md font-semibold text-right">Action / Receipt</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm font-body-sm text-on-surface">
                  {allInstallments.map((installment) => (
                    <InstallmentRow key={installment.number} installment={installment} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-space-md bg-surface-container-low/50 flex items-center justify-center">
              <button
                className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md hover:underline font-semibold"
                onClick={() => setShowAllRows((prev) => !prev)}
                type="button"
              >
                <span>
                  {showAllRows
                    ? 'Hide remaining 6 installments'
                    : 'Show remaining 6 scheduled installments'}
                </span>
                <span className="material-symbols-outlined text-base">
                  {showAllRows ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>
          </Card>

          {/* Interest savings insight */}
          <Card
            padding="lg"
            className="flex flex-col md:flex-row items-center justify-between gap-space-md"
          >
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/50 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-title-lg">trending_up</span>
              </div>
              <div>
                <h4 className="font-title-md text-title-md text-on-surface font-bold">
                  Interest Savings via Overpayment
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Your early payment on 15 Sep decreased principal ahead of schedule, saving KES 940
                  in future compound interest.
                </p>
              </div>
            </div>
            <button
              className="shrink-0 px-space-md py-2 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
              type="button"
            >
              View Ledger Breakdown
            </button>
          </Card>
        </div>

        {/* Right: actions, autopay, documents */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Express repayment */}
          <Card padding="lg" id="quick-repay-card">
            <div className="flex items-center gap-space-xs mb-space-sm text-primary">
              <span className="material-symbols-outlined text-title-md">payments</span>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                Express Repayment
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Make an early repayment or enter a custom amount to reduce accrued interest.
            </p>
            <div className="flex flex-col gap-space-sm mb-space-md">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
                Select Amount (KES)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {REPAYMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    className={`px-2.5 py-2 rounded-lg text-center font-label-sm text-label-sm font-semibold transition-colors ${
                      customAmount === preset.amount
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                    onClick={() => setCustomAmount(preset.amount)}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant font-label-md text-label-md font-semibold">
                  KES
                </div>
                <input
                  className="w-full pl-14 pr-3 py-2.5 bg-surface-container-low rounded-lg text-on-surface font-title-md text-title-md font-bold focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-sm"
                  onChange={(e) => setCustomAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="Custom amount"
                  type="number"
                  value={customAmount}
                />
              </div>
            </div>
            <Button fullWidth size="lg" icon="touch_app" iconPosition="left">
              Trigger Instant M-Pesa STK Push
            </Button>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center text-[11px] mt-2">
              Instant payment reflection on MobiLend Ledger
            </p>
          </Card>

          {/* Auto-debit */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs text-on-surface">
                <span className="material-symbols-outlined text-secondary text-title-md">
                  sync_saved_locally
                </span>
                <h3 className="font-title-md text-title-md font-bold">M-Pesa Auto-Debit</h3>
              </div>
              <Badge tone="success" className="!bg-secondary-container/60">
                Active
              </Badge>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Scheduled installments are auto-debited at 06:00 EAT on the due date.
            </p>
            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary text-xl">phone_iphone</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  +254 712 345 678
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                  Primary Safaricom Line · Verified
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-space-md pt-space-sm">
              <button
                className="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold hover:underline"
                type="button"
              >
                Manage debit limit
              </button>
              <button
                className="text-on-surface-variant hover:text-error font-label-sm text-label-sm hover:underline"
                type="button"
              >
                Pause Autopay
              </button>
            </div>
          </Card>

          {/* Documents */}
          <Card padding="lg">
            <div className="flex items-center gap-space-xs mb-space-sm text-on-surface">
              <span className="material-symbols-outlined text-primary text-title-md">
                folder_open
              </span>
              <h3 className="font-title-md text-title-md font-bold">Facility Documentation</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Legally binding, digital agreements stamped with CBK compliance credentials.
            </p>
            <div className="flex flex-col gap-space-xs">
              <a
                className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group"
                href="#"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-error text-xl shrink-0">
                    picture_as_pdf
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate group-hover:text-primary">
                      Loan_Contract_ML-LN-2026-0924.pdf
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                      240 KB · Signed 01 Jul 2026
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg shrink-0">
                  file_download
                </span>
              </a>
              <a
                className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group"
                href="#"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-primary text-xl shrink-0">
                    description
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate group-hover:text-primary">
                      Disbursement_Confirmation_Advice.pdf
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                      115 KB · Safaricom B2C Hash
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg shrink-0">
                  file_download
                </span>
              </a>
            </div>
          </Card>

          {/* Credit officer contact */}
          <div className="rounded-xl bg-surface-container-low p-space-md flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary">support_agent</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Assigned Credit Officer
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  David Mutua · Desk #04
                </span>
              </div>
            </div>
            <button
              className="px-space-sm py-1 rounded bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold shadow-sm transition-colors"
              type="button"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsPage;
