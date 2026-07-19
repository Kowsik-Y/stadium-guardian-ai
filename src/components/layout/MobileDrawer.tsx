import { Activity, BarChart3, Bot, LayoutDashboard, LogOut, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

const menuItems = [
  { name: 'Live Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Copilot', href: '/copilot', icon: Bot },
  { name: 'Data Upload Test Bed', href: '/upload', icon: UploadCloud },
  { name: 'Operations Analytics', href: '/analytics', icon: BarChart3 },
];

interface MobileDrawerProps {
  user: { name: string; role: string };
  logout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  mobileDrawerRef: React.RefObject<HTMLDivElement | null>;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  user,
  logout,
  mobileMenuOpen,
  setMobileMenuOpen,
  mobileDrawerRef,
}) => {
  const pathname = usePathname();

  if (!mobileMenuOpen) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Backdrop click dismisses modal; keyboard users dismiss via Escape key or Close button inside the modal.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop click dismisses modal; keyboard users dismiss via Escape key or Close button inside the modal.
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
          type="button"
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
            type="button"
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
  );
};
