'use client';

import { Map as MapIcon } from 'lucide-react';
import type { WayfindingPreset } from '@/lib/mapVisuals';

interface MapControlsProps {
  activeTab: 'stadium' | 'google-maps';
  setActiveTab: (tab: 'stadium' | 'google-maps') => void;
  wayfindingPreset: WayfindingPreset;
  setWayfindingPreset: (preset: WayfindingPreset) => void;
}

const FOCUS_RING_CLASSES =
  'outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none';

/** Header bar above the stadium map: view tab switch + wayfinding preset shortcuts. */
export function MapControls({
  activeTab,
  setActiveTab,
  wayfindingPreset,
  setWayfindingPreset,
}: MapControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80 gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-350 tracking-wider uppercase">
            Stadium Map HUD
          </span>
        </div>

        {activeTab === 'stadium' && (
          <div className="hidden md:flex rounded-lg bg-slate-950 p-0.5 border border-slate-850 text-[10px] items-center gap-1 font-semibold">
            <span className="px-2 text-slate-500 uppercase text-[8px] font-mono">Route HUD:</span>
            <button
              type="button"
              onClick={() => setWayfindingPreset('none')}
              className={`px-2 py-0.5 rounded transition-all ${FOCUS_RING_CLASSES} ${
                wayfindingPreset === 'none'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              None
            </button>
            <button
              type="button"
              onClick={() => setWayfindingPreset('crowd-spill')}
              className={`px-2 py-0.5 rounded transition-all ${FOCUS_RING_CLASSES} ${
                wayfindingPreset === 'crowd-spill'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A➔C➔D Redirection
            </button>
            <button
              type="button"
              onClick={() => setWayfindingPreset('concourse-b-bypass')}
              className={`px-2 py-0.5 rounded transition-all ${FOCUS_RING_CLASSES} ${
                wayfindingPreset === 'concourse-b-bypass'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              B➔D Bypass
            </button>
          </div>
        )}
      </div>

      <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-850">
        <button
          type="button"
          onClick={() => setActiveTab('stadium')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${FOCUS_RING_CLASSES} ${
            activeTab === 'stadium'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tactical Map
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('google-maps')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${FOCUS_RING_CLASSES} ${
            activeTab === 'google-maps'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Google Maps Navigation
        </button>
      </div>
    </div>
  );
}
