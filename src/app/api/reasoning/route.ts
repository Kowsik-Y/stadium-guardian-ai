import { NextResponse } from 'next/server';
import { geminiModel, generateGeminiJson } from '@/lib/gemini';
import { generateMockReasoning } from '@/lib/mockReasoning';
import { withRouteProxy } from '@/lib/proxy';
import type { ConcessionTelemetry, GateTelemetry, SmartBinTelemetry } from '@/lib/types';

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
      return NextResponse.json({ ...mockResult, confidence: 90, mode: 'SIMULATION' });
    }

    const promptText = `
Input Data Packet:
${JSON.stringify({ gates, bins, concessions, weather, nearby_medical_cases }, null, 2)}

Provide an operations decision in JSON following the system instructions.
`;

    const parsedData = await generateGeminiJson(SYSTEM_INSTRUCTION, promptText);

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
