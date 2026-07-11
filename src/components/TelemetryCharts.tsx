'use client';

import { Activity, Award, Compass, Sparkles } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface GateSnapshot {
  gate: string;
  density: number;
  waitTime: number;
}

interface BinSnapshot {
  bin: string;
  fill: number;
}

interface PieItem {
  name: string;
  value: number;
  color: string;
}

interface ConfidenceItem {
  run: string;
  confidence: number;
}

interface ConcessionItem {
  name: string;
  stock: number;
  queue: number;
  wait: number;
}

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
      {/* Accessibility screen-reader fallback data tables */}
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

      {/* Grid of Recharts */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        aria-describedby="sr-table-gates sr-table-bins sr-table-incidents sr-table-ai"
      >
        {/* Chart 1: Live Gate Density Snapshot */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-[340px] flex flex-col">
          <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-400" />
            Live Gate Density vs Wait Time (Real-time)
          </h4>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gateDensitySnapshot}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="gate" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="%" />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="density" name="Crowd Density %" radius={[4, 4, 0, 0]}>
                  {gateDensitySnapshot.map((entry) => (
                    <Cell
                      key={`gate-cell-${entry.gate}`}
                      fill={
                        entry.density > 80 ? '#ef4444' : entry.density > 60 ? '#f59e0b' : '#10b981'
                      }
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="waitTime"
                  name="Wait Time (mins)"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Live Bin Fill Levels */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-[340px] flex flex-col">
          <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-emerald-400" />
            Smart Bin Fill Levels — Live Telemetry
          </h4>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={binFillChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bin" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="%" domain={[0, 100]} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="fill" name="Fill Level %" radius={[4, 4, 0, 0]}>
                  {binFillChart.map((entry) => (
                    <Cell
                      key={`bin-cell-${entry.bin}`}
                      fill={entry.fill > 80 ? '#ef4444' : entry.fill > 50 ? '#f59e0b' : '#0ea5e9'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Type Status Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-[340px] flex flex-col">
          <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-400" />
            Live Incident Command Breakdown
          </h4>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-around text-xs">
            <div className="w-[200px] h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={`pie-cell-${entry.color}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 sm:mt-0 font-medium">
              {pieData.map((item) => (
                <div key={`legend-${item.color}`} className="flex items-center gap-3.5">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-slate-300">
                    {item.name}: <strong className="text-slate-100">{item.value}</strong>
                  </span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                Total incidents tracked: {totalIncidents}
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: AI Decision Confidence from live incident history */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-[340px] flex flex-col">
          <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Gemini GenAI Decision Confidence — Live History
          </h4>

          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="run" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[75, 100]} unit="%" />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  name="JSON Alignment & Confidence Score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Concessions Overview */}
      <div
        className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md"
        aria-describedby="sr-table-concessions"
      >
        <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-amber-400" />
          Concessions Live Performance — Stock vs Queue Pressure
        </h4>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={concessionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" />
              <Tooltip {...tooltipStyle} />
              <Legend />
              <Bar dataKey="stock" name="Stock Level %" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="queue" name="Queue (fans)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wait" name="Wait (mins)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
