import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality, Part } from '@google/genai';
import crypto from 'crypto';

/* ------------------------------------------------------------------ */
/* 40-word bank (kid-friendly nouns) */
const WORD_BANK = [
  { hebrew: 'סֵפֶר', english: 'book' },
  { hebrew: 'תַּפּוּחַ', english: 'apple' },
  { hebrew: 'כּוֹבַע', english: 'hat' },
  { hebrew: 'דֶּגֶל', english: 'flag' },
  { hebrew: 'בַּלוֹן', english: 'balloon' },
  { hebrew: 'שׁוֹקוֹלָד', english: 'chocolate' },
  { hebrew: 'גֶּשֶׁם', english: 'rain' },
  { hebrew: 'אִישׁ', english: 'man' },
  { hebrew: 'אִשָּׁה', english: 'woman' },
  { hebrew: 'כִּסֵּא', english: 'chair' },
  { hebrew: 'שֻׁלְחָן', english: 'table' },
  { hebrew: 'ירח', english: 'moon' },
  { hebrew: 'שֶׁמֶשׁ', english: 'sun' },
  { hebrew: 'כֶּלֶב', english: 'dog' },
  { hebrew: 'סוּס', english: 'horse' },
  { hebrew: 'דָּג', english: 'fish' },
  { hebrew: 'פָּרָה', english: 'cow' },
  { hebrew: 'חֲזִיר', english: 'pig' },
  { hebrew: 'תּוּת', english: 'strawberry' },
  { hebrew: 'עֵץ', english: 'tree' },
  { hebrew: 'פֶּרַח', english: 'flower' },
  { hebrew: 'אֶפְרוֹחַ', english: 'chick' },
  { hebrew: 'בַּרְוָוז', english: 'duck' },
  { hebrew: 'חִיתּוּל', english: 'diaper' },
  { hebrew: 'סְבִיבוֹן', english: 'dreidel' },
  { hebrew: 'סִפְרִיָּה', english: 'library' },
  { hebrew: 'אִגְרוֹף', english: 'fist' },
  { hebrew: 'פַּח', english: 'trashcan' },
  { hebrew: 'עֵט', english: 'pen' },
  { hebrew: 'עִפְרוֹן', english: 'pencil' },
  { hebrew: 'כּוֹס', english: 'cup' },
  { hebrew: 'בַּקְבּוּק', english: 'bottle' },
  { hebrew: 'שָׁעוֹן', english: 'clock' },
  { hebrew: 'מַטֶּה', english: 'stick' },
  { hebrew: 'כַּדוּר', english: 'ball' },
  { hebrew: 'מַחְשֵׁב', english: 'computer' },
  { hebrew: 'עַמּוּד', english: 'pillar' },
  { hebrew: 'כּוֹכָב', english: 'star' },
  { hebrew: 'דֶּלֶת', english: 'door' }
];

/* remember words already used this session */
let used = new Set<string>();

/* helpers ------------------------------------------------------------ */
const ABC = 'אבגדהוזחטייקלמנסעפצקרשת'.split('');
const shuffle = <T,>(a: T[]) => [...a].sort(() => 0.5 - Math.random());
const stripNikud = (s: string) => s.replace(/[\u0591-\u05C7]/g, '');
const consonants = (s: string) => stripNikud(s).split('');

/* ------------------------------------------------------------------ */
export async function GET() {
  /* pick a random unused word */
  if (used.size === WORD_BANK.length) used.clear();
  let pick;
  do { pick = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]; }
  while (used.has(pick.hebrew));
  used.add(pick.hebrew);

  const { hebrew, english } = pick;

  /* generate image -------------------------------------------------- */
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  let imageUrl = '';
  try {
    const img = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: `Accurate cartoon illustration of a ${english} on a plain background, no text`,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] }
    });
    const part = img.candidates?.[0]?.content?.parts?.find(
      (p: Part) => (p as any).inlineData
    ) as { inlineData?: { data: string } } | undefined;

    if (part?.inlineData?.data) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch { /* ignore */ }

  /* Unsplash fallback */
  if (!imageUrl) {
    const sig = Date.now().toString(36) + Math.random().toString(36).slice(2);
    imageUrl =
      `https://source.unsplash.com/400x400/?${encodeURIComponent(english)},kids&sig=${sig}`;
  }

  /* build pool: keep duplicates! ------------------------------------ */
  const letters = consonants(hebrew);                   // duplicates preserved
  const extras = shuffle(
    ABC.filter(ch => !new Set(letters).has(ch))
  ).slice(0, 2);
  const pool = shuffle([...letters, ...extras]);

  return NextResponse.json({ imageUrl, hebrew, pool });
}
