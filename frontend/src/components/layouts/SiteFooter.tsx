import React from 'react';

const SiteFooter: React.FC = () => (
  <footer className="hidden md:block w-full bg-surface-container-low mt-space-xl">
    <div className="max-w-screen-2xl mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
        <span className="font-label-md text-label-md font-bold text-primary">MobiLend Africa</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Regulated Digital Credit Provider (CBK)
        </span>
      </div>
      <div className="font-body-sm text-body-sm text-on-surface-variant">
        © 2024 MobiLend Limited. Institutional grade consumer credit.
      </div>
    </div>
  </footer>
);

export default SiteFooter;
