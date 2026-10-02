import React from 'react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import StatCard from './ui/StatCard';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TransactionStatus = 'Completed' | 'Pending' | 'Failed';
type TransactionDirection = 'debit' | 'credit';

interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: string;
  direction: TransactionDirection;
  status: TransactionStatus;
}

interface LoanSummary {
  outstandingBalance: string;
  originalLoan: string;
  amountRepaid: string;
  nextRepaymentAmount: string;
  dueDate: string;
  daysUntilDue: number;
  progressPercent: number;
  installmentsPaid: number;
  installmentsTotal: number;
  remainingAmount: string;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const loanSummary: LoanSummary = {
  outstandingBalance: 'KES 42,500',
  originalLoan: 'KES 60,000',
  amountRepaid: 'KES 17,500',
  nextRepaymentAmount: 'KES 5,000',
  dueDate: '30 Sep 2026',
  daysUntilDue: 14,
  progressPercent: 29.2,
  installmentsPaid: 3,
  installmentsTotal: 12,
  remainingAmount: 'KES 42,500',
};

const transactions: Transaction[] = [
  {
    id: 'TXN-99481',
    date: '15 Sep 2026',
    description: 'Scheduled Repayment (M-Pesa)',
    reference: 'TXN-99481',
    amount: '-KES 5,000',
    direction: 'debit',
    status: 'Completed',
  },
  {
    id: 'TXN-88210',
    date: '15 Aug 2026',
    description: 'Scheduled Repayment (M-Pesa)',
    reference: 'TXN-88210',
    amount: '-KES 5,000',
    direction: 'debit',
    status: 'Completed',
  },
  {
    id: 'TXN-77192',
    date: '15 Jul 2026',
    description: 'Scheduled Repayment (M-Pesa)',
    reference: 'TXN-77192',
    amount: '-KES 5,000',
    direction: 'debit',
    status: 'Completed',
  },
  {
    id: 'DISB-44019',
    date: '01 Jul 2026',
    description: 'Working Capital Disbursement',
    reference: 'DISB-44019',
    amount: '+KES 60,000',
    direction: 'credit',
    status: 'Completed',
  },
];

// ---------------------------------------------------------------------------
// Page-specific sub-components
// ---------------------------------------------------------------------------

const StatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  const tone = status === 'Completed' ? 'success' : status === 'Failed' ? 'error' : 'neutral';
  const icon = status === 'Completed' ? 'check_circle' : status === 'Failed' ? 'error' : 'schedule';
  return (
    <Badge tone={tone} icon={icon}>
      {status}
    </Badge>
  );
};

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const isCredit = transaction.direction === 'credit';
  return (
    <tr className="hover:bg-surface-container-lowest/80 transition-colors">
      <td className="py-4 px-6 text-on-surface whitespace-nowrap font-medium">
        {transaction.date}
      </td>
      <td className="py-4 px-4 text-on-surface">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCredit
                ? 'bg-primary-container/15 text-primary'
                : 'bg-secondary-container/30 text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isCredit ? 'arrow_downward' : 'arrow_upward'}
            </span>
          </span>
          <span className="font-medium">{transaction.description}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-on-surface-variant font-mono text-label-sm whitespace-nowrap">
        {transaction.reference}
      </td>
      <td
        className={`py-4 px-4 text-right font-semibold tabular-nums whitespace-nowrap ${
          isCredit ? 'text-secondary font-bold' : 'text-on-surface'
        }`}
      >
        {transaction.amount}
      </td>
      <td className="py-4 px-6 text-right whitespace-nowrap">
        <StatusBadge status={transaction.status} />
      </td>
    </tr>
  );
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const MobiLendDashboard: React.FC = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full space-y-space-lg">
        {/* Top greeting area */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Good morning, Jecinta
              </h1>
              <Badge tone="accent" icon="verified">
                Tier 1
              </Badge>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Here&apos;s your financial overview as of 30 Sep 2026, 09:15 EAT
            </p>
          </div>
          <div className="inline-flex items-center gap-space-sm px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              KYC Level 2 Verified ·{' '}
              <strong className="text-on-surface font-semibold">Credit Limit KES 100,000</strong>
            </span>
          </div>
        </header>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left column */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* Primary balance & overview card */}
            <Card padding="lg" className="relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-44 h-44 bg-surface-container-low rounded-full pointer-events-none opacity-60" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                      Current Balance
                    </span>
                    <h2 className="font-title-md text-title-md text-primary font-bold">
                      Outstanding Loan
                    </h2>
                  </div>
                  <Badge tone="info">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Active Schedule
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-md">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-display text-primary font-bold tracking-tight">
                      {loanSummary.outstandingBalance}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      principal + accrued
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
                    <Button icon="arrow_forward">Make a repayment</Button>
                    <Button variant="outline" icon={undefined}>
                      View loan details
                    </Button>
                  </div>
                </div>

                {/* Metric breakdown matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md pt-4 bg-surface-container-low/70 p-space-md rounded-xl">
                  <StatCard label="Original Loan" value={loanSummary.originalLoan} />
                  <StatCard
                    label="Amount Repaid"
                    value={loanSummary.amountRepaid}
                    valueClassName="text-secondary"
                  />
                  <StatCard label="Next Repayment" value={loanSummary.nextRepaymentAmount} />
                  <StatCard
                    label="Due Date"
                    value={loanSummary.dueDate}
                    helperText={`Due in ${loanSummary.daysUntilDue} days`}
                  />
                </div>

                {/* Repayment progression bar */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-body-sm font-body-sm">
                    <span className="text-on-surface font-medium">
                      Repayment Progress:{' '}
                      <strong className="text-secondary font-bold">
                        {loanSummary.progressPercent}%
                      </strong>
                    </span>
                    <span className="text-on-surface-variant">
                      {loanSummary.installmentsPaid} of {loanSummary.installmentsTotal} installments
                      paid on time
                    </span>
                  </div>
                  <ProgressBar percent={loanSummary.progressPercent} color="secondary" />
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                    <span>{loanSummary.amountRepaid} settled</span>
                    <span>{loanSummary.remainingAmount} remaining</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming repayment notice */}
            <Card
              padding="sm"
              as="aside"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md"
            >
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-title-lg">calendar_clock</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md font-bold text-on-surface">
                      Upcoming repayment: {loanSummary.nextRepaymentAmount}
                    </span>
                    <Badge tone="neutral">Due in {loanSummary.daysUntilDue} days</Badge>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Due on {loanSummary.dueDate} via registered M-Pesa account ending in ••• 418
                  </p>
                </div>
              </div>
              <Button variant="secondary" icon="chevron_right">
                Pay Now
              </Button>
            </Card>

            {/* Recent transactions */}
            <Card padding="none" className="overflow-hidden flex flex-col">
              <div className="px-6 py-5 flex items-center justify-between bg-surface-container-lowest">
                <div>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                    Recent Transactions
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Authorized settlements &amp; credit ledger activities
                  </p>
                </div>
                <a
                  className="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary hover:text-primary-container transition-colors"
                  href="#"
                >
                  <span>View all transactions</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </a>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      <th className="py-3.5 px-6 font-semibold" scope="col">
                        Date
                      </th>
                      <th className="py-3.5 px-4 font-semibold" scope="col">
                        Description
                      </th>
                      <th className="py-3.5 px-4 font-semibold" scope="col">
                        Reference
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-right" scope="col">
                        Amount
                      </th>
                      <th className="py-3.5 px-6 font-semibold text-right" scope="col">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                    {transactions.map((transaction) => (
                      <TransactionRow key={transaction.id} transaction={transaction} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right column (sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Pre-approved expansion card */}
            <Card
              padding="lg"
              className="relative overflow-hidden flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">
                    Instant Eligibility
                  </span>
                  <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                    Pre-approved Credit
                  </h3>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Pre-approved for up to{' '}
                  <strong className="text-on-surface font-semibold">KES 85,000</strong> for
                  equipment financing based on your consistent 3-month repayment history.
                </p>
                <div className="pt-2">
                  <img
                    alt="Small business owner organizing inventory in a boutique workshop"
                    className="w-full h-36 object-cover rounded-lg shadow-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjA4D3HxZxz4XnfwQEe_qzlLk-A-55UXFaCUKrB8JB08S1gHgxX6b-wHs9gJ2F2DIorpjXgqoJInbURZbiAISZC8DXuiYkqYmX4F-wAzurXxpD4b5zWbJ2gZexPR-9fJ9orcjOi05Fb1Zra5kvLEj2SnaImDGXkULvovOruFbx8Sby3UR1n0Kj3Z0zZhETvbI3AUgO0qrpxCWERjjDkZNLcLhFanweHovZLS22ee9CZkBYlcOGBA"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Button fullWidth icon="arrow_forward">
                  Claim Equipment Credit
                </Button>
                <p className="font-body-sm text-body-sm text-center text-on-surface-variant">
                  0% commitment fee · 48-hr rollout
                </p>
              </div>
            </Card>

            {/* Underwriting trust & bureau performance */}
            <div className="rounded-xl bg-surface-container-low p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  CRB Credit Index
                </span>
                <span className="font-label-sm text-label-sm font-bold text-tertiary">
                  Excellent (748 / 800)
                </span>
              </div>
              <div className="space-y-1.5">
                <ProgressBar percent={93.5} color="tertiary" height="sm" />
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Metropol &amp; Creditinfo</span>
                  <span>Updated 3 days ago</span>
                </div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">shield_with_heart</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Consistent settlements unlock reduced monthly rates at Tier 2 escalation.
                </p>
              </div>
            </div>

            {/* Support specialist help card */}
            <Card padding="md" className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">headset_mic</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-title-md text-title-md font-bold text-on-surface">
                    Dedicated Lending Specialist
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Available 24/7 via WhatsApp or Direct Toll-Free
                  </p>
                </div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">
                    phone_in_talk
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    0800 536 300
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  Toll-Free
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary font-label-sm text-label-sm transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>WhatsApp</span>
                </a>
                <a
                  className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary font-label-sm text-label-sm transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  <span>Email Desk</span>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobiLendDashboard;
