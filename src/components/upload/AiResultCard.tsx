import { Sparkles } from 'lucide-react';
import type { Incident } from '@/lib/types';

interface AiResultCardProps {
  incidents: Incident[];
}

export default function AiResultCard({ incidents }: AiResultCardProps) {
  if (incidents.length === 0 || !incidents[0].problem.includes('Volunteer Alert')) {
    return null;
  }

  const activeIncident = incidents[0];

  return (
    <div className="p-5 bg-linear-to-br from-emerald-950/20 to-slate-900 border border-emerald-500/25 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-400" />
        <span className="font-bold text-sm text-slate-200">
          Latest AI Telemetry Resolution Plan
        </span>
      </div>
      <div className="space-y-1.5 text-xs">
        <p className="text-slate-350">
          <strong className="text-slate-200">State:</strong> {activeIncident.problem}
        </p>
        <p className="text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Reasoning:</strong> {activeIncident.reasoning}
        </p>
        <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850 mt-2 font-mono text-[10px] text-emerald-400/90">
          <span className="font-bold uppercase tracking-wider block text-slate-500 mb-1">
            DISPATCH MATRIX
          </span>
          Recommended Action: {activeIncident.recommended_action}
          <br />
          Target Zone: {activeIncident.target_zone}
          <br />
          Assigned Team: {activeIncident.dispatched_resource_id}
        </div>
      </div>
    </div>
  );
}
