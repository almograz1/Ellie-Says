// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 👇 add this
console.log(
  "[Gemini] key snippet:",
  process.env.GEMINI_API_KEY?.slice(0, 8) || "undefined"
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.0-pro-latest",
    generationConfig: { temperature: 0.8, maxOutputTokens: 256 },
  });
}
