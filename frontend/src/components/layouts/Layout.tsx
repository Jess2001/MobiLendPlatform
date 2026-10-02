import React from 'react';
import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import MobileNav from './MobileNav';
import SiteFooter from './SiteFooter';

/**
 * Shared shell for every page: fixed header, page content via <Outlet />,
 * mobile bottom nav, and footer. Active nav state is now derived from the
 * current route (via NavLink) instead of a manually-passed activePath prop.
 */
const Layout: React.FC = () => {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased">
      <SiteHeader />

      <main className="w-full pt-16 min-h-[calc(100vh-4rem)] max-w-screen-2xl mx-auto px-margin-mobile lg:px-margin pb-20 md:pb-12 bg-surface">
        <Outlet />
      </main>

      <MobileNav />
      <SiteFooter />
    </div>
  );
};

export default Layout;
