// src/app/api/trivia-round/route.ts
import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";   // ✅ centralised helper
import { safeJson } from "@/lib/utils";          // adjust path if needed

// ---- optional fallback --------------------------------
import fallback from "@/data/triviaFallback.json";
function getFallback() {
  const rnd = fallback[Math.floor(Math.random() * fallback.length)];
  return rnd;
}
// -------------------------------------------------------

export async function GET() {
  const topics = ["animals", "food", "school", "emotions", "colors", "family", "weather"];
const randomTopic = topics[Math.floor(Math.random() * topics.length)];

const prompt = `
Return ONLY raw JSON — no markdown, no text, no triple back-ticks — with this exact shape:
{
  "hebrewWord": "...",                         // Hebrew noun with nikud
  "transliteration": "...",                    // Transliteration of the Hebrew word into English
  "options": ["...", "...", "...", "..."],     // 4 English words(without nikud)
  "correctIndex": 0,                           // 0-3 (index of correct option)
  "clueSentence": "...",                       // Hebrew sentence using the word
  "clueEmoji": "😃"
}

Give a different Hebrew word each time related to this topic: "${randomTopic}".
Include a sentence that makes sense and an emoji that fits.
Do NOT reuse words from earlier.
the english word shouldn't have nikud.
Prompt freshness: ${Date.now()}
`.trim();


  const model = getGeminiModel();

  try {
    // -- new SDK → GenerateContentResponse
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    const data = safeJson<{
      hebrewWord: string;
      transliteration?: string;
      options: string[];
      correctIndex: number;
      clueSentence: string;
      clueEmoji: string;
    }>(text);

    // quick sanity checks
    if (
      !data ||
      !Array.isArray(data.options) ||
      data.options.length !== 4 ||
      data.correctIndex < 0 ||
      data.correctIndex > 3
    ) {
      throw new Error("Bad JSON");
    }

    data.hebrewWord = `${data.hebrewWord} (${data.transliteration})`;
    delete data['transliteration'];

    return NextResponse.json(data);      // success 🎉
  } catch (err) {
    console.warn("Gemini failed, using fallback:", err);
    return NextResponse.json(getFallback()); // graceful degrade
  }
}
