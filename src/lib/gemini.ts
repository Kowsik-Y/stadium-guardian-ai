import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Singleton Gemini client.
 *
 * Kept as a module-level constant so the SDK is initialised exactly once
 * per Next.js server process. Null when GEMINI_API_KEY is absent, which
 * causes all API routes to transparently fall back to sandbox simulation.
 */
export const geminiClient = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Pre-configured generative model instance.
 *
 * Uses `gemini-1.5-flash` for its balance of response speed and reasoning
 * quality, which is essential for real-time stadium telemetry analysis.
 * Null in sandbox / missing-key mode.
 */
export const geminiModel = geminiClient
  ? geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' })
  : null;

/**
 * Shared helper to call the Gemini API and extract a JSON object.
 */
export async function generateGeminiJson(systemInstruction: string, promptText: string) {
  if (!geminiModel) throw new Error('Gemini API is not initialized.');

  const result = await geminiModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${promptText}` }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const text = result.response.text();
  return JSON.parse(text);
}
