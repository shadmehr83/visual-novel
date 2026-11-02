import { z } from "zod";
// Studio search with Claude (by Claude): in the local studio, Claude Code on this computer reads a
// misspelled or described request and picks matching features from the search catalogue.
// It only ranks existing entries; opening a result is the normal search behaviour.
export const aiSearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(300),
  items: z.array(z.object({ id: z.string().max(200), title: z.string().max(200), description: z.string().max(200) })).min(1).max(600),
});
export type AiSearchRequest = z.infer<typeof aiSearchRequestSchema>;
export const aiSearchResultSchema = z.object({ ids: z.array(z.string()).max(8), note: z.string().max(300).default("") });
export const aiSearchSystem = `You help an author find features in Stillframe, a visual novel studio. The request may be misspelled, vague, or describe what they want to do instead of naming it.
From the given list, pick up to 8 entries that best answer the request, best first. Use only ids from the list; never invent one. If nothing fits, return an empty list.
Write "note" as one short, friendly sentence saying what you understood (e.g. "Looks like you mean the rain on the window glass.").
Return ONLY JSON {"ids": string[], "note": string}.`;
export function aiSearchPrompt(b: AiSearchRequest) {
  return [`Request: ${b.query}`, "Studio entries (id · title · description):", ...b.items.map((i) => `${i.id} · ${i.title} · ${i.description}`)].join("\n");
}

const key = "stillframe-ai-search";
export function aiSearchEnabled() {
  try { return localStorage.getItem(key) !== "off"; } catch { return true; }
}
export function setAiSearchEnabled(on: boolean) {
  try { localStorage.setItem(key, on ? "on" : "off"); } catch { /* this page only */ }
}
// Claude Code runs only in the local studio (npm run dev).
export const aiSearchAvailable = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
export async function askSearch(query: string, items: { id: string; title: string; description: string }[], signal?: AbortSignal) {
  const body: AiSearchRequest = {
    query,
    items: items.slice(0, 600).map((i) => ({ id: i.id.slice(0, 200), title: i.title.slice(0, 200), description: (i.description || "").slice(0, 120) })),
  };
  const r = await fetch("/api/claude-local/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal });
  const result = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(result.error || "Claude could not search right now.");
  const parsed = aiSearchResultSchema.parse(result);
  return { ...parsed, ids: parsed.ids.filter((id) => body.items.some((i) => i.id === id)) };
}
