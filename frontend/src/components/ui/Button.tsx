import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Material Symbols icon name, e.g. "arrow_forward" */
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container shadow-sm shadow-primary/20 focus:ring-primary-container',
  secondary: 'bg-primary-container text-on-primary hover:bg-primary focus:ring-primary-container',
  outline: 'bg-surface-container-low hover:bg-surface-container text-primary focus:ring-primary',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-10 px-space-md text-label-md',
  lg: 'h-12 px-6 text-label-md',
};

/**
 * Shared button primitive. Covers the primary CTA, secondary/container, and
 * outline/low-emphasis variants that recur across every MobiLend screen
 * (e.g. "Make a repayment", "View loan details", "Pay Now").
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-label-md font-bold transition-all active:scale-[0.99] focus:outline-none focus:ring-2 ${
        VARIANT_CLASSES[variant]
      } ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-base">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-base">{icon}</span>
      )}
    </button>
  );
};

export default Button;
