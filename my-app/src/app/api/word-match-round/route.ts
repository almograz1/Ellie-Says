import { NextResponse } from 'next/server';
import { model, safeJson } from '@/lib/genai';          // helper we added earlier

// --- optional fallback if Gemini fails -----------------
import fallbackPairs from '@/data/wordData.json';      // keep your old JSON, or change path
function getFallback() {
  // shuffle so users don’t always see the same order
  return [...fallbackPairs].sort(() => 0.5 - Math.random()).slice(0, 4);
}
// -------------------------------------------------------

export async function GET() {
  // if you track “already-used” pairs per session, build an exclude list here:
  const exclude: string[] = [];

  const prompt = `
    Return ONLY JSON: an array of 4 objects { "hebrew": "...", "english": "..." }.
    Hebrew words must include nikud. Avoid these words: ${exclude.join(', ')}.
  `;

  try {
    const { text } = await model.generateContent(prompt);
    const data = safeJson<{ hebrew: string; english: string }[]>(text);

    if (!data || data.length !== 4) throw new Error('bad JSON');

    return NextResponse.json(data);          // success 🎉
  } catch (err) {
    console.warn('Gemini failed, using fallback:', err);
    return NextResponse.json(getFallback()); // never crash the game
  }
}
