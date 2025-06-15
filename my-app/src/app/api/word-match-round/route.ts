// src/app/api/word-match-round/route.ts
import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";   // ✅ centralised helper
import { safeJson } from "@/lib/utils";           // (unchanged)

// --- optional fallback if Gemini fails -----------------
import fallbackPairs from "@/data/wordData.json";
function getFallback() {
  // shuffle so users don’t always see the same order
  return [...fallbackPairs].sort(() => 0.5 - Math.random()).slice(0, 4);
}
// -------------------------------------------------------

export async function GET() {
  // If you track “already-used” pairs per session, build an exclude list here.
  const exclude: string[] = [];

  const topics = ["kitchen", "animals", "nature", "school", "emotions", "technology", "clothing"];
const randomTopic = topics[Math.floor(Math.random() * topics.length)];

const prompt = `
Return ONLY raw JSON — no markdown, no back-ticks, no explanations.

[
  { "hebrew": "...", "english": "..." },
  { "hebrew": "...", "english": "..." },
  { "hebrew": "...", "english": "..." },
  { "hebrew": "...", "english": "..." }
]

Rules:
* Exactly 4 objects in the array.
* All words must relate to this topic: "${randomTopic}".
* "hebrew" words must include נִקּוּד and be common nouns.
* Provide the correct English translation in each "english" field.
* Do NOT wrap the JSON in any markup or text.

Uniqueness: ${Date.now()}
`.trim();



  const model = getGeminiModel();

  try {
    // -- new SDK returns a GenerateContentResponse object
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    const data = safeJson<{ hebrew: string; english: string }[]>(text);
    if (!data || data.length !== 4) throw new Error("bad JSON");

    return NextResponse.json(data);        // success 🎉
  } catch (err) {
    console.warn("Gemini failed, using fallback:", err);
    return NextResponse.json(getFallback()); // never crash the game
  }
}
