import {
  type ConcessionTelemetry,
  type GateTelemetry,
  type Incident,
  type SmartBinTelemetry,
  STADIUM_ZONES,
  type StadiumState,
} from './types';

export const INITIAL_GATES: Record<string, GateTelemetry> = {
  'Gate A': {
    gate: STADIUM_ZONES.GATE_A,
    density: 40,
    arrival_rate: 100,
    wait_time: 5,
    capacity: 600,
    coordinates: { x: 30, y: 25 },
  },
  'Gate B': {
    gate: STADIUM_ZONES.GATE_B,
    density: 60,
    arrival_rate: 200,
    wait_time: 10,
    capacity: 600,
    coordinates: { x: 70, y: 25 },
  },
  'Gate C': {
    gate: STADIUM_ZONES.GATE_C,
    density: 82,
    arrival_rate: 500,
    wait_time: 18,
    capacity: 600,
    coordinates: { x: 30, y: 75 },
  },
  'Gate D': {
    gate: STADIUM_ZONES.GATE_D,
    density: 35,
    arrival_rate: 120,
    wait_time: 4,
    capacity: 600,
    coordinates: { x: 70, y: 75 },
  },
};

export const INITIAL_BINS: Record<string, SmartBinTelemetry> = {
  'B-101': {
    bin_id: 'B-101',
    zone: STADIUM_ZONES.CONCOURSE_A_BINS,
    fill_level: 42,
    adjacent_density: 40,
    last_emptied: new Date().toISOString(),
    assigned_crew: null,
  },
  'B-102': {
    bin_id: 'B-102',
    zone: STADIUM_ZONES.CONCOURSE_B_BINS,
    fill_level: 65,
    adjacent_density: 60,
    last_emptied: new Date().toISOString(),
    assigned_crew: null,
  },
  'B-103': {
    bin_id: 'B-103',
    zone: STADIUM_ZONES.CONCOURSE_C_EAST,
    fill_level: 88,
    adjacent_density: 82,
    last_emptied: new Date().toISOString(),
    assigned_crew: 'CREW-DELTA-01',
  },
  'B-104': {
    bin_id: 'B-104',
    zone: STADIUM_ZONES.CONCOURSE_C_WEST,
    fill_level: 78,
    adjacent_density: 45,
    last_emptied: new Date().toISOString(),
    assigned_crew: null,
  },
  'B-201': {
    bin_id: 'B-201',
    zone: STADIUM_ZONES.CONCOURSE_D_BINS,
    fill_level: 20,
    adjacent_density: 35,
    last_emptied: new Date().toISOString(),
    assigned_crew: null,
  },
  'B-211': {
    bin_id: 'B-211',
    zone: STADIUM_ZONES.GATE_F_TURNSTILES,
    fill_level: 85,
    adjacent_density: 92,
    last_emptied: new Date().toISOString(),
    assigned_crew: null,
  },
};

export const INITIAL_CONCESSIONS: Record<string, ConcessionTelemetry> = {
  'C-101': {
    concession_id: 'C-101',
    name: 'Corner Kick Burgers',
    zone: STADIUM_ZONES.CONCOURSE_A,
    queue_length: 12,
    wait_time: 4,
    stock_level: 90,
    status: 'OPEN',
  },
  'C-102': {
    concession_id: 'C-102',
    name: 'Touchdown Tacos',
    zone: STADIUM_ZONES.CONCOURSE_B,
    queue_length: 45,
    wait_time: 15,
    stock_level: 80,
    status: 'BUSY',
  },
  'C-103': {
    concession_id: 'C-103',
    name: 'World Cup Snacks',
    zone: STADIUM_ZONES.CONCOURSE_C,
    queue_length: 75,
    wait_time: 25,
    stock_level: 40,
    status: 'BUSY',
  },
  'C-104': {
    concession_id: 'C-104',
    name: 'Pitchside Pizza',
    zone: STADIUM_ZONES.CONCOURSE_D,
    queue_length: 8,
    wait_time: 3,
    stock_level: 95,
    status: 'OPEN',
  },
};

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    incident_type: 'ROUTINE',
    problem: 'Smart Bin B-103 Fullness',
    reasoning:
      'Smart Bin B-103 fill level is at 88% and adjacent crowd density is 82%. If not emptied within 10 minutes, overflowing refuse will create safety hazards and litter.',
    recommended_action: 'Dispatch sanitation team to clear Bin B-103.',
    confidence: 94,
    message_for_volunteer: 'Please notify sanitation team CREW-DELTA-01 to empty Bin B-103.',
    target_zone: 'Gate C Concourse East',
    dispatched_resource_id: 'CREW-DELTA-01',
    algorithmic_routing_priority: 'LOW',
    broadcast_payload: {
      language_code: 'en',
      staff_script:
        'Routine dispatch: Empty Bin B-103 in Gate C Concourse East. Halftime crowd approaching.',
      fan_announcement: null,
    },
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    status: 'ACTIVE',
  },
  {
    id: 'inc-002',
    incident_type: 'URGENT',
    problem: 'Gate C crowd bottleneck',
    reasoning:
      'Gate C is operating at 82% capacity with a high arrival rate (500 people/min). Predictive queues will bottleneck within 5 minutes.',
    recommended_action: 'Redirect 30% of approaching crowds to Gate D (35% density).',
    confidence: 92,
    message_for_volunteer:
      'Instruct arriving fans to proceed to Gate D. Display redirect signages.',
    target_zone: 'Gate C External Plaza',
    dispatched_resource_id: 'MARSHAL-TEAM-B',
    algorithmic_routing_priority: 'MEDIUM',
    broadcast_payload: {
      language_code: 'en',
      staff_script:
        'Redirect active: Deploy marshals to Gate C exit paths. Redirect 30% of arriving flow towards Gate D.',
      fan_announcement:
        'Attention fans: Gate C is currently experiencing high wait times. Please follow the glowing green route to Gate D for faster entry.',
    },
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
    status: 'ACTIVE',
  },
];

