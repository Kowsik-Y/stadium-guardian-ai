import { useCallback, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import type { StadiumState } from '@/lib/types';

export function useDashboardViewModel() {
  const { stadiumState, setStadiumState, incidents, resolveIncident, runAiReasoningEngine } =
    useApp();

  const [activeTab, setActiveTab] = useState<'stadium' | 'google-maps'>('stadium');
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [wayfindingPreset, setWayfindingPreset] = useState<
    'none' | 'crowd-spill' | 'concourse-b-bypass'
  >('none');

  const stats = useDashboardStats(stadiumState, incidents);

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

  return {
    state: {
      stadiumState,
      activeIncidents: stats.activeIncidents,
      medicalIncidents: stats.medicalIncidents,
      redirectRoutes: stats.redirectRoutes,
      gatesList: Object.values(stadiumState.gates),
      binsList: Object.values(stadiumState.bins),
      stats,
    },
    ui: {
      activeTab,
      selectedGate,
      wayfindingPreset,
    },
    actions: {
      setActiveTab,
      setSelectedGate,
      setWayfindingPreset,
      resolveIncident,
      injectCrowdSpike,
      injectBinOverflow,
      injectMedicalCrisis,
      resetSimulationState,
    },
  };
}
