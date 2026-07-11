'use client';

import { Clock, Trash2, Utensils } from 'lucide-react';
import React from 'react';
import type { GateTelemetry, SmartBinTelemetry, StadiumState } from '@/lib/types';

interface TelemetryGridsProps {
  gatesList: GateTelemetry[];
  binsList: SmartBinTelemetry[];
  selectedGate: string | null;
  setSelectedGate: (gate: string | null) => void;
  stadiumState: StadiumState;
}

const TelemetryGrids: React.FC<TelemetryGridsProps> = ({
  gatesList,
  binsList,
  selectedGate,
  setSelectedGate,
  stadiumState,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Placeholder spacer for Map layout (will overlay cleanly) or handle inside parent layout */}
        {/* Gate Entry list Card */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col">
          <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-emerald-400" />
            Gate Entry Status
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {gatesList.map((g) => {
              const risk = g.density > 80 ? 'CRITICAL' : g.density > 55 ? 'WARNING' : 'SAFE';
              return (
                <div
                  key={g.gate}
                  onClick={() => setSelectedGate(g.gate)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
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
                </div>
              );
            })}
          </div>

          {selectedGate && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Selected: <strong className="text-slate-200">{selectedGate}</strong>
              </span>
              <button
                onClick={() => setSelectedGate(null)}
                className="text-[10px] text-slate-500 hover:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Snack Concessions Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          <Utensils className="h-4 w-4 text-amber-500" />
          Concessions: Snack Stands Telemetry (Live Concourse Stocks)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.values(stadiumState.concessions || {}).map((c) => {
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

      {/* Smart Trash Bins Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          <Trash2 className="h-4 w-4 text-emerald-400" />
          Sustainability: Smart Refuse Grid Telemetry
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  {isFull && (
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
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
    </div>
  );
};

export default React.memo(TelemetryGrids);
