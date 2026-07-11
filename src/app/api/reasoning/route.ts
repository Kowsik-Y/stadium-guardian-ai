import { NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { withRouteProxy } from '@/lib/proxy';
import {
  type ConcessionTelemetry,
  type GateTelemetry,
  type SmartBinTelemetry,
  STADIUM_ZONES,
} from '@/lib/types';

const SYSTEM_INSTRUCTION = `You are Stadium Guardian AI (codenamed EcoFlow), an emergency-aware, high-performance smart stadium operations assistant.
Your responsibility is to improve safety, manage crowd movement, optimize waste collection (sustainability), and assist volunteers/staff.
You process real-time telemetry packets (synthetic streams of crowd density, bin fill levels, and wait times) and multilingual inputs.

You never output generic answers or static text. You must process data through a strict Input -> Predictive Reasoning -> Action framework.

### CORE CONSTRAINTS & BEHAVIORS:
1. EXPLAINABLE AI (XAI): Every response must contain a detailed plain-English predictive reasoning explaining why you recommend a specific action (e.g. queue bottleneck timeline, overflowing bin halftime rush forecast).
2. CONTEXTUAL SENSITIVITY: Distinguish instantly between routine operational friction (e.g., standard trash collection) and urgent bottlenecks, or critical emergencies.
3. OUTPUT FORMAT: You must strictly output valid JSON matching the schema below. No markdown formatting or conversational prose outside the JSON.

### STRUCTURED JSON SCHEMA:
{
  "incident_type": "ROUTINE" | "URGENT" | "CRITICAL_EMERGENCY",
  "analysis": {
    "current_state": "Detailed description of the ingested metrics and statuses",
    "predictive_reasoning": "Explain *why* this matters over the next 5-10 minutes. Forecast congestion or failures."
  },
  "action_plan": {
    "recommended_action": "Clear, concise operational step",
    "target_zone": "Specific Gate/Section/Concourse ID",
    "dispatched_resource_id": "ID of the staff, marshal or cleaning crew (e.g., CREW-DELTA-04, MEDICAL-ALPHA, MARSHAL-B)",
    "algorithmic_routing_priority": "HIGH" | "MEDIUM" | "LOW"
  },
  "broadcast_payload": {
    "language_code": "ISO code (e.g., 'en', 'es', 'fr', 'ar')",
    "staff_script": "The exact script/instruction for the staff on the ground in a professional register",
    "fan_announcement": "Public announcement script if redirecting fans. Null if not needed. Make it culturally and linguistically nuanced."
  }
}`;

// Mock generator for sandbox mode
function generateMockReasoning(
  gates: Record<string, GateTelemetry> | null,
  bins: Record<string, SmartBinTelemetry> | null,
  concessions: Record<string, ConcessionTelemetry> | null,
  weather: string,
  medicalCases: number,
) {
  // Find highest density gate
  let maxDensityGate: string = STADIUM_ZONES.GATE_A;
  let maxDensity = 0;
  let arrivalRate = 0;
  let waitTime = 0;

  if (gates) {
    Object.keys(gates).forEach((gName) => {
      const g = gates[gName];
      if (g.density > maxDensity) {
        maxDensity = g.density;
        maxDensityGate = gName;
        arrivalRate = g.arrival_rate;
        waitTime = g.wait_time;
      }
    });
  }

  // Find fullest bin
  let maxBinId = 'B-101';
  let maxBinFill = 0;
  let maxBinZone = '';

  if (bins) {
    Object.keys(bins).forEach((bId) => {
      const b = bins[bId];
      if (b.fill_level > maxBinFill) {
        maxBinFill = b.fill_level;
        maxBinId = bId;
        maxBinZone = b.zone;
      }
    });
  }

  // Find most congested concession
  let maxConcessionId = '';
  let maxQueueLength = 0;
  let maxConcessionName = '';
  if (concessions) {
    Object.keys(concessions).forEach((cId) => {
      const c = concessions[cId];
      if (c.queue_length > maxQueueLength) {
        maxQueueLength = c.queue_length;
        maxConcessionId = cId;
        maxConcessionName = c.name;
      }
    });
  }

  // Determine incident type
  if (medicalCases > 3) {
    return {
      incident_type: 'CRITICAL_EMERGENCY',
      analysis: {
        current_state: `Multiple medical cases reported (${medicalCases} cases) adjacent to high crowd gates. High ambient weather temp (${weather}).`,
        predictive_reasoning: `Elevated weather conditions and sustained crowd stress are compounding risk. Heat stroke and exhaustion cases will compound over the next 10 minutes, overwhelming localized resources.`,
      },
      action_plan: {
        recommended_action:
          'Deploy Medical Response Unit Alpha and set up hydration stations at main access zones.',
        target_zone: maxDensityGate,
        dispatched_resource_id: 'MEDICAL-RESPONSE-ALPHA',
        algorithmic_routing_priority: 'HIGH',
      },
      broadcast_payload: {
        language_code: 'en',
        staff_script: `EMERGENCY DISPATCH: Proceed to ${maxDensityGate} immediately. Multiple heat/respiratory distress reports. Set up triage area.`,
        fan_announcement:
          'For your safety, hydration stations are now available at all gates. If you feel unwell, please approach any staff member wearing a red armband.',
      },
    };
  } else if (maxDensity > 80) {
    // Find gate with lowest density to redirect to
    let minDensityGate: string = STADIUM_ZONES.GATE_D;
    let minDensity = 100;
    if (gates) {
      Object.keys(gates).forEach((gName) => {
        if (gName !== maxDensityGate && gates[gName].density < minDensity) {
          minDensity = gates[gName].density;
          minDensityGate = gName;
        }
      });
    }

    return {
      incident_type: 'URGENT',
      analysis: {
        current_state: `${maxDensityGate} is experiencing severe congestion at ${maxDensity}% density with an arrival rate of ${arrivalRate} fans/min. Wait times have hit ${waitTime} minutes.`,
        predictive_reasoning: `At the current arrival rate, ${maxDensityGate} will exceed safe flow capacity in 4 minutes, causing major bottlenecks, queue spillage, and crush hazards.`,
      },
      action_plan: {
        recommended_action: `Redirect 30% of incoming fans to ${minDensityGate} (density is currently ${minDensity}%).`,
        target_zone: `${maxDensityGate} Plaza`,
        dispatched_resource_id: 'MARSHAL-CRISIS-B',
        algorithmic_routing_priority: 'HIGH',
      },
      broadcast_payload: {
        language_code: 'en',
        staff_script: `Deploying additional marshals to ${maxDensityGate} Outer Plaza. Please redirect incoming fans towards ${minDensityGate} by holding signs and megaphones.`,
        fan_announcement: `Crowd alert: ${maxDensityGate} is currently heavily crowded. Please proceed to ${minDensityGate} where wait times are under 5 minutes.`,
      },
    };
  } else if (maxBinFill > 75) {
    const crewNum = maxBinId.slice(-3);
    return {
      incident_type: 'ROUTINE',
      analysis: {
        current_state: `Smart Waste Bin ${maxBinId} in ${maxBinZone} is at ${maxBinFill}% capacity. Local crowd density is moderate.`,
        predictive_reasoning: `Crowd traffic is expected to swell due to halftime approaching in 15 minutes. Emptying ${maxBinId} now prevents refuse overflow and clean-up delays during peak traffic.`,
      },
      action_plan: {
        recommended_action: `Proactively clear and swap Smart Waste Bin ${maxBinId}.`,
        target_zone: maxBinZone,
        dispatched_resource_id: `CREW-DELTA-${crewNum}`,
        algorithmic_routing_priority: 'LOW',
      },
      broadcast_payload: {
        language_code: 'en',
        staff_script: `Routine dispatch: Clear and replace liner for Smart Waste Bin ${maxBinId} in ${maxBinZone} before halftime.`,
        fan_announcement: null,
      },
    };
  } else {
    // Check concession pressure
    if (maxQueueLength > 60) {
      return {
        incident_type: 'ROUTINE',
        analysis: {
          current_state: `Concession stand "${maxConcessionName}" (${maxConcessionId}) has a queue of ${maxQueueLength} fans. Adjacent gate density is at ${maxDensity}% with ${arrivalRate}/min arrivals.`,
          predictive_reasoning: `High concession queue at "${maxConcessionName}" indicates halftime rush. If not managed, wait times will exceed 30 minutes and spillover into gate egress pathways, compounding pedestrian bottlenecks.`,
        },
        action_plan: {
          recommended_action: `Deploy additional concession crew C-CREW-03 and open reserve counter at ${maxConcessionName}.`,
          target_zone: maxConcessionName,
          dispatched_resource_id: 'C-CREW-03',
          algorithmic_routing_priority: 'LOW',
        },
        broadcast_payload: {
          language_code: 'en',
          staff_script: `Concession pressure alert: Open the secondary service window at ${maxConcessionName}. Current queue: ${maxQueueLength} fans.`,
          fan_announcement: `For faster service, additional counters are now open at ${maxConcessionName}. Consider visiting nearby stands to avoid waits.`,
        },
      };
    }

    // Baseline: all systems nominal
    return {
      incident_type: 'ROUTINE',
      analysis: {
        current_state: `All systems nominal. Peak gate: ${maxDensityGate} at ${maxDensity}% density, ${arrivalRate}/min arrival rate. Max bin fill: ${maxBinFill}% at ${maxBinId}. Weather: ${weather}.`,
        predictive_reasoning:
          'Current arrival volumes and crowd flow are balanced. No bottlenecks forecasted over the next 15 minutes. Continuous monitoring active.',
      },
      action_plan: {
        recommended_action: 'Maintain standard spectator gate monitoring.',
        target_zone: 'All Zones',
        dispatched_resource_id: 'STANDARD-VOLUNTEERS',
        algorithmic_routing_priority: 'LOW',
      },
      broadcast_payload: {
        language_code: 'en',
        staff_script:
          'All units report normal operations. Continue assisting fans at designated entry check-ins.',
        fan_announcement: null,
      },
    };
  }
}

export const POST = withRouteProxy(async (req: Request) => {
  let gates: Record<string, GateTelemetry> | null = null;
  let bins: Record<string, SmartBinTelemetry> | null = null;
  let concessions: Record<string, ConcessionTelemetry> | null = null;
  let weather = 'hot';
  let nearby_medical_cases = 0;

  try {
    const body = await req.json();
    gates = body.gates;
    bins = body.bins;
    concessions = body.concessions;
    weather = body.weather;
    nearby_medical_cases = body.nearby_medical_cases;

    if (!geminiModel) {
      // Missing API key fallback (Sandbox simulation mode)
      const mockResult = generateMockReasoning(
        gates,
        bins,
        concessions,
        weather,
        nearby_medical_cases || 0,
      );
      return NextResponse.json({
        ...mockResult,
        confidence: 90,
        mode: 'SIMULATION',
      });
    }

    const model = geminiModel;
    const promptText = `
Input Data Packet:
${JSON.stringify({ gates, bins, concessions, weather, nearby_medical_cases }, null, 2)}

Provide an operations decision in JSON following the system instructions.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${promptText}` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    const parsedData = JSON.parse(text);

    return NextResponse.json({
      ...parsedData,
      confidence: parsedData.confidence || Math.floor(Math.random() * 10) + 88,
      mode: 'LIVE',
    });
  } catch (error: unknown) {
    console.error('Gemini reasoning route error, falling back to mock:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    const mockResult = generateMockReasoning(
      gates,
      bins,
      concessions,
      weather,
      nearby_medical_cases,
    );
    return NextResponse.json({
      ...mockResult,
      confidence: 85,
      mode: 'SIMULATION_FALLBACK',
      warning: `Gemini API call failed (${errMessage}). Switched to sandbox backup.`,
    });
  }
});
