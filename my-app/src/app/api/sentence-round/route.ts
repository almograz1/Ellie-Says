import { NextResponse } from 'next/server';
import { model, safeJson } from '@/lib/genai';

/* ---- fallback list ---------------------------------- */
import fallbackData from '@/data/sentenceData.json'; // adjust if path differs
function getFallback() {
  const entry = fallbackData[Math.floor(Math.random()*fallbackData.length)];
  return {
    sentenceTemplate: entry.sentence,
    missingWords: entry.missingWords,
    distractors: entry.distractors
  };
}
/* ----------------------------------------------------- */

export async function GET() {
  const prompt = `
Return ONLY valid JSON with this shape:
{
 "sentenceTemplate": "אני ___ הולך ___ כי אני ___",  // exactly 3 "___"
 "missingWords": ["צריך","מחר","עייף"],             // 3 words filling the blanks
 "distractors": ["שמח","אוכל","גדול"]              // 3-4 unrelated words
}
Rules:
* The sentenceTemplate must contain exactly three "___" placeholders.
* The missingWords array must supply the correct words in order.
* All Hebrew words must include nikud and match sentence grammar.
`;

  try {
    const { text } = await model.generateContent(prompt);
    const data = safeJson<{
      sentenceTemplate:string;
      missingWords:string[];
      distractors:string[];
    }>(text);

    if (
      !data ||
      data.missingWords.length !== 3 ||
      !data.sentenceTemplate.includes('___')
    ) throw new Error('Bad JSON');

    return NextResponse.json(data);
  } catch (err) {
    console.warn('Gemini failed, using fallback:', err);
    return NextResponse.json(getFallback());
  }
}
