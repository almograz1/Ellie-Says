export function safeJson<T = unknown>(raw: string): T | null {
  if (!raw) return null;
  // remove ```json … ``` or ``` … ``` wrappers
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try   { return JSON.parse(cleaned) as T; }
  catch { return null; }        // caller handles “Bad JSON”
}
