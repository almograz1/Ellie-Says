import { getGeminiModel } from "@/lib/gemini";
import { safeJson }       from "../../lib/utils";   // or your preferred path

export async function GET() {
  const model  = getGeminiModel();
  const prompt = "…";

  const result = await model.generateContent(prompt);
  const text   = result.response.text();
  const data   = safeJson(text);

  return NextResponse.json(data);
}
