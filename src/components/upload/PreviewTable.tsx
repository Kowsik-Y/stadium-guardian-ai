import { ArrowRight } from 'lucide-react';
import type { CsvGateRow } from '@/lib/csvParser';

interface PreviewTableProps {
  data: CsvGateRow[];
  handleApplyData: () => void;
  aiAnalyzing: boolean;
}

export default function PreviewTable({ data, handleApplyData, aiAnalyzing }: PreviewTableProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* Parsed Preview Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2.5 px-4">Gate</th>
              <th className="py-2.5 px-4 text-center">Crowd Density</th>
              <th className="py-2.5 px-4 text-center">Arrival Rate</th>
              <th className="py-2.5 px-4 text-center">Wait Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/60 text-slate-300">
            {data.map((row) => (
              <tr key={`csv-row-${row.gate}`} className="hover:bg-slate-900/30">
                <td className="py-2.5 px-4 font-bold">{row.gate}</td>
                <td className="py-2.5 px-4 text-center">{row.density}%</td>
                <td className="py-2.5 px-4 text-center">{row.arrival_rate} fans/m</td>
                <td className="py-2.5 px-4 text-center">{row.wait_time} mins</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={handleApplyData}
        disabled={aiAnalyzing}
        className="w-full py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all"
      >
        {aiAnalyzing
          ? 'AI Reasoning Engine Processing...'
          : 'Apply Live Telemetry & Analyze with AI'}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
