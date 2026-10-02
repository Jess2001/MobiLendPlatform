import React, { ReactNode } from 'react';

type BadgeTone = 'success' | 'neutral' | 'error' | 'info' | 'accent';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: string;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-tertiary-container/15 text-tertiary',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  error: 'bg-error-container text-on-error-container',
  info: 'bg-secondary-container/20 text-secondary',
  accent: 'bg-tertiary-container/10 text-on-tertiary-container',
};

/**
 * Small rounded-pill label. Covers status pills ("Completed"), tier badges
 * ("Tier 1"), and tag pills ("Recommended", "Active Schedule").
 */
const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', icon, children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${TONE_CLASSES[tone]} ${className}`}
  >
    {icon && <span className="material-symbols-outlined text-xs">{icon}</span>}
    {children}
  </span>
);

export default Badge;
