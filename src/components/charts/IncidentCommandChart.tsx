import { Award } from 'lucide-react';
import type React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PieItem } from '@/lib/types';

interface IncidentCommandChartProps {
  data: PieItem[];
  totalIncidents: number;
}

export const IncidentCommandChart: React.FC<IncidentCommandChartProps> = ({
  data,
  totalIncidents,
}) => {
  return (
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
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={`pie-cell-${entry.color}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 mt-4 sm:mt-0 font-medium">
          {data.map((item) => (
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
  );
};
