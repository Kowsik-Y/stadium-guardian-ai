'use client';

import React from 'react';
import { GoogleMapsPanel } from '@/components/map/GoogleMapsPanel';
import { MapControls } from '@/components/map/MapControls';
import { StadiumTacticalMap } from '@/components/map/StadiumTacticalMap';
import type { WayfindingPreset } from '@/lib/mapVisuals';
import type { Incident, StadiumState } from '@/lib/types';

interface MapWrapperProps {
  activeTab: 'stadium' | 'google-maps';
  setActiveTab: (tab: 'stadium' | 'google-maps') => void;
  setSelectedGate: (gate: string | null) => void;
  wayfindingPreset: WayfindingPreset;
  setWayfindingPreset: (preset: WayfindingPreset) => void;
  stadiumState: StadiumState;
  medicalIncidents: Incident[];
  redirectRoutes: Array<{ id: string; from: string; to: string }>;
}

/**
 * Orchestrates the stadium map card: header controls + either the tactical
 * SVG HUD or the Google Maps navigation panel, depending on the active tab.
 * The actual rendering logic lives in `components/map/*` — this component
 * only wires state down to them.
 */
const MapWrapper: React.FC<MapWrapperProps> = ({
  activeTab,
  setActiveTab,
  setSelectedGate,
  wayfindingPreset,
  setWayfindingPreset,
  stadiumState,
  medicalIncidents,
  redirectRoutes,
}) => {
  return (
    <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
      <MapControls
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wayfindingPreset={wayfindingPreset}
        setWayfindingPreset={setWayfindingPreset}
      />

      <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
        {activeTab === 'stadium' ? (
          <StadiumTacticalMap
            stadiumState={stadiumState}
            setSelectedGate={setSelectedGate}
            wayfindingPreset={wayfindingPreset}
            medicalIncidents={medicalIncidents}
            redirectRoutes={redirectRoutes}
          />
        ) : (
          <GoogleMapsPanel
            wayfindingPreset={wayfindingPreset}
            medicalIncidents={medicalIncidents}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(MapWrapper);
