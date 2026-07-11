import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const geminiClient = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
export const geminiModel = geminiClient
  ? geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' })
  : null;
