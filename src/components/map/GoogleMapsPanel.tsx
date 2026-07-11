'use client';

import { Navigation } from 'lucide-react';
import type { WayfindingPreset } from '@/lib/mapVisuals';
import type { Incident } from '@/lib/types';

interface GoogleMapsPanelProps {
  wayfindingPreset: WayfindingPreset;
  medicalIncidents: Incident[];
}

function getPrimaryVector(
  wayfindingPreset: WayfindingPreset,
  hasMedicalIncidents: boolean,
): string {
  if (wayfindingPreset === 'crowd-spill') return 'Gate A ➔ Gate C ➔ Gate D';
  if (wayfindingPreset === 'concourse-b-bypass') return 'Gate B ➔ Gate D';
  if (hasMedicalIncidents) return 'Concourse ➔ Emergency Medical Hub';
  return 'None';
}

function getTotalDistance(wayfindingPreset: WayfindingPreset): string {
  if (wayfindingPreset === 'crowd-spill') return '410m (Congested Flow)';
  if (wayfindingPreset === 'concourse-b-bypass') return '180m (Optimal Bypass)';
  return '120m';
}

function getEta(wayfindingPreset: WayfindingPreset): string {
  if (wayfindingPreset === 'crowd-spill') return '3m 45s';
  if (wayfindingPreset === 'concourse-b-bypass') return '1m 20s';
  return '55s';
}

/** Live route-stats overlay + embedded Google Maps iframe for the "Google Maps Navigation" tab. */
export function GoogleMapsPanel({ wayfindingPreset, medicalIncidents }: GoogleMapsPanelProps) {
  const hasActiveRoute = wayfindingPreset !== 'none' || medicalIncidents.length > 0;

  return (
    <div className="w-full h-full relative flex flex-col md:flex-row">
      <div className="absolute top-3 left-3 z-10 w-64 bg-slate-950/90 border border-slate-800 p-3 rounded-lg backdrop-blur-sm text-xs space-y-2">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
          <Navigation className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-slate-200">GPS Algorithmic Route HUD</span>
        </div>

        {hasActiveRoute ? (
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-bold">Active Waypoint Path</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Vector:</span>
              <span className="text-slate-200 font-mono text-[10px]">
                {getPrimaryVector(wayfindingPreset, medicalIncidents.length > 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Distance:</span>
              <span className="text-slate-200 font-mono">{getTotalDistance(wayfindingPreset)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Est. Time of Arrival (ETA):</span>
              <span className="text-cyan-400 font-mono font-semibold">
                {getEta(wayfindingPreset)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800 font-mono">
              Vector: Lat 19.3013, Lng -99.1528
              <br />
              System: Dijkstra flow-weighted
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-[10px]">
            Select a Route HUD preset (A➔C➔D or B➔D) or log a medical incident to compute dynamic
            routing vectors.
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
      />
    </div>
  );
}
