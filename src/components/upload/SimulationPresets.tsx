import { AlertTriangle, Download } from 'lucide-react';

interface SimulationPresetsProps {
  loadPresetMock: (data: string) => void;
}

export default function SimulationPresets({ loadPresetMock }: SimulationPresetsProps) {
  const PRESET_NORMAL = `gate,density,arrival_rate,wait_time
Gate A,40,100,5
Gate B,50,180,9
Gate C,45,150,6
Gate D,30,80,4`;

  const PRESET_CRITICAL = `gate,density,arrival_rate,wait_time
Gate A,40,110,5
Gate B,60,200,10
Gate C,88,620,24
Gate D,30,80,4`;

  return (
    <div className="mt-8 pt-6 border-t border-slate-850">
      <span className="text-xs font-semibold text-slate-400 block mb-3">
        Load Test Presets (Instant CSV Simulation):
      </span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => loadPresetMock(PRESET_NORMAL)}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 text-xs font-medium text-slate-350 rounded-lg hover:text-slate-100 transition-colors"
        >
          <Download className="h-4 w-4 text-slate-500" />
          Moderate Baseline Preset
        </button>
        <button
          type="button"
          onClick={() => loadPresetMock(PRESET_CRITICAL)}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-800 hover:border-red-500/30 bg-slate-950 text-xs font-medium text-red-400 rounded-lg hover:bg-red-500/5 transition-colors"
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Gate C Overcrowded Preset
        </button>
      </div>
    </div>
  );
}
