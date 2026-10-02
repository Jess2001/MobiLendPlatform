import React from 'react';
import { NavLink } from 'react-router-dom';

const MOBILE_NAV_LINKS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/my-loan', label: 'Loan', icon: 'credit_score' },
  { path: '/apply', label: 'Apply', icon: 'add_circle' },
  { path: '/repayments', label: 'Repay', icon: 'payments' },
  { path: '/profile', label: 'Account', icon: 'person' },
];

const MobileNav: React.FC = () => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
    <nav className="flex items-center justify-around h-14 px-gutter-mobile">
      {MOBILE_NAV_LINKS.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 ${
              isActive
                ? 'text-primary font-bold'
                : 'text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-title-md">{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
);

export default MobileNav;
