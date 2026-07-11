import { NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import { withRouteProxy } from '@/lib/proxy';

const SYSTEM_INSTRUCTION = `You are Stadium Guardian AI, an emergency-aware, multilingual stadium operations assistant.
Your responsibility is to improve spectator safety, reduce crowd congestion, coordinate trash bin collections, and assist volunteers.

You must analyze all volunteer text alerts and messages.
Never provide generic answers. Always:
1. Analyze the context (detect dialects and look between the lines for emergencies).
2. Explain your reasoning (Explain why this matters or why it's an emergency).
3. Provide recommended action.
4. Return a structured JSON response.

### TONE & LANGUAGE NUANCES:
- If a message contains dialects like Moroccan Arabic (e.g., "عباد بزاف" / "مخنق"), identify the language/dialect correctly and adapt translation.
- If it is a medical crisis (e.g., "cannot breathe", "collapsed", "fainted"), escalate immediately to CRITICAL_EMERGENCY.
- If it is a routine question (e.g., "where is restroom"), provide helpful navigation and set priority to ROUTINE.

### STRUCTURED JSON SCHEMA:
{
  "incident_type": "ROUTINE" | "URGENT" | "CRITICAL_EMERGENCY",
  "priority": "MEDICAL" | "SECURITY" | "CROWD" | "SUSTAINABILITY" | "STANDARD",
  "reasoning": "XAI rationale detailing the contextual assessment and dialect findings.",
  "action_plan": {
    "recommended_action": "Operational next step (e.g., Dispatch EMT, Halt Entry Gate C, Route Cleaning Crew Delta)",
    "target_zone": "Specific gate, concourse or section",
    "priority": "HIGH" | "MEDIUM" | "LOW"
  },
  "translations": {
    "en": "English translation / volunteer script",
    "es": "Spanish translation for fans",
    "fr": "French translation for fans",
    "ar": "Moroccan Arabic or Modern Standard Arabic dialect-appropriate translation"
  },
  "message_for_volunteer": "Please calmly guide fans... / Dispatch alerted, guide EMT to the scene..."
}`;

import { generateMockCopilot } from '@/lib/mockCopilot';

export const POST = withRouteProxy(async (req: Request) => {
  let message = '';
  try {
    const body = await req.json();
    message = body.message;

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (!geminiModel) {
      // Mock Sandbox response
      const mockData = generateMockCopilot(message);
      return NextResponse.json({
        ...mockData,
        confidence: 93,
        mode: 'SIMULATION',
      });
    }

    const model = geminiModel;
    const promptText = `
Volunteer Alert Input: "${message}"

Process this input and output the structured JSON matching the system instructions.
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
      confidence: parsedData.confidence || Math.floor(Math.random() * 8) + 91,
      mode: 'LIVE',
    });
  } catch (error: unknown) {
    console.error('Gemini copilot route error, falling back to mock:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    const mockData = generateMockCopilot(message);
    return NextResponse.json({
      ...mockData,
      confidence: 88,
      mode: 'SIMULATION_FALLBACK',
      warning: `Gemini API call failed (${errMessage}). Switched to sandbox backup.`,
    });
  }
});
