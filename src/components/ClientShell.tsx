'use client';

import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  CloudSun,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import Login from '@/components/Login';
import { useApp } from '@/context/AppContext';
import { getFocusableElements, trapFocusWithinContainer } from '@/lib/focusTrap';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, incidents, isLiveMode, stadiumState } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Register the Service Worker for offline-first PWA capability (stadium low-connectivity environments)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isSecure = window.location.protocol === 'https:';
      if (isSecure || isLocalhost) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
              console.log('[SW] Registered, scope:', reg.scope);
            })
            .catch((err) => {
              console.warn('[SW] Registration failed:', err);
            });
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    if (!mobileMenuOpen) {
      mobileMenuButtonRef.current?.focus();
      return;
    }

    const drawer = mobileDrawerRef.current;
    if (!drawer) {
      return;
    }

    const focusableElements = getFocusableElements(drawer);
    const initialFocusTarget = focusableElements[0] ?? drawer;

    const animationFrameId = window.requestAnimationFrame(() => {
      initialFocusTarget.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      trapFocusWithinContainer(drawer, event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMounted, mobileMenuOpen]);

  const activeIncidents = incidents.filter((inc) => inc.status === 'ACTIVE');
  const criticalCount = activeIncidents.filter(
    (inc) => inc.incident_type === 'CRITICAL_EMERGENCY',
  ).length;

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

  const menuItems = [
    { name: 'Live Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Copilot', href: '/copilot', icon: Bot },
    { name: 'Data Upload Test Bed', href: '/upload', icon: UploadCloud },
    { name: 'Operations Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside
        inert={mobileMenuOpen || undefined}
        className="hidden md:flex md:w-64 md:flex-col bg-slate-900 border-r border-slate-800"
      >
        {/* Brand */}
        <div className="flex h-16 items-center px-6 border-b border-slate-800 gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-slate-200 tracking-wide text-sm block">
              Stadium Guardian
            </span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase block">
              AI Orchestrator
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none ${
                  isActive
                    ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold uppercase">
              {user.name.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-800 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        inert={mobileMenuOpen || undefined}
        className="flex flex-col flex-1 h-full overflow-hidden"
      >
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 bg-slate-900 border-b border-slate-800 z-10">
          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
            aria-label="Open sidebar menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-medium">
            {/* Weather status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-amber-400">
              <CloudSun className="h-4 w-4" />
              <span>{stadiumState.weather}</span>
            </div>

            {/* Mode status */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                isLiveMode
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                {isLiveMode ? 'GCP Live' : 'Sandbox Simulator'}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Incidents Notification Icon */}
            {activeIncidents.length > 0 && (
              <div
                onClick={() => router.push('/dashboard#incidents-panel')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                  criticalCount > 0
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse'
                    : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                }`}
              >
                {criticalCount > 0 ? (
                  <Flame className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="font-semibold">
                  {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Volunteer Location assignment */}
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-slate-400 font-medium">ASSIGNED POST</p>
              <p className="text-xs font-semibold text-slate-200">{user.gate}</p>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">{children}</main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMobileMenuOpen(false);
            }
          }}
        >
          <div
            ref={mobileDrawerRef}
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            tabIndex={-1}
            className="relative flex w-full max-w-xs flex-col bg-slate-900 border-r border-slate-800 p-6 animate-in slide-in-from-left duration-200"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <Activity className="h-6 w-6 text-emerald-400" />
              <span className="font-bold text-lg text-slate-200">Stadium Guardian AI</span>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none ${
                      isActive
                        ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-800 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold uppercase">
                  {user.name.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
