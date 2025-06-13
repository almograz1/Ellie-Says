// src/lib/genai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

/* 1.  Create the client */
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENAI_API_KEY!   // .env.local
);

/* 2.  Pick a v1 model and generation settings */
export const model = genAI.getGenerativeModel({
  model: 'gemini-pro',                     // ← works on v1beta
  generationConfig: {
    responseMimeType: 'application/json'
  }
});


/* 3.  Helper to parse JSON safely */
export function safeJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
