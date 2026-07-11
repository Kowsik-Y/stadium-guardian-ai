'use client';

import { AlertTriangle, Clock, Trash2, Users } from 'lucide-react';
import { useCallback, useState } from 'react';
import ControlPanel from '@/components/ControlPanel';
import IncidentList from '@/components/IncidentList';
import MapWrapper from '@/components/MapWrapper';
import TelemetryGrids from '@/components/TelemetryGrids';
import { useApp } from '@/context/AppContext';
import type { StadiumState } from '@/lib/types';

export default function Dashboard() {
  const { stadiumState, setStadiumState, incidents, resolveIncident, runAiReasoningEngine } =
    useApp();

  const [activeTab, setActiveTab] = useState<'stadium' | 'google-maps'>('stadium');
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [wayfindingPreset, setWayfindingPreset] = useState<
    'none' | 'crowd-spill' | 'concourse-b-bypass'
  >('none');

  const activeIncidents = incidents.filter((inc) => inc.status === 'ACTIVE');

  // Redirection guides calculation
  const redirectRoutes = activeIncidents
    .map((inc) => {
      const text =
        `${inc.recommended_action} ${inc.problem} ${inc.message_for_volunteer}`.toLowerCase();
      let from = '';
      let to = '';

      if (text.includes('gate c')) from = 'Gate C';
      else if (text.includes('gate a')) from = 'Gate A';
      else if (text.includes('gate b')) from = 'Gate B';
      else if (text.includes('gate d')) from = 'Gate D';

      if (text.includes('gate d') && from !== 'Gate D') to = 'Gate D';
      else if (text.includes('gate b') && from !== 'Gate B') to = 'Gate B';
      else if (text.includes('gate a') && from !== 'Gate A') to = 'Gate A';
      else if (text.includes('gate c') && from !== 'Gate C') to = 'Gate C';

      if (text.includes('moroccan') || text.includes('عباد')) {
        from = 'Gate C';
        to = 'Gate D';
      }

      if (from && to && from !== to) {
        return { id: inc.id, from, to };
      }
      return null;
    })
    .filter(Boolean) as Array<{ id: string; from: string; to: string }>;

  const medicalIncidents = activeIncidents.filter(
    (inc) =>
      inc.recommended_action.toLowerCase().includes('medical') ||
      inc.problem.toLowerCase().includes('breathe') ||
      inc.message_for_volunteer.toLowerCase().includes('medical'),
  );

  // Global statistics
  const gatesList = Object.values(stadiumState.gates);
  const binsList = Object.values(stadiumState.bins);

  const avgDensity = Math.round(
    gatesList.reduce((acc, g) => acc + g.density, 0) / (gatesList.length || 1),
  );
  const avgWaitTime = Math.round(
    gatesList.reduce((acc, g) => acc + g.wait_time, 0) / (gatesList.length || 1),
  );
  const maxBinFill = Math.max(...binsList.map((b) => b.fill_level), 0);

  // Risk Score Algorithm: combination of wait times, densities, medical cases, and full bins
  const calculatedRiskScore = Math.min(
    100,
    Math.round(
      avgDensity * 0.4 +
        avgWaitTime * 2.5 +
        stadiumState.nearby_medical_cases * 10 +
        activeIncidents.filter((i) => i.incident_type === 'CRITICAL_EMERGENCY').length * 20,
    ),
  );

  // Scenario Injectors
  const injectCrowdSpike = useCallback(() => {
    setStadiumState((prev) => {
      const nextGates = { ...prev.gates };
      if (nextGates['Gate C']) {
        nextGates['Gate C'] = {
          ...nextGates['Gate C'],
          density: 91,
          arrival_rate: 650,
          wait_time: 26,
        };
      }
      return { ...prev, gates: nextGates };
    });
    setTimeout(() => runAiReasoningEngine(), 1000);
  }, [setStadiumState, runAiReasoningEngine]);

  const injectBinOverflow = useCallback(() => {
    setStadiumState((prev) => {
      const nextBins = { ...prev.bins };
      if (nextBins['B-104']) {
        nextBins['B-104'] = {
          ...nextBins['B-104'],
          fill_level: 95,
          adjacent_density: 85,
          assigned_crew: null,
        };
      }
      return { ...prev, bins: nextBins };
    });
    setTimeout(() => runAiReasoningEngine(), 1000);
  }, [setStadiumState, runAiReasoningEngine]);

  const injectMedicalCrisis = useCallback(() => {
    setStadiumState((prev) => ({
      ...prev,
      nearby_medical_cases: prev.nearby_medical_cases + 3,
    }));
    setTimeout(() => runAiReasoningEngine(), 1000);
  }, [setStadiumState, runAiReasoningEngine]);

  const resetSimulationState = useCallback(async () => {
    try {
      const res = await fetch('/data/reset-state.json');
      if (!res.ok) throw new Error(`Failed to load reset state: ${res.status}`);
      const baseState = (await res.json()) as Omit<StadiumState, 'bins'> & {
        bins: Record<string, Omit<StadiumState['bins'][string], 'last_emptied'>>;
      };

      const binsWithTimestamp: StadiumState['bins'] = {};
      for (const [key, bin] of Object.entries(baseState.bins)) {
        binsWithTimestamp[key] = { ...bin, last_emptied: new Date().toISOString() };
      }

      setStadiumState(() => ({
        ...baseState,
        bins: binsWithTimestamp,
      }));
    } catch (err: unknown) {
      console.error('resetSimulationState fetch failed:', err);
    }
  }, [setStadiumState]);

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
          injectCrowdSpike={injectCrowdSpike}
          injectBinOverflow={injectBinOverflow}
          injectMedicalCrisis={injectMedicalCrisis}
          resetSimulationState={resetSimulationState}
        />
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Risk Score */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-md relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Overall Risk Score
              </p>
              <h3 className="text-3xl font-bold mt-2 text-slate-100">{calculatedRiskScore}%</h3>
            </div>
            <div
              className={`p-2 rounded-lg ${
                calculatedRiskScore > 75
                  ? 'bg-red-500/10 text-red-400'
                  : calculatedRiskScore > 40
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
                calculatedRiskScore > 75
                  ? 'bg-red-500'
                  : calculatedRiskScore > 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${calculatedRiskScore}%` }}
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
              <h3 className="text-3xl font-bold mt-2 text-slate-100">{avgDensity}%</h3>
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
              <h3 className="text-3xl font-bold mt-2 text-slate-100">{avgWaitTime} mins</h3>
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
              <h3 className="text-3xl font-bold mt-2 text-slate-100">{maxBinFill}%</h3>
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
        <MapWrapper
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSelectedGate={setSelectedGate}
          wayfindingPreset={wayfindingPreset}
          setWayfindingPreset={setWayfindingPreset}
          stadiumState={stadiumState}
          medicalIncidents={medicalIncidents}
          redirectRoutes={redirectRoutes}
        />

        {/* Sidebar Gate Details Overlay */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col h-100">
          <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-emerald-400" />
            Gate Entry Status
          </h4>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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

      {/* Live Telemetry Detail Tables Grid */}
      <TelemetryGrids
        gatesList={gatesList}
        binsList={binsList}
        selectedGate={selectedGate}
        setSelectedGate={setSelectedGate}
        stadiumState={stadiumState}
      />

      {/* Incidents Command Feed Room */}
      <IncidentList activeIncidents={activeIncidents} resolveIncident={resolveIncident} />
    </div>
  );
}
