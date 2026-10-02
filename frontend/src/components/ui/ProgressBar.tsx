import React from 'react';

interface ProgressBarProps {
  percent: number;
  color?: 'secondary' | 'tertiary' | 'primary';
  trackClassName?: string;
  height?: 'sm' | 'md';
}

const COLOR_CLASSES: Record<NonNullable<ProgressBarProps['color']>, string> = {
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  primary: 'bg-primary',
};

const HEIGHT_CLASSES: Record<NonNullable<ProgressBarProps['height']>, string> = {
  sm: 'h-2',
  md: 'h-3',
};

/**
 * Horizontal progress track. Used for both the loan repayment progress bar
 * and the CRB credit index gauge — same visual shape, different color/height.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  color = 'secondary',
  trackClassName = 'bg-surface-container-high',
  height = 'md',
}) => (
  <div
    aria-valuemax={100}
    aria-valuemin={0}
    aria-valuenow={percent}
    className={`w-full ${HEIGHT_CLASSES[height]} ${trackClassName} rounded-full overflow-hidden flex`}
    role="progressbar"
  >
    <div
      className={`h-full ${COLOR_CLASSES[color]} rounded-full transition-all duration-500`}
      style={{ width: `${percent}%` }}
    />
  </div>
);

export default ProgressBar;
