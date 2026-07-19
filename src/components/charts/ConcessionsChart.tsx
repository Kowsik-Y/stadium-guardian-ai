import { Activity } from 'lucide-react';
import type React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ConcessionItem } from '@/lib/types';

interface ConcessionsChartProps {
  data: ConcessionItem[];
  tooltipStyle: Record<string, unknown>;
}

export const ConcessionsChart: React.FC<ConcessionsChartProps> = ({ data, tooltipStyle }) => {
  return (
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
          <BarChart data={data}>
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
  );
};
