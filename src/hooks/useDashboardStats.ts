'use client';

import { useMemo } from 'react';
import type { Incident, StadiumState } from '@/lib/types';

interface DashboardStats {
  avgDensity: number;
  avgWaitTime: number;
  maxBinFill: number;
  calculatedRiskScore: number;
  activeIncidents: Incident[];
  medicalIncidents: Incident[];
  redirectRoutes: Array<{ id: string; from: string; to: string }>;
}

/**
 * Custom hook to isolate and calculate stats from the live stadium state.
 * Keeps the presentational page layout component clean and highly focused.
 */
export function useDashboardStats(
  stadiumState: StadiumState,
  incidents: Incident[],
): DashboardStats {
  return useMemo(() => {
    const gatesList = Object.values(stadiumState.gates);
    const binsList = Object.values(stadiumState.bins);
    const activeIncidents = incidents.filter((inc) => inc.status === 'ACTIVE');

    // 1. Averages
    const avgDensity = Math.round(
      gatesList.reduce((acc, g) => acc + g.density, 0) / (gatesList.length || 1),
    );
    const avgWaitTime = Math.round(
      gatesList.reduce((acc, g) => acc + g.wait_time, 0) / (gatesList.length || 1),
    );
    const maxBinFill = Math.max(...binsList.map((b) => b.fill_level), 0);

    // 2. Risk Score calculation
    const calculatedRiskScore = Math.min(
      100,
      Math.round(
        avgDensity * 0.4 +
          avgWaitTime * 2.5 +
          stadiumState.nearby_medical_cases * 10 +
          activeIncidents.filter((i) => i.incident_type === 'CRITICAL_EMERGENCY').length * 20,
      ),
    );

    // 3. Medical incidents list
    const medicalIncidents = activeIncidents.filter(
      (inc) =>
        inc.recommended_action.toLowerCase().includes('medical') ||
        inc.problem.toLowerCase().includes('breathe') ||
        inc.message_for_volunteer.toLowerCase().includes('medical'),
    );

    // 4. Ingress dynamic redirection routes
    const redirectRoutes = activeIncidents
      .map((inc) => {
        const text =
          `${inc.recommended_action} ${inc.problem} ${inc.message_for_volunteer}`.toLowerCase();
        let from = '';
        let to = '';

        if (text.includes('gate c')) from = 'Gate C';
        else if (text.includes('gate a')) from = 'Gate A';
        else if (text.includes('gate b')) from = 'Gate B';
        else if (text.includes('gate d')) from = 'Gate D';

        if (text.includes('gate d') && from !== 'Gate D') to = 'Gate D';
        else if (text.includes('gate b') && from !== 'Gate B') to = 'Gate B';
        else if (text.includes('gate a') && from !== 'Gate A') to = 'Gate A';
        else if (text.includes('gate c') && from !== 'Gate C') to = 'Gate C';

        if (text.includes('moroccan') || text.includes('عباد')) {
          from = 'Gate C';
          to = 'Gate D';
        }

        if (from && to && from !== to) {
          return { id: inc.id, from, to };
        }
        return null;
      })
      .filter(Boolean) as Array<{ id: string; from: string; to: string }>;

    return {
      avgDensity,
      avgWaitTime,
      maxBinFill,
      calculatedRiskScore,
      activeIncidents,
      medicalIncidents,
      redirectRoutes,
    };
  }, [stadiumState, incidents]);
}
