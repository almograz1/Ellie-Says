// Wrapper for Google Generative AI (Gemini) API
// - Logs the API key prefix for debugging
// - Exports a function to get the Gemini model instance

import { GoogleGenerativeAI } from "@google/generative-ai";

// 👇 add this
console.log(
  "[Gemini] key snippet:",
  process.env.GEMINI_API_KEY?.slice(0, 8) || "undefined"
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Returns a configured Gemini model instance
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.0-pro-latest",
    generationConfig: { temperature: 0.8, maxOutputTokens: 256 },
  });
}
