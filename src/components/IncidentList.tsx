'use client';

import { AlertTriangle, CheckCircle2, UserCheck } from 'lucide-react';
import React from 'react';
import type { Incident } from '@/lib/types';

interface IncidentListProps {
  activeIncidents: Incident[];
  resolveIncident: (id: string) => Promise<void> | void;
}

const IncidentList: React.FC<IncidentListProps> = ({ activeIncidents, resolveIncident }) => {
  return (
    <div
      id="incidents-panel"
      className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-slate-350 tracking-wider uppercase flex items-center gap-1.5">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          AI Incident Mitigation Feed
        </h4>
        <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded">
          {activeIncidents.length} Active Alerts
        </span>
      </div>

      {activeIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-slate-950/20 border border-slate-850/50 rounded-lg text-slate-500 text-sm gap-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <p className="font-semibold text-slate-450">
            All systems green. No active crowd bottlenecks or trash failures.
          </p>
          <p className="text-xs text-slate-500">
            Try triggering a scenario from the sandbox controller above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeIncidents.map((inc) => (
            <div
              key={inc.id}
              className={`p-4 rounded-xl border flex flex-col lg:flex-row justify-between gap-6 transition-all duration-300 ${
                inc.incident_type === 'CRITICAL_EMERGENCY'
                  ? 'bg-red-500/5 border-red-500/25'
                  : inc.incident_type === 'URGENT'
                    ? 'bg-amber-500/5 border-amber-500/25'
                    : 'bg-slate-950/40 border-slate-850'
              }`}
            >
              {/* Left side: Reasoning */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      inc.incident_type === 'CRITICAL_EMERGENCY'
                        ? 'bg-red-500/20 text-red-400'
                        : inc.incident_type === 'URGENT'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {inc.incident_type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(inc.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Confidence: {inc.confidence}%
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-sm text-slate-200">{inc.problem}</h5>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    <strong className="text-slate-300">Predictive Reasoning (XAI):</strong>{' '}
                    {inc.reasoning}
                  </p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-850 text-xs">
                  <p className="font-semibold text-emerald-400">Recommended Action Plan:</p>
                  <p className="text-slate-300 mt-1">{inc.recommended_action}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-500">
                    <span>
                      Zone: <strong className="text-slate-400">{inc.target_zone}</strong>
                    </span>
                    <span>
                      Dispatch ID:{' '}
                      <strong className="text-slate-400">{inc.dispatched_resource_id}</strong>
                    </span>
                    <span>
                      Routing:{' '}
                      <strong className="text-slate-400">{inc.algorithmic_routing_priority}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side: Broadcasts scripts & Action buttons */}
              <div className="w-full lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-850 pt-4 lg:pt-0 lg:pl-6">
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Volunteer Staff Script
                    </p>
                    <p className="text-xs italic bg-slate-950/30 p-2 rounded border border-slate-850/50 text-slate-350 mt-1 leading-snug">
                      &quot;{inc.message_for_volunteer}&quot;
                    </p>
                  </div>

                  {inc.broadcast_payload?.fan_announcement && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Fan Announcement
                      </p>
                      <p className="text-xs bg-slate-950/30 p-2 rounded border border-slate-850/50 text-emerald-400/90 mt-1 leading-snug">
                        &quot;{inc.broadcast_payload.fan_announcement}&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-850 flex gap-2">
                  <button
                    onClick={() => resolveIncident(inc.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none"
                  >
                    <UserCheck className="h-4 w-4" />
                    Resolve Alert
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(IncidentList);
