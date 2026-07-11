/**
 * Canonical string constants for all named zones inside the stadium.
 *
 * Using this enum-like object (rather than inline string literals) ensures
 * zone names are refactored safely across hooks, components, and AI prompts.
 * Keys use SCREAMING_SNAKE_CASE; values are the human-readable display strings
 * that appear in the UI, Firestore documents, and Gemini JSON responses.
 */
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

/**
 * Live telemetry snapshot for a single stadium entry gate.
 *
 * Updated every simulation tick (~5 s) from sensor drift in `useSimulation`,
 * and in live mode via Firestore `onSnapshot` listeners in `useFirestoreSync`.
 */
export interface GateTelemetry {
  /** Canonical gate name, e.g. `"Gate A"`, `"Gate B"`. */
  gate: string;
  /** Current crowd density as a percentage (0–100). Above 80% triggers URGENT AI response. */
  density: number;
  /** Fan arrival rate in people per minute. */
  arrival_rate: number;
  /** Estimated wait time in minutes to pass through the gate. */
  wait_time: number;
  /** Maximum design throughput (fans/hour). Optional — used for capacity planning. */
  capacity?: number;
  /** SVG map position as relative offsets (0–100). Used to place the gate circle on the HUD. */
  coordinates?: { x: number; y: number };
}

/**
 * Live telemetry snapshot for a single IoT-connected smart trash bin.
 *
 * Fill level and adjacent crowd density are updated every simulation tick.
 * When `fill_level > 85%` and `assigned_crew` is null, the AI Reasoning Engine
 * proactively dispatches a sanitation crew via the `/api/reasoning` route.
 */
export interface SmartBinTelemetry {
  /** Unique bin identifier, e.g. `"B-101"`. Matches Firestore document ID. */
  bin_id: string;
  /** Zone the bin is located in, e.g. `"Gate C Concourses"`. */
  zone: string;
  /** Current fill level as a percentage (0–100). */
  fill_level: number;
  /** Crowd density in the adjacent area — used to project how fast the bin fills. */
  adjacent_density: number;
  /** ISO timestamp of the last time this bin was emptied by a crew. */
  last_emptied?: string;
  /** Crew ID currently assigned to empty this bin (e.g. `"CREW-DELTA-04"`), or null if unassigned. */
  assigned_crew?: string | null;
}

/**
 * Live telemetry snapshot for a single concession / food & beverage stand.
 *
 * Queue length and stock level are updated every simulation tick. When
 * `stock_level < 15%` the simulation auto-triggers a restock event.
 */
export interface ConcessionTelemetry {
  /** Unique concession identifier, e.g. `"C-101"`. Matches Firestore document ID. */
  concession_id: string;
  /** Display name of the stand, e.g. `"Corner Kick Burgers"`. */
  name: string;
  /** Zone the stand is in, e.g. `"Gate A Concourse"`. */
  zone: string;
  /** Number of fans currently waiting in the queue. */
  queue_length: number;
  /** Estimated wait time in minutes to be served. */
  wait_time: number;
  /** Stock level as a percentage (0–100). Auto-restocks when below 15%. */
  stock_level: number;
  /** Operational status: `OPEN` (normal), `BUSY` (queue > 40), or `CLOSED` (no fans). */
  status: 'OPEN' | 'BUSY' | 'CLOSED';
}

/**
 * Complete real-time telemetry snapshot of the entire stadium.
 *
 * This is the canonical data structure passed to the AI Reasoning Engine,
 * stored in Firestore (or LocalStorage in sandbox mode), and distributed
 * to all UI components via `AppContext`.
 *
 * All three lookup maps use string keys for O(1) access via the `lookupGate`,
 * `lookupBin`, and `lookupConcession` helpers in `stadiumState.ts`.
 */
export interface StadiumState {
  /** Gates telemetry keyed by gate name (e.g. `"Gate A"`). */
  gates: Record<string, GateTelemetry>;
  /** Smart bins telemetry keyed by bin ID (e.g. `"B-101"`). */
  bins: Record<string, SmartBinTelemetry>;
  /** Concessions telemetry keyed by concession ID (e.g. `"C-101"`). */
  concessions: Record<string, ConcessionTelemetry>;
  /** Current weather description, e.g. `"Hot & Clear (29°C)"`. Included in every AI prompt. */
  weather: string;
  /** Number of active medical cases in the vicinity. Contributes to AI risk scoring. */
  nearby_medical_cases: number;
}

