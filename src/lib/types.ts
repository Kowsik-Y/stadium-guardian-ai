export const STADIUM_ZONES = {
  GATE_A: 'Gate A',
  GATE_B: 'Gate B',
  GATE_C: 'Gate C',
  GATE_D: 'Gate D',
  CONCOURSE_A: 'Gate A Concourse',
  CONCOURSE_B: 'Gate B Concourse',
  CONCOURSE_C: 'Gate C Concourse',
  CONCOURSE_D: 'Gate D Concourse',
  CONCOURSE_A_BINS: 'Gate A Concourses',
  CONCOURSE_B_BINS: 'Gate B Concourses',
  CONCOURSE_C_EAST: 'Gate C Concourse East',
  CONCOURSE_C_WEST: 'Gate C Concourse West',
  CONCOURSE_D_BINS: 'Gate D Concourses',
  GATE_F_TURNSTILES: 'Gate F Turnstiles',
  GATE_C_EXT: 'Gate C External Plaza',
  GATE_C_PLAZA: 'Gate C Plaza',
  CURRENT_SECTOR: 'Current Volunteer Sector',
} as const;

export interface GateTelemetry {
  gate: string; // e.g. "Gate A", "Gate B"
  density: number; // percentage (0-100)
  arrival_rate: number; // people/min
  wait_time: number; // minutes
  capacity?: number; // max design throughput
  coordinates?: { x: number; y: number }; // Relative map offsets (0-100)
}

export interface SmartBinTelemetry {
  bin_id: string; // e.g. "B-101"
  zone: string; // e.g. "Gate C Concourses"
  fill_level: number; // percentage (0-100)
  adjacent_density: number; // local crowd density percentage (0-100)
  last_emptied?: string; // Timestamp
  assigned_crew?: string | null; // CREW-DELTA-xx or null
}

export interface ConcessionTelemetry {
  concession_id: string; // e.g. "C-101"
  name: string; // e.g. "Burger & Beer sector A"
  zone: string; // e.g. "Gate A Concourse"
  queue_length: number; // fans in line
  wait_time: number; // minutes
  stock_level: number; // percentage (0-100)
  status: 'OPEN' | 'BUSY' | 'CLOSED';
}

export interface StadiumState {
  gates: Record<string, GateTelemetry>; // Keyed by Gate Name (O(1) search)
  bins: Record<string, SmartBinTelemetry>; // Keyed by Bin ID (O(1) search)
  concessions: Record<string, ConcessionTelemetry>; // Keyed by Concession ID (O(1) search)
  weather: string;
  nearby_medical_cases: number;
}

export type IncidentType = 'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY';

export interface IncidentAnalysis {
  current_state: string;
  predictive_reasoning: string;
}

export interface IncidentActionPlan {
  recommended_action: string;
  target_zone: string;
  dispatched_resource_id: string;
  algorithmic_routing_priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BroadcastPayload {
  language_code: string;
  staff_script: string;
  fan_announcement: string | null;
}

export interface Incident {
  id: string;
  incident_type: IncidentType;
  problem: string;
  reasoning: string;
  recommended_action: string;
  confidence: number;
  message_for_volunteer: string;
  target_zone: string;
  dispatched_resource_id: string;
  algorithmic_routing_priority: 'HIGH' | 'MEDIUM' | 'LOW';
  broadcast_payload: BroadcastPayload;
  timestamp: string; // ISO date string
  status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED';
}

export interface CopilotMessage {
  id: string;
  sender: 'volunteer' | 'ai';
  text: string;
  timestamp: string;
  incident_type?: IncidentType;
  translations?: {
    en: string;
    es: string;
    fr: string;
    ar?: string;
  };
  reasoning?: string;
  action_plan?: {
    recommended_action: string;
    target_zone: string;
    priority: string;
  };
}
