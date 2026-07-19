'use client';

import { AlertTriangle, Clock, Trash2, Users } from 'lucide-react';
import ControlPanel from '@/components/ControlPanel';
import IncidentList from '@/components/IncidentList';
import MapWrapper from '@/components/MapWrapper';
import { SafeModuleBoundary } from '@/components/SafeModuleBoundary';
import TelemetryGrids from '@/components/TelemetryGrids';
import { useDashboardViewModel } from '@/hooks/useDashboardViewModel';

export default function Dashboard() {
  const { state, ui, actions } = useDashboardViewModel();
  const {
    stadiumState,
    activeIncidents,
    medicalIncidents,
    redirectRoutes,
    gatesList,
    binsList,
    stats,
  } = state;
  const { activeTab, selectedGate, wayfindingPreset } = ui;

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            Live Operations Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time gate telemetry, smart trash grids, and predictive AI decision suite.
          </p>
        </div>

        {/* Dynamic simulation controls */}
        <ControlPanel
          injectCrowdSpike={actions.injectCrowdSpike}
          injectBinOverflow={actions.injectBinOverflow}
          injectMedicalCrisis={actions.injectMedicalCrisis}
          resetSimulationState={actions.resetSimulationState}
        />
      </div>

      {/* Dynamic Summary Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Card 1: Risk Score */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-md relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Risk Score
              </p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">
                {stats.calculatedRiskScore}%
              </h3>
            </div>
            <div
              className={`p-2 rounded-lg ${
                stats.calculatedRiskScore > 75
                  ? 'bg-red-500/10 text-red-400'
                  : stats.calculatedRiskScore > 40
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                stats.calculatedRiskScore > 75
                  ? 'bg-red-500'
                  : stats.calculatedRiskScore > 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${stats.calculatedRiskScore}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Active Gate Traffic */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Average Gate Density
              </p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">{stats.avgDensity}%</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">
            Across {gatesList.length} entry turnstiles
          </p>
        </div>

        {/* Card 3: Ingress Wait Time */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Average Wait Time
              </p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">{stats.avgWaitTime} mins</h3>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">Target benchmark: Under 12 minutes</p>
        </div>

        {/* Card 4: Highest Waste Bin */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Max Bin Fill Level
              </p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">{stats.maxBinFill}%</h3>
            </div>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4">
            {binsList.filter((b) => b.fill_level > 80).length} bins require dispatch attention
          </p>
        </div>
      </div>

      {/* Interactive Map & Tab Selection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SafeModuleBoundary
          fallback={
            <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-red-500/30 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
              <p className="text-red-400 font-semibold mb-2">
                Map Interface Temporarily Unavailable
              </p>
              <p className="text-xs text-slate-500">
                A runtime telemetry error occurred in this module. Other system services remain
                active.
              </p>
            </div>
          }
        >
          <MapWrapper
            activeTab={activeTab}
            setActiveTab={actions.setActiveTab}
            setSelectedGate={actions.setSelectedGate}
            wayfindingPreset={wayfindingPreset}
            setWayfindingPreset={actions.setWayfindingPreset}
            stadiumState={stadiumState}
            medicalIncidents={medicalIncidents}
            redirectRoutes={redirectRoutes}
          />
        </SafeModuleBoundary>

        {/* Sidebar Gate Details Overlay */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col h-100">
          <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-emerald-400" />
            Gate Entry Status
          </h4>

          <div
            className="flex-1 overflow-y-auto space-y-3 pr-1"
            aria-live="polite"
            aria-relevant="text"
          >
            {gatesList.map((g) => {
              const risk = g.density > 80 ? 'CRITICAL' : g.density > 55 ? 'WARNING' : 'SAFE';
              return (
                <button
                  key={g.gate}
                  type="button"
                  aria-pressed={selectedGate === g.gate}
                  aria-label={`Select ${g.gate} — ${risk} risk, density ${g.density}%, wait time ${g.wait_time} minutes`}
                  onClick={() => actions.setSelectedGate(g.gate)}
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
            <div
              className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs"
              aria-live="polite"
            >
              <span className="text-slate-400">
                Selected: <strong className="text-slate-200">{selectedGate}</strong>
              </span>
              <button
                type="button"
                onClick={() => actions.setSelectedGate(null)}
                aria-label="Clear selected gate"
                className="text-[10px] text-slate-500 hover:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Telemetry Detail Tables Grid */}
      <TelemetryGrids
        gatesList={gatesList}
        binsList={binsList}
        selectedGate={selectedGate}
        setSelectedGate={actions.setSelectedGate}
        stadiumState={stadiumState}
      />

      {/* Incidents Command Feed Room */}
      <IncidentList activeIncidents={activeIncidents} resolveIncident={actions.resolveIncident} />
    </div>
  );
}
