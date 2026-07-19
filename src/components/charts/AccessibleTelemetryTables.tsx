import type React from 'react';
import type {
  BinSnapshot,
  ConcessionItem,
  ConfidenceItem,
  GateSnapshot,
  PieItem,
} from '@/lib/types';

interface AccessibleTelemetryTablesProps {
  gateDensitySnapshot: GateSnapshot[];
  binFillChart: BinSnapshot[];
  pieData: PieItem[];
  confidenceData: ConfidenceItem[];
  concessionsData: ConcessionItem[];
}

export const AccessibleTelemetryTables: React.FC<AccessibleTelemetryTablesProps> = ({
  gateDensitySnapshot,
  binFillChart,
  pieData,
  confidenceData,
  concessionsData,
}) => {
  return (
    <section className="sr-only" aria-label="Operations data charts breakdown">
      <h3>Accessible Telemetry Summary Tables</h3>

      {/* Table 1: Gate Density */}
      <table id="sr-table-gates">
        <caption>Live Gate Entry Density and Wait Time</caption>
        <thead>
          <tr>
            <th scope="col">Gate</th>
            <th scope="col">Crowd Density</th>
            <th scope="col">Wait Time</th>
          </tr>
        </thead>
        <tbody>
          {gateDensitySnapshot.map((g) => (
            <tr key={`sr-gate-${g.gate}`}>
              <td>{g.gate}</td>
              <td>{g.density}%</td>
              <td>{g.waitTime} minutes</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 2: Bin Fill levels */}
      <table id="sr-table-bins">
        <caption>Smart Bin Fill Levels</caption>
        <thead>
          <tr>
            <th scope="col">Bin ID</th>
            <th scope="col">Fill level</th>
          </tr>
        </thead>
        <tbody>
          {binFillChart.map((b) => (
            <tr key={`sr-bin-${b.bin}`}>
              <td>{b.bin}</td>
              <td>{b.fill}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 3: Incident Commands */}
      <table id="sr-table-incidents">
        <caption>Incident Command Severity Breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Severity Level</th>
            <th scope="col">Alerts Count</th>
          </tr>
        </thead>
        <tbody>
          {pieData.map((item) => (
            <tr key={`sr-inc-${item.name}`}>
              <td>{item.name}</td>
              <td>{item.value} active alerts</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 4: AI Confidence */}
      <table id="sr-table-ai">
        <caption>Gemini Decision Confidence History</caption>
        <thead>
          <tr>
            <th scope="col">AI Run Number</th>
            <th scope="col">Alignment &amp; Confidence</th>
          </tr>
        </thead>
        <tbody>
          {confidenceData.map((c) => (
            <tr key={`sr-conf-${c.run}`}>
              <td>{c.run}</td>
              <td>{c.confidence}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table 5: Concessions */}
      <table id="sr-table-concessions">
        <caption>Snack Concessions Stock vs Queue Line Performance</caption>
        <thead>
          <tr>
            <th scope="col">Concession Stand</th>
            <th scope="col">Stock Level</th>
            <th scope="col">Queue Length</th>
            <th scope="col">Wait Time</th>
          </tr>
        </thead>
        <tbody>
          {concessionsData.map((c) => (
            <tr key={`sr-conc-${c.name}`}>
              <td>{c.name}</td>
              <td>{c.stock}%</td>
              <td>{c.queue} fans</td>
              <td>{c.wait} mins</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
