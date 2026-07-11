'use client';

import {
  BIN_LAYOUT,
  CONCESSION_LAYOUT,
  GATE_LAYOUT,
  getMedicalBadgePosition,
  getRedirectPathConfig,
  type WayfindingPreset,
} from '@/lib/mapVisuals';
import type { Incident, StadiumState } from '@/lib/types';
import { BinMarker } from './BinMarker';
import { ConcessionMarker } from './ConcessionMarker';
import { GateMarker } from './GateMarker';

interface StadiumTacticalMapProps {
  stadiumState: StadiumState;
  setSelectedGate: (gate: string | null) => void;
  wayfindingPreset: WayfindingPreset;
  medicalIncidents: Incident[];
  redirectRoutes: Array<{ id: string; from: string; to: string }>;
}

/** The SVG stadium HUD: gates, smart bins, concessions, redirect routes, and live incident badges. */
export function StadiumTacticalMap({
  stadiumState,
  setSelectedGate,
  wayfindingPreset,
  medicalIncidents,
  redirectRoutes,
}: StadiumTacticalMapProps) {
  return (
    <div className="relative w-full h-full max-w-[500px] max-h-[340px] flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-4/5 h-4/5 text-slate-800"
        role="img"
        aria-label="Stadium map HUD showing live gate density, smart bin fill levels, and crowd flow overlays"
      >
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="15"
          fill="none"
          stroke="#1e293b"
          strokeWidth="2"
          strokeDasharray="3 3"
        />

        <ellipse cx="50" cy="50" rx="35" ry="25" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <ellipse
          cx="50"
          cy="50"
          rx="22"
          ry="14"
          fill="#020617"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        <rect
          x="40"
          y="44"
          width="20"
          height="12"
          fill="none"
          stroke="#10b981"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="3"
          ry="3"
          fill="none"
          stroke="#10b981"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />

        {/* Gate nodes */}
        {GATE_LAYOUT.map((gate) => {
          const telemetry = stadiumState.gates[gate.id];
          const density = telemetry?.density ?? 0;
          const waitTime = telemetry?.wait_time ?? 0;

          return (
            <GateMarker
              key={gate.id}
              id={gate.id}
              cx={gate.cx}
              cy={gate.cy}
              labelX={gate.labelX}
              labelY={gate.labelY}
              density={density}
              waitTime={waitTime}
              onSelect={setSelectedGate}
            />
          );
        })}

        {/* Smart Bins */}
        {BIN_LAYOUT.map((bin) => {
          const fillLevel = stadiumState.bins[bin.id]?.fill_level;
          return <BinMarker key={bin.id} id={bin.id} x={bin.x} y={bin.y} fillLevel={fillLevel} />;
        })}

        {/* Concessions */}
        <g>
          {CONCESSION_LAYOUT.map((concession) => {
            const telemetry = stadiumState.concessions[concession.id];
            return (
              <ConcessionMarker
                key={concession.id}
                id={concession.id}
                cx={concession.cx}
                cy={concession.cy}
                fill={concession.fill}
                stock={telemetry?.stock_level}
                queue={telemetry?.queue_length}
              />
            );
          })}
        </g>

        {/* Redirect Routes */}
        {redirectRoutes.map((route) => {
          const { x1, y1, x2, y2, label } = getRedirectPathConfig(route.from, route.to);
          return (
            <g key={route.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="2 2"
                className="animate-pulse"
              />
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 2}
                fill="#fbbf24"
                fontSize="2"
                fontWeight="bold"
                textAnchor="middle"
                className="animate-pulse"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Medical Incident Locator Badges */}
        {medicalIncidents.map((inc) => {
          const { x, y, label } = getMedicalBadgePosition(
            `${inc.recommended_action} ${inc.problem}`,
          );
          return (
            <g key={inc.id}>
              <circle cx={x} cy={y} r="4" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle cx={x} cy={y} r="2.8" fill="#ef4444" opacity="0.95" />
              <line x1={x} y1={y - 1.5} x2={x} y2={y + 1.5} stroke="white" strokeWidth="0.6" />
              <line x1={x - 1.5} y1={y} x2={x + 1.5} y2={y} stroke="white" strokeWidth="0.6" />
              <text
                x={x}
                y={y - 3.8}
                fill="#f87171"
                fontSize="2"
                fontWeight="bold"
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Wayfinding presets */}
        {wayfindingPreset === 'crowd-spill' && (
          <g>
            <path
              d="M 30 25 L 30 75 L 70 75"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
              className="animate-pulse"
            />
            <path
              d="M 30 25 L 30 75 L 70 75"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <polygon points="28,45 30,50 32,45" fill="#22d3ee" />
            <polygon points="48,73 53,75 48,77" fill="#22d3ee" />
            <text x="34" y="50" fill="#22d3ee" fontSize="2.2" fontWeight="bold">
              A ➔ C
            </text>
            <text x="50" y="71" fill="#22d3ee" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              C ➔ D Redirect
            </text>
          </g>
        )}

        {wayfindingPreset === 'concourse-b-bypass' && (
          <g>
            <path
              d="M 70 25 L 70 75"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
              className="animate-pulse"
            />
            <path
              d="M 70 25 L 70 75"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <polygon points="68,45 70,50 72,45" fill="#fbbf24" />
            <text x="74" y="50" fill="#fbbf24" fontSize="2.2" fontWeight="bold">
              B ➔ D Bypass
            </text>
          </g>
        )}
      </svg>

      {/* Live pulses for high density gates */}
      {Object.values(stadiumState.gates).map((g) => {
        if (g.density > 75 && g.coordinates) {
          return (
            <span
              key={g.gate}
              className="absolute h-6 w-6 rounded-full bg-red-500/30 animate-ping border border-red-500/50 pointer-events-none"
              style={{
                left: `${g.coordinates.x}%`,
                top: `${g.coordinates.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
