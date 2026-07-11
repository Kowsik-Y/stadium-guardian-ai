'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StadiumState } from '@/lib/types';

/**
 * Drives the real-time stadium telemetry simulation loop.
 *
 * Every 5 seconds it applies a stochastic drift to:
 * - **Gate density & arrival rates** — random ±2% density walk, ±10 fans/min
 *   arrival fluctuation, and a derived wait-time formula that respects the
 *   relationship between density and throughput.
 * - **Smart bin fill levels** — bins fill faster when adjacent crowd density
 *   is high; crew-assigned bins drain at 15–30 % per tick until empty.
 * - **Concession queues** — queue length is correlated to gate density;
 *   stock levels deplete over time and auto-restock when they hit 15%.
 *
 * The simulation makes the HUD feel alive during demos without requiring
 * live sensor hardware or a Firestore connection.
 */
export function useSimulation(setStadiumState: React.Dispatch<React.SetStateAction<StadiumState>>) {
  const [simulationEnabled, setSimulationEnabled] = useState(true);

  /**
   * Applies one tick of sensor drift to every gate, bin, and concession.
   * All values are clamped to realistic physical bounds so the simulation
   * never produces invalid telemetry (e.g. 110% density or negative wait times).
   */
  const triggerSimulationTick = useCallback(() => {
    setStadiumState((prev) => {
      // ── Gates ────────────────────────────────────────────────────────────
      const nextGates = { ...prev.gates };
      Object.keys(nextGates).forEach((gateName) => {
        const g = nextGates[gateName];
        const delta = Math.floor(Math.random() * 5) - 2; // −2 to +2
        const density = Math.max(10, Math.min(98, g.density + delta));

        const rateDelta = Math.floor(Math.random() * 20) - 10;
        const arrival_rate = Math.max(20, g.arrival_rate + rateDelta);

        // Wait time grows non-linearly: high density + high rate = backlog
        const wait_time = Math.max(2, Math.floor((density / 10) * (arrival_rate / 150)));

        nextGates[gateName] = { ...g, density, arrival_rate, wait_time };
      });

      // ── Smart bins ───────────────────────────────────────────────────────
      const nextBins = { ...prev.bins };
      Object.keys(nextBins).forEach((binId) => {
        const b = nextBins[binId];
        let fill_level = b.fill_level;
        let assigned_crew = b.assigned_crew;

        if (assigned_crew) {
          // Active crew drains the bin 15–30% per tick
          fill_level = Math.max(0, fill_level - Math.floor(Math.random() * 15) - 15);
          if (fill_level === 0) assigned_crew = null; // job complete
        } else {
          // Unattended bins fill faster when adjacent crowd density is high
          const fillDelta = Math.max(1, Math.floor(b.adjacent_density / 30) + 1);
          fill_level = Math.min(100, fill_level + fillDelta);
        }

        // Sync adjacent_density from the corresponding gate
        const gateKey = b.zone.includes('Gate A')
          ? 'Gate A'
          : b.zone.includes('Gate B')
            ? 'Gate B'
            : b.zone.includes('Gate C')
              ? 'Gate C'
              : 'Gate D';

        nextBins[binId] = {
          ...b,
          fill_level,
          assigned_crew,
          adjacent_density: nextGates[gateKey]?.density ?? b.adjacent_density,
        };
      });

      // ── Concessions ──────────────────────────────────────────────────────
      const nextConcessions = { ...prev.concessions };
      Object.keys(nextConcessions).forEach((conId) => {
        const c = nextConcessions[conId];
        const gateKey = c.zone.includes('Gate A')
          ? 'Gate A'
          : c.zone.includes('Gate B')
            ? 'Gate B'
            : c.zone.includes('Gate C')
              ? 'Gate C'
              : 'Gate D';
        const density = nextGates[gateKey]?.density ?? 50;

        // Queue grows when density is high, shrinks when density is low
        const qDelta = Math.floor(Math.random() * 5) - (density > 60 ? 1 : 3);
        const queue_length = Math.max(2, Math.min(120, c.queue_length + qDelta));

        // Wait time: ~35 seconds per fan in queue
        const wait_time = Math.max(1, Math.floor(queue_length * 0.35));

        // Stock depletes randomly; auto-restock when critically low
        let stock_level = c.stock_level;
        if (Math.random() > 0.7) {
          stock_level = Math.max(10, stock_level - Math.floor(Math.random() * 4) - 1);
        }
        if (stock_level < 15) stock_level = 95; // restocked

        const status = queue_length > 40 ? 'BUSY' : queue_length === 0 ? 'CLOSED' : 'OPEN';

        nextConcessions[conId] = { ...c, queue_length, wait_time, stock_level, status };
      });

      return { ...prev, gates: nextGates, bins: nextBins, concessions: nextConcessions };
    });
  }, [setStadiumState]);

  // Run the simulation loop at a fixed 5-second interval
  useEffect(() => {
    if (!simulationEnabled) return;
    const interval = setInterval(triggerSimulationTick, 5000);
    return () => clearInterval(interval);
  }, [simulationEnabled, triggerSimulationTick]);

  return { simulationEnabled, setSimulationEnabled, triggerSimulationTick };
}
