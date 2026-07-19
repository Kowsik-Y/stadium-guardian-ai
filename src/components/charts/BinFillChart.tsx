import { Compass } from 'lucide-react';
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
import type { BinSnapshot } from '@/lib/types';

interface BinFillChartProps {
  data: BinSnapshot[];
  tooltipStyle: Record<string, unknown>;
}

export const BinFillChart: React.FC<BinFillChartProps> = ({ data, tooltipStyle }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-[340px] flex flex-col">
      <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
        <Compass className="h-4 w-4 text-emerald-400" />
        Smart Bin Fill Levels — Live Telemetry
      </h4>

      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="bin" stroke="#64748b" />
            <YAxis stroke="#64748b" unit="%" domain={[0, 100]} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Bar dataKey="fill" name="Fill Level %" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
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
  );
};
