import { Trash2 } from 'lucide-react';
import type React from 'react';
import type { SmartBinTelemetry } from '@/lib/types';

interface SmartBinsGridProps {
  binsList: SmartBinTelemetry[];
}

export const SmartBinsGrid: React.FC<SmartBinsGridProps> = ({ binsList }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
      <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
        <Trash2 className="h-4 w-4 text-emerald-400" />
        Sustainability: Smart Refuse Grid Telemetry
      </h4>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {binsList.map((b) => {
          const isFull = b.fill_level > 80;
          return (
            <div
              key={b.bin_id}
              className={`p-3 rounded-lg border transition-all ${
                isFull
                  ? 'bg-red-500/5 border-red-500/20'
                  : b.assigned_crew
                    ? 'bg-blue-500/5 border-blue-500/20'
                    : 'bg-slate-950/40 border-slate-850'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-200">{b.bin_id}</span>
                  <p className="text-[8px] text-slate-500 truncate max-w-[80px]">{b.zone}</p>
                </div>
                {isFull && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full my-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isFull ? 'bg-red-500' : b.fill_level > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${b.fill_level}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[9px] text-slate-400">
                <span>Fill: {b.fill_level}%</span>
                <span className="font-mono text-slate-500">Flow: {b.adjacent_density}%</span>
              </div>

              {b.assigned_crew && (
                <div className="mt-2 text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-center truncate">
                  Dispatch: {b.assigned_crew}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
