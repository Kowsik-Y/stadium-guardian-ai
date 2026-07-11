import { describe, expect, it } from 'vitest';

/**
 * Unit tests for the simulation tick logic extracted from useSimulation.
 *
 * These tests operate on the pure transformation functions rather than
 * the React hook lifecycle, so they run without a browser environment.
 */

// ─── Helpers mirroring useSimulation tick logic ─────────────────────────────

function tickGate(
  gate: { density: number; arrival_rate: number; wait_time: number },
  delta: number,
  rateDelta: number,
) {
  const density = Math.max(10, Math.min(98, gate.density + delta));
  const arrival_rate = Math.max(20, gate.arrival_rate + rateDelta);
  const wait_time = Math.max(2, Math.floor((density / 10) * (arrival_rate / 150)));
  return { ...gate, density, arrival_rate, wait_time };
}

function tickBin(bin: {
  fill_level: number;
  assigned_crew: string | null;
  adjacent_density: number;
}) {
  let { fill_level, assigned_crew } = bin;
  if (assigned_crew) {
    fill_level = Math.max(0, fill_level - 15); // minimum drain per tick
    if (fill_level === 0) assigned_crew = null;
  } else {
    const fillDelta = Math.max(1, Math.floor(bin.adjacent_density / 30) + 1);
    fill_level = Math.min(100, fill_level + fillDelta);
  }
  return { ...bin, fill_level, assigned_crew };
}

// ─── Gate density clamping ────────────────────────────────────────────────

describe('Simulation tick — gate density clamping', () => {
  it('should never exceed the 98% upper density bound', () => {
    const gate = { density: 97, arrival_rate: 300, wait_time: 20 };
    const result = tickGate(gate, +5, 0); // would become 102 without clamping
    expect(result.density).toBe(98);
  });

  it('should never fall below the 10% lower density bound', () => {
    const gate = { density: 11, arrival_rate: 100, wait_time: 3 };
    const result = tickGate(gate, -5, 0); // would become 6 without clamping
    expect(result.density).toBe(10);
  });

  it('should apply positive delta correctly within normal range', () => {
    const gate = { density: 50, arrival_rate: 150, wait_time: 5 };
    const result = tickGate(gate, +2, 0);
    expect(result.density).toBe(52);
  });

  it('should keep arrival_rate above the 20 fans/min floor', () => {
    const gate = { density: 40, arrival_rate: 22, wait_time: 4 };
    const result = tickGate(gate, 0, -10); // would become 12 without clamping
    expect(result.arrival_rate).toBe(20);
  });
});

// ─── Wait-time formula ────────────────────────────────────────────────────

describe('Simulation tick — wait-time formula', () => {
  it('should compute a minimum wait time of 2 minutes', () => {
    const gate = { density: 10, arrival_rate: 20, wait_time: 0 };
    const result = tickGate(gate, 0, 0);
    expect(result.wait_time).toBeGreaterThanOrEqual(2);
  });

  it('should produce higher wait times when density and arrival rate are both high', () => {
    const lowPressure = tickGate({ density: 20, arrival_rate: 50, wait_time: 0 }, 0, 0);
    const highPressure = tickGate({ density: 90, arrival_rate: 450, wait_time: 0 }, 0, 0);
    expect(highPressure.wait_time).toBeGreaterThan(lowPressure.wait_time);
  });
});

// ─── Bin fill progression ─────────────────────────────────────────────────

describe('Simulation tick — bin fill progression', () => {
  it('should fill unattended bins over time', () => {
    const bin = { fill_level: 50, assigned_crew: null, adjacent_density: 60 };
    const result = tickBin(bin);
    expect(result.fill_level).toBeGreaterThan(50);
  });

  it('should drain crew-assigned bins toward zero', () => {
    const bin = { fill_level: 80, assigned_crew: 'CREW-DELTA-01', adjacent_density: 40 };
    const result = tickBin(bin);
    expect(result.fill_level).toBeLessThan(80);
  });

  it('should clear the crew assignment once the bin reaches 0%', () => {
    const bin = { fill_level: 10, assigned_crew: 'CREW-DELTA-02', adjacent_density: 50 };
    const result = tickBin(bin);
    expect(result.fill_level).toBe(0);
    expect(result.assigned_crew).toBeNull();
  });

  it('should not exceed 100% fill level', () => {
    const bin = { fill_level: 99, assigned_crew: null, adjacent_density: 90 };
    const result = tickBin(bin);
    expect(result.fill_level).toBeLessThanOrEqual(100);
  });

  it('should fill faster with higher adjacent crowd density', () => {
    const lowDensityBin = tickBin({ fill_level: 50, assigned_crew: null, adjacent_density: 10 });
    const highDensityBin = tickBin({ fill_level: 50, assigned_crew: null, adjacent_density: 90 });
    expect(highDensityBin.fill_level).toBeGreaterThanOrEqual(lowDensityBin.fill_level);
  });
});

// ─── Concession status transitions ────────────────────────────────────────

describe('Simulation tick — concession status transitions', () => {
  function deriveConcessionStatus(queueLength: number): 'OPEN' | 'BUSY' | 'CLOSED' {
    return queueLength > 40 ? 'BUSY' : queueLength === 0 ? 'CLOSED' : 'OPEN';
  }

  it('should mark concession BUSY when queue exceeds 40', () => {
    expect(deriveConcessionStatus(41)).toBe('BUSY');
    expect(deriveConcessionStatus(120)).toBe('BUSY');
  });

  it('should mark concession OPEN when queue is between 1 and 40', () => {
    expect(deriveConcessionStatus(1)).toBe('OPEN');
    expect(deriveConcessionStatus(40)).toBe('OPEN');
  });

  it('should mark concession CLOSED only when queue is exactly 0', () => {
    expect(deriveConcessionStatus(0)).toBe('CLOSED');
  });
});
