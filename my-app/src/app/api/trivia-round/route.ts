import { NextResponse } from 'next/server';
import { model, safeJson } from '@/lib/genai';

// ---- optional fallback --------------------------------
import fallback from '@/data/triviaFallback.json';   // adjust path / filename
function getFallback() {
  const rnd = fallback[Math.floor(Math.random() * fallback.length)];
  return rnd;
}
// -------------------------------------------------------

export async function GET() {
  const prompt = `
Return ONLY valid JSON with this shape:
{
 "hebrewWord": "...",          // Hebrew noun with nikud
 "options": ["...", "...", "...", "..."], // 4 English words
 "correctIndex": 0,            // 0-3
 "clueSentence": "...",        // Hebrew sentence using the word
 "clueEmoji": "😃"
}
The options array must include exactly one correct translation for the hebrewWord (at index 'correctIndex') and three unrelated distractors.
All Hebrew text must include nikud.
`;

  try {
    const { text } = await model.generateContent(prompt);
    const data = safeJson<{
      hebrewWord: string;
      options: string[];
      correctIndex: number;
      clueSentence: string;
      clueEmoji: string;
    }>(text);

    if (
      !data ||
      !Array.isArray(data.options) ||
      data.options.length !== 4 ||
      data.correctIndex < 0 ||
      data.correctIndex > 3
    ) {
      throw new Error('Bad JSON');
    }
    return NextResponse.json(data);
  } catch (err) {
    console.warn('Gemini failed, using fallback:', err);
    return NextResponse.json(getFallback());
  }
}
