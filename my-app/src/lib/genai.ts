// lib/genai.ts
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

// Pick the text-only model; change the name later if Google bumps versions.
export const model = genAI.getGenerativeModel({
  model: 'gemini-pro',               // or 'gemini-2.5-pro'
  generationConfig: {
    responseMimeType: 'application/json', // forces JSON-only output
  },
});

/**
 * Best-effort JSON parser. Returns null on malformed JSON.
 */
export function safeJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
