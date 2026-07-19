import { AlertCircle, CloudSun, Flame, Menu, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import type { Incident } from '@/lib/types';

interface HeaderProps {
  user: { gate: string };
  stadiumState: { weather: string };
  isLiveMode: boolean;
  activeIncidents: Incident[];
  mobileMenuButtonRef: React.RefObject<HTMLButtonElement | null>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  stadiumState,
  isLiveMode,
  activeIncidents,
  mobileMenuButtonRef,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const router = useRouter();
  const criticalCount = activeIncidents.filter(
    (inc) => inc.incident_type === 'CRITICAL_EMERGENCY',
  ).length;

  return (
    <header className="flex h-16 items-center justify-between px-6 bg-slate-900 border-b border-slate-800 z-10">
      {/* Mobile Menu Button */}
      <button
        type="button"
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
        {/* Incidents Notification */}
        {activeIncidents.length > 0 && (
          <button
            type="button"
            onClick={() => router.push('/dashboard#incidents-panel')}
            aria-label={`${activeIncidents.length} active incident${activeIncidents.length > 1 ? 's' : ''}${
              criticalCount > 0 ? ` — ${criticalCount} critical` : ''
            }. Click to view on dashboard.`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              criticalCount > 0
                ? 'bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse focus-visible:ring-red-500'
                : 'bg-amber-500/20 border border-amber-500/30 text-amber-400 focus-visible:ring-amber-500'
            }`}
          >
            {criticalCount > 0 ? (
              <Flame className="h-4 w-4" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="font-semibold">
              {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}
            </span>
          </button>
        )}

        {/* Volunteer Location assignment */}
        <div className="hidden md:block text-right">
          <p className="text-[10px] text-slate-400 font-medium">ASSIGNED POST</p>
          <p className="text-xs font-semibold text-slate-200">{user.gate}</p>
        </div>
      </div>
    </header>
  );
};
