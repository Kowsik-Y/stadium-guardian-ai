import { Utensils } from 'lucide-react';
import type React from 'react';
import type { StadiumState } from '@/lib/types';

interface ConcessionsGridProps {
  concessions: StadiumState['concessions'];
}

export const ConcessionsGrid: React.FC<ConcessionsGridProps> = ({ concessions }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
      <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
        <Utensils className="h-4 w-4 text-amber-500" />
        Concessions: Snack Stands Telemetry (Live Concourse Stocks)
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-live="polite" aria-atomic="false">
        {Object.values(concessions || {}).map((c) => {
          const isCritical = c.stock_level < 30 || c.wait_time > 20;
          return (
            <div
              key={c.concession_id}
              className={`p-3 rounded-lg border transition-all ${
                isCritical
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-slate-950/40 border-slate-850'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-200">{c.name}</span>
                  <p className="text-[8px] text-slate-500 truncate max-w-[120px]">
                    {c.zone} • {c.concession_id}
                  </p>
                </div>
                <span
                  className={`h-2.5 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                    c.status === 'BUSY'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : c.status === 'CLOSED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="space-y-1 mt-2 text-[10px] text-slate-350">
                <div className="flex justify-between">
                  <span>Queue Line:</span>
                  <span className="font-bold text-slate-200">{c.queue_length} fans</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Wait Time:</span>
                  <span
                    className={`font-bold ${c.wait_time > 20 ? 'text-amber-400' : 'text-emerald-400'}`}
                  >
                    {c.wait_time} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Snacks Stock:</span>
                  <span
                    className={`font-bold ${c.stock_level < 30 ? 'text-red-400' : 'text-slate-200'}`}
                  >
                    {c.stock_level}%
                  </span>
                </div>
              </div>

              {/* Progress bar for stock */}
              <div className="w-full bg-slate-800 h-1 rounded-full my-2">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    c.stock_level < 30
                      ? 'bg-red-500'
                      : c.stock_level < 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${c.stock_level}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
