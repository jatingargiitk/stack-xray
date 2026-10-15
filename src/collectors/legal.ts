import { renderDom } from "../browser.js";
import { fetchText, hostOf, pool, registrableDomain } from "../net.js";
import type { CollectorError, Signal } from "../types.js";

const WELL_KNOWN = [
  "/subprocessors",
  "/sub-processors",
  "/legal/subprocessors",
  "/legal/sub-processors",
  "/legal/subprocessor",
  "/trust/subprocessors",
  "/security/subprocessors",
  "/privacy",
  "/privacy-policy",
  "/legal/privacy",
  "/legal/privacy-policy",
  "/security",
];

const MAX_PAGES = 10;
const MAX_RENDERS = 3;

/**
 * Subprocessor lists, privacy policies and trust centers are where companies are legally
 * required to name the vendors that process customer data, including LLM providers.
 */
export async function collectLegal(
  origin: string,
  domain: string,
  discovered: string[],
  liveSubdomains: string[],
): Promise<{ signals: Signal[]; pages: { url: string; kind: string; status: number }[]; errors: CollectorError[] }> {
  const ranked = [
    ...discovered.filter((u) => /sub-?processor/i.test(u)),
    ...WELL_KNOWN.slice(0, 7).map((p) => origin + p),
    ...(liveSubdomains.includes(`trust.${domain}`) ? [`https://trust.${domain}/`, `https://trust.${domain}/subprocessors`] : []),
    ...discovered.filter((u) => !/sub-?processor/i.test(u)),
    ...WELL_KNOWN.slice(7).map((p) => origin + p),
  ];
  const candidates = [...new Set(ranked)].slice(0, MAX_PAGES * 2);

  const signals: Signal[] = [];
  const pages: { url: string; kind: string; status: number }[] = [];
  const errors: CollectorError[] = [];
  const seenFinal = new Set<string>();
  let kept = 0;
  let renders = 0;

  await pool(candidates, 6, async (url) => {
    if (kept >= MAX_PAGES) return;
    try {
      const r = await fetchText(url, { timeoutMs: 12000 });
      const finalHost = hostOf(r.url);
      if (r.status >= 400 || !finalHost || registrableDomain(finalHost) !== domain) return;
      const path = new URL(r.url).pathname;
      if (path === "/" && !finalHost.startsWith("trust.")) return;
      if (seenFinal.has(r.url)) return;
      seenFinal.add(r.url);
      kept++;
      const isTrust = finalHost.startsWith("trust.");
      const isSubprocessors = /sub-?processor/i.test(r.url);
      let text = htmlToText(r.text, { keepScripts: isTrust });
      let kind = isSubprocessors ? "subprocessors" : isTrust ? "trust" : "legal";
      if ((isTrust || isSubprocessors || text.length < 1500) && renders < MAX_RENDERS) {
        renders++;
        const dom = await renderDom(r.url);
        if (dom) {
          text = htmlToText(dom) + " " + text;
          kind += " (rendered)";
        }
      }
      pages.push({ url: r.url, status: r.status, kind });
      const listsVendors = isSubprocessors || (isTrust && /sub-?processor/i.test(text));
      signals.push({ source: listsVendors ? "subprocessors" : "legal", value: text, location: r.url });
    } catch (e) {
      errors.push({ collector: "legal", message: `${url}: ${(e as Error).message}` });
    }
  });

  return { signals, pages, errors };
}

export function htmlToText(html: string, opts: { keepScripts?: boolean } = {}): string {
  let s = html;
  if (!opts.keepScripts) s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
