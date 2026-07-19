'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import Login from '@/components/Login';
import { useApp } from '@/context/AppContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Header } from './layout/Header';
import { MobileDrawer } from './layout/MobileDrawer';
import { Sidebar } from './layout/Sidebar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, incidents, isLiveMode, stadiumState } = useApp();
  const [hasMounted, setHasMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useServiceWorker();

  useFocusTrap(mobileMenuOpen && hasMounted, mobileDrawerRef, () => setMobileMenuOpen(false));

  useEffect(() => {
    if (!mobileMenuOpen && hasMounted) {
      mobileMenuButtonRef.current?.focus();
    }
  }, [mobileMenuOpen, hasMounted]);

  const activeIncidents = incidents.filter((inc) => inc.status === 'ACTIVE');

  if (!hasMounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium tracking-wide text-slate-400">
            Loading Stadium Guardian AI...
          </p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar user={user} logout={logout} inert={mobileMenuOpen} />

      {/* Main Content Area */}
      <div
        inert={mobileMenuOpen || undefined}
        className="flex flex-col flex-1 h-full overflow-hidden"
      >
        <Header
          user={user}
          stadiumState={stadiumState}
          isLiveMode={isLiveMode}
          activeIncidents={activeIncidents}
          mobileMenuButtonRef={mobileMenuButtonRef}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">{children}</main>
      </div>

      <MobileDrawer
        user={user}
        logout={logout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileDrawerRef={mobileDrawerRef}
      />
    </div>
  );
}
