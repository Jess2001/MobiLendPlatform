import React, { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  valueClassName?: string;
  helperText?: string;
  helperClassName?: string;
  children?: ReactNode;
}

/**
 * Label-over-value metric cell. Used in the loan summary breakdown
 * (Original Loan, Amount Repaid, Next Repayment, Due Date) and reusable for
 * any similar metric grid on later screens.
 */
const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  valueClassName = 'text-on-surface',
  helperText,
  helperClassName = 'text-error',
  children,
}) => (
  <div className="space-y-1">
    <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
    <p className={`font-title-md text-title-md font-semibold tabular-nums ${valueClassName}`}>
      {value}
    </p>
    {helperText && (
      <span className={`inline-block font-body-sm text-body-sm font-medium ${helperClassName}`}>
        {helperText}
      </span>
    )}
    {children}
  </div>
);

export default StatCard;
