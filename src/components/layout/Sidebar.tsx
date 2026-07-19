import { Activity, BarChart3, Bot, LayoutDashboard, LogOut, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

const menuItems = [
  { name: 'Live Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Copilot', href: '/copilot', icon: Bot },
  { name: 'Data Upload Test Bed', href: '/upload', icon: UploadCloud },
  { name: 'Operations Analytics', href: '/analytics', icon: BarChart3 },
];

interface SidebarProps {
  user: { name: string; role: string };
  logout: () => void;
  inert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, logout, inert }) => {
  const pathname = usePathname();

  return (
    <aside
      inert={inert || undefined}
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
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-800 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
