import { Clock } from 'lucide-react';
import type React from 'react';
import type { GateTelemetry } from '@/lib/types';

interface GateEntryGridProps {
  gatesList: GateTelemetry[];
  selectedGate: string | null;
  setSelectedGate: (gate: string | null) => void;
}

export const GateEntryGrid: React.FC<GateEntryGridProps> = ({
  gatesList,
  selectedGate,
  setSelectedGate,
}) => {
  return (
    <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col">
      <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-3 flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-emerald-400" />
        Gate Entry Status
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {gatesList.map((g) => {
          const risk = g.density > 80 ? 'CRITICAL' : g.density > 55 ? 'WARNING' : 'SAFE';
          return (
            <button
              key={g.gate}
              type="button"
              aria-pressed={selectedGate === g.gate}
              aria-label={`Select ${g.gate} — ${risk} risk, density ${g.density}%`}
              onClick={() => setSelectedGate(g.gate)}
              className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedGate === g.gate
                  ? 'bg-slate-800 border-emerald-500'
                  : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-slate-200">{g.gate}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                    risk === 'CRITICAL'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : risk === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {risk}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Density</p>
                  <p className="font-semibold text-slate-300 mt-0.5">{g.density}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Arrival Rate</p>
                  <p className="font-semibold text-slate-300 mt-0.5">{g.arrival_rate}/m</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Wait Time</p>
                  <p className="font-semibold text-slate-300 mt-0.5">{g.wait_time}m</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedGate && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Selected: <strong className="text-slate-200">{selectedGate}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedGate(null)}
            className="text-[10px] text-slate-500 hover:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};