/**
 * Returns the canonical initial StadiumState used on first load and in
 * sandbox simulation mode. All gate, bin, and concession records reflect
 * a realistic FIFA World Cup 2026 pre-match scenario.
 */
export function getInitialStadiumState(): StadiumState {
  return {
    gates: INITIAL_GATES,
    bins: INITIAL_BINS,
    concessions: INITIAL_CONCESSIONS,
    weather: 'Hot & Clear (29°C)',
    nearby_medical_cases: 2,
  };
}

/**
 * O(1) lookup for a gate by name or letter abbreviation.
 *
 * Accepts both the full canonical key (`"Gate C"`) and bare letter variants
 * (`"C"`, `"GATE C"`) to handle the variety of formats that arrive from
 * Gemini responses and CSV uploads.
 *
 * @param gates - Current gates telemetry map keyed by gate name.
 * @param gateId - Gate identifier in any supported format.
 * @returns The GateTelemetry record or null when not found.
 */
export function lookupGate(
  gates: Record<string, GateTelemetry>,
  gateId: string,
): GateTelemetry | null {
  if (!gateId) return null;
  const cleanId = gateId.trim().toUpperCase();

  // Direct Key Match (e.g. gates["Gate C"])
  if (gates[cleanId]) {
    return gates[cleanId];
  }

  // Fast direct map extraction: Parse gate letter (A-D) to construct "Gate X" key in O(1)
  const letterMatch = cleanId.match(/([A-D])$/);
  if (letterMatch?.[1]) {
    const standardKey = `Gate ${letterMatch[1]}`;
    if (gates[standardKey]) {
      return gates[standardKey];
    }
  }

  return null;
}

/**
 * O(1) lookup for a smart trash bin by its canonical ID (e.g. `"B-103"`).
 *
 * The bin ID is upper-cased before lookup so that inputs from volunteers
 * (`"b-103"`) match the index keys without a linear scan.
 *
 * @param bins - Current bins telemetry map keyed by bin ID.
 * @param binId - Bin identifier, case-insensitive.
 * @returns The SmartBinTelemetry record or null when not found.
 */
export function lookupBin(
  bins: Record<string, SmartBinTelemetry>,
  binId: string,
): SmartBinTelemetry | null {
  const normalizedKey = binId.trim().toUpperCase();
  if (bins[normalizedKey]) {
    return bins[normalizedKey];
  }
  return null;
}

/**
 * O(1) lookup for a concession stand by its canonical ID (e.g. `"C-101"`).
 *
 * @param concessions - Current concessions map keyed by concession ID.
 * @param id - Concession identifier, case-insensitive.
 * @returns The ConcessionTelemetry record or null when not found.
 */
export function lookupConcession(
  concessions: Record<string, ConcessionTelemetry>,
  id: string,
): ConcessionTelemetry | null {
  const cleanId = id.trim().toUpperCase();
  if (concessions[cleanId]) return concessions[cleanId];
  return null;
}
/**
 * Helper to derive the associated main Gate key from any given zone string.
 * This ensures DRY derivation for mapping bins or concessions back to their parent gate.
 */
export function zoneToGateKey(zone: string): string {
  if (zone.includes('Gate A')) return 'Gate A';
  if (zone.includes('Gate B')) return 'Gate B';
  if (zone.includes('Gate C')) return 'Gate C';
  return 'Gate D';
}
