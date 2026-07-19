'use client';

import React from 'react';
import type { GateTelemetry, SmartBinTelemetry, StadiumState } from '@/lib/types';
import { ConcessionsGrid } from './grids/ConcessionsGrid';
import { GateEntryGrid } from './grids/GateEntryGrid';
import { SmartBinsGrid } from './grids/SmartBinsGrid';

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
        <GateEntryGrid
          gatesList={gatesList}
          selectedGate={selectedGate}
          setSelectedGate={setSelectedGate}
        />
      </div>

      {/* Live Snack Concessions Grid */}
      <ConcessionsGrid concessions={stadiumState.concessions} />

      {/* Smart Trash Bins Grid */}
      <SmartBinsGrid binsList={binsList} />
    </div>
  );
};

export default React.memo(TelemetryGrids);
