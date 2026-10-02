import React, { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none';
  as?: 'div' | 'section' | 'aside';
  children: ReactNode;
}

const PADDING_CLASSES: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-space-lg',
  lg: 'p-6 sm:p-8',
};

/**
 * The recurring "bg-surface-container-lowest rounded-xl shadow-sm" surface
 * used for every panel on the Overview and Apply screens (balance card,
 * transactions table wrapper, sidebar cards, form sections).
 */
const Card: React.FC<CardProps> = ({
  padding = 'md',
  as = 'div',
  className = '',
  children,
  ...rest
}) => {
  const Component = as;
  return (
    <Component
      className={`rounded-xl bg-surface-container-lowest shadow-sm ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Card;
