import { Users } from 'lucide-react';

interface QuickTestProfilesProps {
  handleQuickLogin: (email: string, name: string) => void;
  loading: boolean;
}

export default function QuickTestProfiles({ handleQuickLogin, loading }: QuickTestProfilesProps) {
  const PRESETS = [
    { name: 'Volunteer Alpha (Gate C)', email: 'volunteer.gatec@fifa.com', icon: '[VOL]' },
    { name: 'Operations Lead (Control Room)', email: 'operations.lead@fifa.com', icon: '[OPS]' },
    { name: 'Sustainability Crew (Gate A)', email: 'sustainability.crew@fifa.com', icon: '[SST]' },
  ];

  return (
    <div className="mt-8 pt-6 border-t border-slate-800/80">
      <div className="flex items-center gap-2 mb-4 justify-center sm:justify-start">
        <Users className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        <span className="text-xs font-semibold text-slate-300">
          Quick Test Profiles (Sandbox Fallback)
        </span>
      </div>

      <div className="space-y-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleQuickLogin(preset.email, preset.name)}
            disabled={loading}
            aria-disabled={loading}
            aria-label={`Log in as ${preset.name}`}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-850 hover:border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-medium transition-all duration-200"
          >
            <div className="flex items-center gap-3.5">
              <span
                className="text-[10px] font-mono font-semibold text-slate-500"
                aria-hidden="true"
              >
                {preset.icon}
              </span>
              <div className="text-left">
                <p className="font-semibold text-[11px]">{preset.name}</p>
                <p className="text-[9px] text-slate-500 font-mono leading-none">{preset.email}</p>
              </div>
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase font-mono font-bold"
              aria-hidden="true"
            >
              Select
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
