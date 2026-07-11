'use client';

import { Map as MapIcon, Navigation } from 'lucide-react';
import React from 'react';
import type { Incident, StadiumState } from '@/lib/types';

interface MapWrapperProps {
  activeTab: 'stadium' | 'google-maps';
  setActiveTab: (tab: 'stadium' | 'google-maps') => void;
  setSelectedGate: (gate: string | null) => void;
  wayfindingPreset: 'none' | 'crowd-spill' | 'concourse-b-bypass';
  setWayfindingPreset: (preset: 'none' | 'crowd-spill' | 'concourse-b-bypass') => void;
  stadiumState: StadiumState;
  medicalIncidents: Incident[];
  redirectRoutes: Array<{ id: string; from: string; to: string }>;
}

const MapWrapper: React.FC<MapWrapperProps> = ({
  activeTab,
  setActiveTab,
  setSelectedGate,
  wayfindingPreset,
  setWayfindingPreset,
  stadiumState,
  medicalIncidents,
  redirectRoutes,
}) => {
  return (
    <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-350 tracking-wider uppercase">
              Stadium Map HUD
            </span>
          </div>

          {/* Wayfinding Route Preset Controls */}
          {activeTab === 'stadium' && (
            <div className="hidden md:flex rounded-lg bg-slate-950 p-0.5 border border-slate-850 text-[10px] items-center gap-1 font-semibold">
              <span className="px-2 text-slate-500 uppercase text-[8px] font-mono">Route HUD:</span>
              <button
                onClick={() => setWayfindingPreset('none')}
                className={`px-2 py-0.5 rounded transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none ${
                  wayfindingPreset === 'none'
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                None
              </button>
              <button
                onClick={() => setWayfindingPreset('crowd-spill')}
                className={`px-2 py-0.5 rounded transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none ${
                  wayfindingPreset === 'crowd-spill'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A➔C➔D Redirection
              </button>
              <button
                onClick={() => setWayfindingPreset('concourse-b-bypass')}
                className={`px-2 py-0.5 rounded transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none ${
                  wayfindingPreset === 'concourse-b-bypass'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                B➔D Bypass
              </button>
            </div>
          )}
        </div>

        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-850">
          <button
            onClick={() => setActiveTab('stadium')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none ${
              activeTab === 'stadium'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tactical Map
          </button>
          <button
            onClick={() => setActiveTab('google-maps')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus:outline-none ${
              activeTab === 'google-maps'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Google Maps Navigation
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
        {activeTab === 'stadium' ? (
          <div className="relative w-full h-full max-w-[500px] max-h-[340px] flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-slate-800">
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

              <ellipse
                cx="50"
                cy="50"
                rx="35"
                ry="25"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="2"
              />
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
              <circle
                cx="30"
                cy="25"
                r="5"
                fill={
                  stadiumState.gates['Gate A']?.density > 80
                    ? '#ef4444'
                    : stadiumState.gates['Gate A']?.density > 50
                      ? '#f59e0b'
                      : '#10b981'
                }
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedGate('Gate A')}
              />
              <circle
                cx="70"
                cy="25"
                r="5"
                fill={
                  stadiumState.gates['Gate B']?.density > 80
                    ? '#ef4444'
                    : stadiumState.gates['Gate B']?.density > 50
                      ? '#f59e0b'
                      : '#10b981'
                }
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedGate('Gate B')}
              />
              <circle
                cx="30"
                cy="75"
                r="5"
                fill={
                  stadiumState.gates['Gate C']?.density > 80
                    ? '#ef4444'
                    : stadiumState.gates['Gate C']?.density > 50
                      ? '#f59e0b'
                      : '#10b981'
                }
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedGate('Gate C')}
              />
              <circle
                cx="70"
                cy="75"
                r="5"
                fill={
                  stadiumState.gates['Gate D']?.density > 80
                    ? '#ef4444'
                    : stadiumState.gates['Gate D']?.density > 50
                      ? '#f59e0b'
                      : '#10b981'
                }
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedGate('Gate D')}
              />

              <text x="30" y="17" fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle">
                Gate A
              </text>
              <text x="70" y="17" fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle">
                Gate B
              </text>
              <text x="30" y="85" fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle">
                Gate C
              </text>
              <text x="70" y="85" fill="#94a3b8" fontSize="3" fontWeight="bold" textAnchor="middle">
                Gate D
              </text>

              {/* Smart Bins */}
              <rect
                x="21"
                y="28"
                width="3.2"
                height="4.2"
                rx="0.6"
                fill={
                  stadiumState.bins['B-101']?.fill_level > 85
                    ? '#ef4444'
                    : stadiumState.bins['B-101']?.fill_level > 55
                      ? '#f59e0b'
                      : '#10b981'
                }
                stroke="#0f172a"
                strokeWidth="0.5"
              />
              <text
                x="22.6"
                y="31.2"
                fill="#0f172a"
                fontSize="1.8"
                fontWeight="bold"
                textAnchor="middle"
              >
                B
              </text>

              <rect
                x="76"
                y="28"
                width="3.2"
                height="4.2"
                rx="0.6"
                fill={
                  stadiumState.bins['B-102']?.fill_level > 85
                    ? '#ef4444'
                    : stadiumState.bins['B-102']?.fill_level > 55
                      ? '#f59e0b'
                      : '#10b981'
                }
                stroke="#0f172a"
                strokeWidth="0.5"
              />
              <text
                x="77.6"
                y="31.2"
                fill="#0f172a"
                fontSize="1.8"
                fontWeight="bold"
                textAnchor="middle"
              >
                B
              </text>

              <rect
                x="15"
                y="73"
                width="3.2"
                height="4.2"
                rx="0.6"
                fill={
                  stadiumState.bins['B-103']?.fill_level > 85
                    ? '#ef4444'
                    : stadiumState.bins['B-103']?.fill_level > 55
                      ? '#f59e0b'
                      : '#10b981'
                }
                stroke="#0f172a"
                strokeWidth="0.5"
              />
              <text
                x="16.6"
                y="76.2"
                fill="#0f172a"
                fontSize="1.8"
                fontWeight="bold"
                textAnchor="middle"
              >
                B
              </text>

              <rect
                x="37"
                y="73"
                width="3.2"
                height="4.2"
                rx="0.6"
                fill={
                  stadiumState.bins['B-104']?.fill_level > 85
                    ? '#ef4444'
                    : stadiumState.bins['B-104']?.fill_level > 55
                      ? '#f59e0b'
                      : '#10b981'
                }
                stroke="#0f172a"
                strokeWidth="0.5"
              />
              <text
                x="38.6"
                y="76.2"
                fill="#0f172a"
                fontSize="1.8"
                fontWeight="bold"
                textAnchor="middle"
              >
                B
              </text>

              <rect
                x="76"
                y="67"
                width="3.2"
                height="4.2"
                rx="0.6"
                fill={
                  stadiumState.bins['B-201']?.fill_level > 85
                    ? '#ef4444'
                    : stadiumState.bins['B-201']?.fill_level > 55
                      ? '#f59e0b'
                      : '#10b981'
                }
                stroke="#0f172a"
                strokeWidth="0.5"
              />
              <text
                x="77.6"
                y="70.2"
                fill="#0f172a"
                fontSize="1.8"
                fontWeight="bold"
                textAnchor="middle"
              >
                B
              </text>

              <rect
                x="48"
                y="14"
                width="3.2"
                height="4.2"
                rx="0.6"
                fill={
                  stadiumState.bins['B-211']?.fill_level > 85
                    ? '#ef4444'
                    : stadiumState.bins['B-211']?.fill_level > 55
                      ? '#f59e0b'
                      : '#10b981'
                }
                stroke="#0f172a"
                strokeWidth="0.5"
              />
              <text
                x="49.6"
                y="17.2"
                fill="#0f172a"
                fontSize="1.8"
                fontWeight="bold"
                textAnchor="middle"
              >
                B
              </text>

              {/* Concessions */}
              <g>
                <circle cx="21" cy="40" r="2.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.5" />
                <text
                  x="21"
                  y="41.2"
                  fill="#0f172a"
                  fontSize="3"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  C
                </text>

                <circle cx="78" cy="40" r="2.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.5" />
                <text
                  x="78"
                  y="41.2"
                  fill="#0f172a"
                  fontSize="3"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  C
                </text>

                <circle cx="21" cy="62" r="2.5" fill="#ef4444" stroke="#0f172a" strokeWidth="0.5" />
                <text
                  x="21"
                  y="63.2"
                  fill="#0f172a"
                  fontSize="3"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  C
                </text>

                <circle cx="78" cy="62" r="2.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="0.5" />
                <text
                  x="78"
                  y="63.2"
                  fill="#0f172a"
                  fontSize="3"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  C
                </text>
              </g>

              {/* Redirect Routes */}
              {redirectRoutes.map((route) => {
                let x1 = 30;
                let y1 = 75;
                let x2 = 70;
                let y2 = 75;
                let pathLabel = 'Redirect C➔D';

                if (route.from === 'Gate C' && route.to === 'Gate D') {
                  x1 = 30;
                  y1 = 75;
                  x2 = 70;
                  y2 = 75;
                  pathLabel = 'Redirect C➔D';
                } else if (route.from === 'Gate A' && route.to === 'Gate C') {
                  x1 = 30;
                  y1 = 25;
                  x2 = 30;
                  y2 = 75;
                  pathLabel = 'Redirect A➔C';
                } else if (route.from === 'Gate B' && route.to === 'Gate D') {
                  x1 = 70;
                  y1 = 25;
                  x2 = 70;
                  y2 = 75;
                  pathLabel = 'Redirect B➔D';
                }

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
                      {pathLabel}
                    </text>
                  </g>
                );
              })}

              {/* Medical Incident Locator Badges */}
              {medicalIncidents.map((inc) => {
                const text = `${inc.recommended_action} ${inc.problem}`.toLowerCase();
                let x = 50;
                let y = 50;
                let label = 'MED CONCOURSE';

                if (text.includes('gate c')) {
                  x = 30;
                  y = 63;
                  label = 'MED C';
                } else if (text.includes('gate a')) {
                  x = 30;
                  y = 37;
                  label = 'MED A';
                } else if (text.includes('gate b')) {
                  x = 70;
                  y = 37;
                  label = 'MED B';
                } else if (text.includes('gate d')) {
                  x = 70;
                  y = 63;
                  label = 'MED D';
                }

                return (
                  <g key={inc.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#ef4444"
                      opacity="0.3"
                      className="animate-ping"
                    />
                    <circle cx={x} cy={y} r="2.8" fill="#ef4444" opacity="0.95" />
                    <line
                      x1={x}
                      y1={y - 1.5}
                      x2={x}
                      y2={y + 1.5}
                      stroke="white"
                      strokeWidth="0.6"
                    />
                    <line
                      x1={x - 1.5}
                      y1={y}
                      x2={x + 1.5}
                      y2={y}
                      stroke="white"
                      strokeWidth="0.6"
                    />
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
                  <text
                    x="50"
                    y="71"
                    fill="#22d3ee"
                    fontSize="2.2"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
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
                  ></span>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <div className="w-full h-full relative flex flex-col md:flex-row">
            {/* Left Side: Live Geolocation Wayfinding Route Stats */}
            <div className="absolute top-3 left-3 z-10 w-64 bg-slate-950/90 border border-slate-800 p-3 rounded-lg backdrop-blur-sm text-xs space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <Navigation className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="font-bold text-slate-200">GPS Algorithmic Route HUD</span>
              </div>

              {/* Wayfinding presets or active incidents */}
              {wayfindingPreset === 'none' && medicalIncidents.length === 0 ? (
                <div className="text-slate-400 text-[10px]">
                  Select a Route HUD preset (A➔C➔D or B➔D) or log a medical incident to compute
                  dynamic routing vectors.
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">Active Waypoint Path</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Vector:</span>
                    <span className="text-slate-200 font-mono text-[10px]">
                      {wayfindingPreset === 'crowd-spill'
                        ? 'Gate A ➔ Gate C ➔ Gate D'
                        : wayfindingPreset === 'concourse-b-bypass'
                          ? 'Gate B ➔ Gate D'
                          : medicalIncidents.length > 0
                            ? 'Concourse ➔ Emergency Medical Hub'
                            : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Distance:</span>
                    <span className="text-slate-200 font-mono">
                      {wayfindingPreset === 'crowd-spill'
                        ? '410m (Congested Flow)'
                        : wayfindingPreset === 'concourse-b-bypass'
                          ? '180m (Optimal Bypass)'
                          : '120m'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Time of Arrival (ETA):</span>
                    <span className="text-cyan-400 font-mono font-semibold">
                      {wayfindingPreset === 'crowd-spill'
                        ? '3m 45s'
                        : wayfindingPreset === 'concourse-b-bypass'
                          ? '1m 20s'
                          : '55s'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800 font-mono">
                    Vector: Lat 19.3013, Lng -99.1528
                    <br />
                    System: Dijkstra flow-weighted
                  </div>
                </div>
              )}
            </div>

            <iframe
              title="Stadium Geolocation Route Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.1422037989396!2d-99.1528656247904!3d19.301323381958742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce0016a2468305%3A0x444b706c2786a8a4!2sEstadio%20Azteca!5e0!3m2!1sen!2smx!4v1710000000000!5m2!1sen!2smx"
              width="100%"
              height="100%"
              className="border-0 opacity-80"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MapWrapper);
