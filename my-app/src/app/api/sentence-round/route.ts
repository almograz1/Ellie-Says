// src/app/api/sentence-round/route.ts
import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";   // ✅ central model helper
import { safeJson } from "@/lib/utils";            // adjust path if you kept it elsewhere

/* ---- fallback list ---------------------------------- */
import fallbackData from "@/data/sentenceData.json";
function getFallback() {
  const entry = fallbackData[Math.floor(Math.random() * fallbackData.length)];
  return {
    sentenceTemplate: entry.sentence,
    missingWords: entry.missingWords,
    distractors: entry.distractors,
  };
}
/* ----------------------------------------------------- */

export async function GET() {
  const topics = ["school", "family", "food", "weather", "transportation", "feelings", "work"];
const topic = topics[Math.floor(Math.random() * topics.length)];

const prompt = `
Return ONLY raw JSON — no markdown, no back-ticks, no explanations.

{
  "sentenceTemplate": "אני ___ הולך ___ כי אני ___",   // exactly three "___"
  "missingWords": ["צריך","מחר","עייף"],              // 3 words, in order
  "distractors": ["שמח","אוכל","גדול"]               // 3–4 unrelated words
}

Rules:
* All content must relate to this topic: "${topic}".
* "sentenceTemplate" must contain exactly three "___" placeholders.
* "missingWords" provides the correct words in the correct order.
* All Hebrew words must include נִקּוּד and match grammatically.
* Provide 3–4 plausible but wrong distractors.
* Do NOT add any prose or code-fences around the JSON.

Uniqueness: ${Date.now()}
`.trim();

  const model = getGeminiModel();

  try {
    // -- new SDK returns GenerateContentResponse
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    const data = safeJson<{
      sentenceTemplate: string;
      missingWords: string[];
      distractors: string[];
    }>(text);

    // quick sanity checks
    if (
      !data ||
      data.missingWords.length !== 3 ||
      !data.sentenceTemplate.includes("___")
    ) {
      throw new Error("Bad JSON");
    }

    return NextResponse.json(data);      // success 🎉
  } catch (err) {
    console.warn("Gemini failed, using fallback:", err);
    return NextResponse.json(getFallback()); // graceful degrade
  }
}
