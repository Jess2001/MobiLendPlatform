import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  /** Content for the left (desktop) brand/trust panel. Hidden on mobile. */
  brandPanel: React.ReactNode;
  /** The form card itself. */
  children: React.ReactNode;
  /** Constrain the overall width — most screens use the default. */
  maxWidthClassName?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  brandPanel,
  children,
  maxWidthClassName = 'max-w-6xl',
}) => {
  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="w-full bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin h-16 flex items-center justify-between">
          <Link className="flex items-center gap-space-sm" to="/">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[28px]">
                account_balance
              </span>
              <span className="font-title-lg text-title-lg text-primary tracking-tight">
                MobiLend
              </span>
            </div>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span className="hidden sm:inline-block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Financial Services
            </span>
          </Link>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                verified_user
              </span>
              <span className="font-label-sm text-label-sm font-medium">256-Bit SSL Encrypted</span>
            </div>
            <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-tertiary-container text-[16px]">
                lock
              </span>
              <span className="font-label-sm text-label-sm font-medium">CBK Regulated</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-center p-gutter-mobile lg:p-margin">
        <div
          className={`flex flex-col w-full ${maxWidthClassName} mx-auto py-space-md lg:py-space-xl`}
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-space-xl items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between p-space-lg lg:p-space-xl bg-surface-container-low rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">{brandPanel}</div>
            </div>
            <div className="lg:col-span-7 flex flex-col justify-center">{children}</div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-gutter-mobile lg:px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant">
          <span className="font-body-sm text-body-sm text-center md:text-left">
            © 2024 MobiLend Financial Services Ltd. Regulated by the Central Bank of Kenya (CBK).
          </span>
          <div className="flex items-center gap-space-lg">
            <a
              className="font-label-sm text-label-sm hover:text-on-surface transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-label-sm text-label-sm hover:text-on-surface transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="font-label-sm text-label-sm hover:text-on-surface transition-colors"
              href="#"
            >
              Security Standards
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
