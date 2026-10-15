import { fetchText } from "../net.js";
import type { CollectorError, Signal } from "../types.js";
import { htmlToText } from "./legal.js";

/**
 * Public status pages often list upstream dependencies as components
 * ("OpenAI API", "Anthropic", "Supabase") so customers can see third-party outages.
 */
export async function collectStatus(
  domain: string,
  liveSubdomains: string[],
): Promise<{ signals: Signal[]; pages: { url: string; kind: string; status: number }[]; errors: CollectorError[] }> {
  const signals: Signal[] = [];
  const pages: { url: string; kind: string; status: number }[] = [];
  const errors: CollectorError[] = [];
  const host = `status.${domain}`;
  if (!liveSubdomains.includes(host)) return { signals, pages, errors };

  try {
    const r = await fetchText(`https://${host}/api/v2/components.json`, { accept: "application/json", timeoutMs: 10000 });
    if (r.status < 400 && r.text.trim().startsWith("{")) {
      const data = JSON.parse(r.text) as { components?: { name: string; description?: string | null }[] };
      const names = (data.components ?? []).map((c) => [c.name, c.description].filter(Boolean).join(" — "));
      if (names.length) {
        signals.push({ source: "status", value: names.join("\n"), location: r.url });
        pages.push({ url: r.url, status: r.status, kind: "status" });
        return { signals, pages, errors };
      }
    }
  } catch (e) {
    errors.push({ collector: "status", message: (e as Error).message });
  }

  try {
    const r = await fetchText(`https://${host}/`, { timeoutMs: 10000 });
    if (r.status < 400) {
      signals.push({ source: "status", value: htmlToText(r.text, { keepScripts: true }).slice(0, 200_000), location: r.url });
      pages.push({ url: r.url, status: r.status, kind: "status" });
    }
  } catch (e) {
    errors.push({ collector: "status", message: (e as Error).message });
  }
  return { signals, pages, errors };
}