/**
 * Three-tier incident severity classification returned by the AI Reasoning Engine.
 *
 * - `ROUTINE` — standard operational queries (navigation, restrooms, info)
 * - `URGENT` — crowd congestion, concession issues, bin overflow — requires response within minutes
 * - `CRITICAL_EMERGENCY` — medical emergencies, crowd crush — requires immediate dispatch
 */
export type IncidentType = 'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY';

/**
 * AI-generated situational analysis accompanying a reasoning response.
 * Used for Explainable AI (XAI) — displayed alongside recommended actions so
 * operations managers understand *why* the AI made a decision.
 */
export interface IncidentAnalysis {
  /** Plain-English description of the current stadium state that triggered this analysis. */
  current_state: string;
  /** Forward-looking reasoning: what will happen if no action is taken. */
  predictive_reasoning: string;
}

/**
 * Structured action directive produced by the AI Reasoning Engine.
 * Tells operations which resource to dispatch, where, and with what priority.
 */
export interface IncidentActionPlan {
  /** Human-readable action description for the operations team. */
  recommended_action: string;
  /** Target zone where the action should be performed. */
  target_zone: string;
  /** ID of the resource (crew, unit) being dispatched, e.g. `"CREW-DELTA-04"`. */
  dispatched_resource_id: string;
  /** Algorithmic routing priority used to sequence multiple concurrent dispatches. */
  algorithmic_routing_priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Multilingual broadcast payload generated by the AI Copilot.
 * Contains both a staff-facing script (for volunteers) and a fan-facing announcement.
 */
export interface BroadcastPayload {
  /** IETF language code of the primary broadcast language. */
  language_code: string;
  /** Direct instructions for the volunteer on the ground. */
  staff_script: string;
  /** Public announcement text for PA systems or digital signage, or null if not applicable. */
  fan_announcement: string | null;
}

/**
 * A persisted incident record combining AI analysis with operational metadata.
 *
 * Created by `useAiReasoning` when the reasoning engine returns an actionable
 * recommendation, and stored in Firestore (or LocalStorage in sandbox mode).
 * Resolved incidents are retained for post-match operations analytics.
 */
export interface Incident {
  /** Unique identifier, e.g. `"inc-1720685432000-42"`. */
  id: string;
  /** Severity classification of this incident. */
  incident_type: IncidentType;
  /** One-line description of the problem that triggered this incident. */
  problem: string;
  /** Plain-English AI reasoning explaining why this was flagged. */
  reasoning: string;
  /** Short action description for the incident feed card. */
  recommended_action: string;
  /** AI confidence score (0–100) for this classification. */
  confidence: number;
  /** Direct message for the first-responding volunteer. */
  message_for_volunteer: string;
  /** Zone where the incident is occurring. */
  target_zone: string;
  /** ID of the resource dispatched in response. */
  dispatched_resource_id: string;
  /** Routing priority for concurrent dispatch sequencing. */
  algorithmic_routing_priority: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Multilingual broadcast payload for PA/signage. */
  broadcast_payload: BroadcastPayload;
  /** ISO 8601 timestamp of when this incident was created. */
  timestamp: string;
  /** Current lifecycle status of this incident. */
  status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED';
}

/**
 * A single message in the AI Copilot conversation thread.
 *
 * Volunteer messages (`sender: "volunteer"`) contain raw free-text input.
 * AI responses (`sender: "ai"`) include the structured classification result,
 * multilingual translations, and an action plan — displayed as a rich card in the UI.
 */
export interface CopilotMessage {
  /** Unique message identifier used as React key. */
  id: string;
  /** Who sent this message. */
  sender: 'volunteer' | 'ai';
  /** Display text of the message. */
  text: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** AI incident classification (only on AI messages). */
  incident_type?: IncidentType;
  /** Multilingual translations for the AI response (only on AI messages). */
  translations?: {
    en: string;
    es: string;
    fr: string;
    ar?: string;
  };
  /** Plain-English reasoning for this classification (only on AI messages). */
  reasoning?: string;
  /** Recommended action from the AI (only on AI messages). */
  action_plan?: {
    recommended_action: string;
    target_zone: string;
    priority: string;
  };
}
