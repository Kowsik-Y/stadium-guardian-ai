import { Activity } from 'lucide-react';
import type React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { GateSnapshot } from '@/lib/types';

interface GateDensityChartProps {
  data: GateSnapshot[];
  tooltipStyle: Record<string, unknown>;
}

export const GateDensityChart: React.FC<GateDensityChartProps> = ({ data, tooltipStyle }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-[340px] flex flex-col">
      <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
        <Activity className="h-4 w-4 text-emerald-400" />
        Live Gate Density vs Wait Time (Real-time)
      </h4>

      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="gate" stroke="#64748b" />
            <YAxis stroke="#64748b" unit="%" />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Bar dataKey="density" name="Crowd Density %" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={`gate-cell-${entry.gate}`}
                  fill={entry.density > 80 ? '#ef4444' : entry.density > 60 ? '#f59e0b' : '#10b981'}
                />
              ))}
            </Bar>
            <Bar dataKey="waitTime" name="Wait Time (mins)" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
