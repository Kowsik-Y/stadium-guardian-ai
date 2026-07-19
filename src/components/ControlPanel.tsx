'use client';

import { RefreshCw } from 'lucide-react';
import React from 'react';

interface ControlPanelProps {
  injectCrowdSpike: () => void;
  injectBinOverflow: () => void;
  injectMedicalCrisis: () => void;
  resetSimulationState: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  injectCrowdSpike,
  injectBinOverflow,
  injectMedicalCrisis,
  resetSimulationState,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="text-[10px] font-semibold font-mono tracking-wider uppercase text-slate-400">
          Sandbox Test Bed:
        </span>
      </div>
      <button
        type="button"
        onClick={injectCrowdSpike}
        aria-label="Simulate a crowd spike at Gate C"
        className="px-2.5 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
      >
        Spike Gate C
      </button>
      <button
        type="button"
        onClick={injectBinOverflow}
        aria-label="Simulate trash bin overflow at B-104"
        className="px-2.5 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
      >
        Fill Bin B-104
      </button>
      <button
        type="button"
        onClick={injectMedicalCrisis}
        aria-label="Simulate incoming medical cases"
        className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
      >
        Inject Medical Cases
      </button>
      <button
        type="button"
        onClick={resetSimulationState}
        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
        title="Reset Scenario"
        aria-label="Reset simulation telemetry"
      >
        <RefreshCw className="h-4.5 w-4.5" />
      </button>
    </div>
  );
};

export default React.memo(ControlPanel);
