import { describe, expect, it } from 'vitest';
import {
  getInitialStadiumState,
  lookupBin,
  lookupConcession,
  lookupGate,
} from '@/lib/stadiumState';

describe('Stadium State Operations', () => {
  it('should initialize stadium telemetry with defaults', () => {
    const state = getInitialStadiumState();
    expect(state).toBeDefined();
    expect(state.gates).toBeDefined();
    expect(state.bins).toBeDefined();
    expect(state.concessions).toBeDefined();
    expect(Object.keys(state.gates).length).toBe(4); // Gate A, B, C, D
    expect(Object.keys(state.bins).length).toBe(6); // Correct bin counts
    expect(Object.keys(state.concessions).length).toBe(4); // C-101 to C-104
  });

  it('should find gates correctly via lookupGate helper', () => {
    const state = getInitialStadiumState();
    const gate = lookupGate(state.gates, 'Gate C');
    expect(gate).toBeDefined();
    expect(gate?.gate).toBe('Gate C');
    expect(gate?.capacity).toBeGreaterThan(0);
  });

  it('should find smart bins correctly via lookupBin helper', () => {
    const state = getInitialStadiumState();
    const bin = lookupBin(state.bins, 'B-101');
    expect(bin).toBeDefined();
    expect(bin?.zone).toBe('Gate A Concourses');
    expect(bin?.fill_level).toBe(42);
  });

  it('should find concessions correctly via lookupConcession helper', () => {
    const state = getInitialStadiumState();
    const concession = lookupConcession(state.concessions, 'C-101');
    expect(concession).toBeDefined();
    expect(concession?.name).toBe('Corner Kick Burgers');
    expect(concession?.queue_length).toBe(12);
  });

  it('should return null for non-existent gates, bins, and concessions', () => {
    const state = getInitialStadiumState();
    const gate = lookupGate(state.gates, 'Gate Unknown');
    const bin = lookupBin(state.bins, 'B-999');
    const concession = lookupConcession(state.concessions, 'C-999');
    expect(gate).toBeNull();
    expect(bin).toBeNull();
    expect(concession).toBeNull();
  });
});
