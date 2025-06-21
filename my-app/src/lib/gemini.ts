// Gemini API wrapper for Google Generative AI
// - Exports a function to get a configured Gemini model instance

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Returns a Gemini model instance (model name can be changed as needed)
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    // use ANY model name you saw in the curl list
    model: "models/gemini-1.5-flash-latest",
    generationConfig: { temperature: 0.8, maxOutputTokens: 256 },
  });
}
