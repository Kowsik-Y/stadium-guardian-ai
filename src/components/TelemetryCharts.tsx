'use client';

import type {
  BinSnapshot,
  ConcessionItem,
  ConfidenceItem,
  GateSnapshot,
  PieItem,
} from '@/lib/types';
import { AccessibleTelemetryTables } from './charts/AccessibleTelemetryTables';
import { BinFillChart } from './charts/BinFillChart';
import { ConcessionsChart } from './charts/ConcessionsChart';
import { ConfidenceChart } from './charts/ConfidenceChart';
import { GateDensityChart } from './charts/GateDensityChart';
import { IncidentCommandChart } from './charts/IncidentCommandChart';

interface TelemetryChartsProps {
  gateDensitySnapshot: GateSnapshot[];
  binFillChart: BinSnapshot[];
  pieData: PieItem[];
  totalIncidents: number;
  confidenceData: ConfidenceItem[];
  concessionsData: ConcessionItem[];
  tooltipStyle: Record<string, unknown>;
}

export default function TelemetryCharts({
  gateDensitySnapshot,
  binFillChart,
  pieData,
  totalIncidents,
  confidenceData,
  concessionsData,
  tooltipStyle,
}: TelemetryChartsProps) {
  return (
    <div className="space-y-6">
      <AccessibleTelemetryTables
        gateDensitySnapshot={gateDensitySnapshot}
        binFillChart={binFillChart}
        pieData={pieData}
        confidenceData={confidenceData}
        concessionsData={concessionsData}
      />

      {/* Grid of Recharts */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        aria-describedby="sr-table-gates sr-table-bins sr-table-incidents sr-table-ai"
      >
        <GateDensityChart data={gateDensitySnapshot} tooltipStyle={tooltipStyle} />
        <BinFillChart data={binFillChart} tooltipStyle={tooltipStyle} />
        <IncidentCommandChart data={pieData} totalIncidents={totalIncidents} />
        <ConfidenceChart data={confidenceData} tooltipStyle={tooltipStyle} />
      </div>

      <ConcessionsChart data={concessionsData} tooltipStyle={tooltipStyle} />
    </div>
  );
}
