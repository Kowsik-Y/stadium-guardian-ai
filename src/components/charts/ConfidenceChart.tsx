import { Sparkles } from 'lucide-react';
import type React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ConfidenceItem } from '@/lib/types';

interface ConfidenceChartProps {
  data: ConfidenceItem[];
  tooltipStyle: Record<string, unknown>;
}

export const ConfidenceChart: React.FC<ConfidenceChartProps> = ({ data, tooltipStyle }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md h-[340px] flex flex-col">
      <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        Gemini GenAI Decision Confidence — Live History
      </h4>

      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
  );
};
