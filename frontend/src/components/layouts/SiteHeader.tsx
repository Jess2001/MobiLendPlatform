import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/', label: 'Overview' },
  { path: '/my-loan', label: 'My Loan' },
  { path: '/apply', label: 'Apply' },
  { path: '/repayments', label: 'Repayments' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/profile', label: 'Profile' },
];

const SiteHeader: React.FC = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
    <div className="h-16 max-w-screen-2xl mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-lg">
        <Link
          className="flex items-center gap-space-sm focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          to="/"
        >
          <img
            alt="MobiLend Brand Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VOZ3YwUxuRKGmRBE9LynCPWt7JJNvOZPVzliQ6WQORsz82ho1rznTQneCJFvkf3mljVMy42rALW6vjtSnXTbleicc-QurKKESIyDsYO7wf8qdOeZrx8260_Z4qNnEGb87PPanVztHUmAz5UgwOUV_TvsnWi-x4Lk31yIf7_bkhQUS8Fr4ahGT004_hzC_u92JakEgtNmblafyA2Ac-yn-dARYT8dgSVz0bZSI6osLIGMdqclefn58"
          />
          <span className="font-title-md text-title-md text-primary tracking-tight font-bold">
            MobiLend
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-space-lg h-16">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `py-space-sm font-label-md text-label-md transition-colors ${
                  isActive
                    ? 'text-primary font-title-sm border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-space-md">
        <div className="hidden sm:inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container text-tertiary-container font-label-sm text-label-sm font-semibold">
          <span className="material-symbols-outlined text-sm text-tertiary-container">
            verified_user
          </span>
          <span>Account Verified ✓</span>
        </div>
        <button
          aria-label="Notifications"
          className="relative p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-title-lg">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>
        <div className="flex items-center gap-space-sm pl-space-xs">
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_ABQ4rpeCSVhf-G3YzRcavQFqVIaGGbHGg4S8sn5vZW0aniypn2fSGUO4edW15gG7XRIPHWuL7jNdoGHRtNAGvf20bkOXfN0gPodgS8VPp9BmI3ibjxHIApZbL2geQS7q17PZUVU56i11m-fX8gLQPvR8xk2DW6U2i11ut4U98rpRRLXDuWKOXyCNXkBcos-VvWR2DyKFhHn-9igJ9YBUo9yolc7cieq-1Njakk3yS2zCAOA6sg"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface leading-tight">
              Jecinta Wangui
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant leading-none">
              KES Tier 1
            </span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default SiteHeader;
