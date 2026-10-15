import { renderDom } from "../browser.js";
import { fetchText, hostOf, pool, registrableDomain } from "../net.js";
import type { CollectorError, Signal } from "../types.js";

export interface PageCapture {
  url: string;
  status: number;
  kind: string;
}

export interface WebResult {
  signals: Signal[];
  bundleText: string;
  pages: PageCapture[];
  finalUrl?: string;
  errors: CollectorError[];
  /** Links on the page that look like legal/trust pages. */
  legalLinks: string[];
}

const MAX_SCRIPTS = 40;
const MAX_BUNDLE_BYTES = 25_000_000;
const SCRIPT_MAX_BYTES = 3_000_000;

/** Fetch each entry page, record headers/cookies/CSP/resources, then download its JS bundles. */
export async function collectWeb(entryUrls: string[], domain: string): Promise<WebResult> {
  const signals: Signal[] = [];
  const pages: PageCapture[] = [];
  const errors: CollectorError[] = [];
  const scriptUrls = new Set<string>();
  const inlineScripts: string[] = [];
  const legalLinks = new Set<string>();
  let finalUrl: string | undefined;

  for (const entry of entryUrls) {
    let res;
    try {
      res = await fetchText(entry);
    } catch (e) {
      errors.push({ collector: "web", message: `${entry}: ${(e as Error).message}` });
      continue;
    }
    finalUrl ??= res.url;
    let kind = "entry";
    if (res.status === 403 || res.status === 503) {
      const dom = await renderDom(res.url);
      if (dom && !/Just a moment|cf-challenge|Attention Required/i.test(dom.slice(0, 5000))) {
        res = { ...res, text: dom };
        kind = "entry (rendered; static fetch was blocked)";
      } else {
        errors.push({ collector: "web", message: `${res.url}: HTTP ${res.status} (bot protection); try --rea or --url with another page` });
      }
    }
    pages.push({ url: res.url, status: res.status, kind });

    res.headers.forEach((value, name) => {
      signals.push({ source: "header", value: `${name.toLowerCase()}: ${value}`, location: res.url });
    });
    for (const c of res.setCookies) {
      const name = c.split("=")[0]?.trim();
      if (name) signals.push({ source: "cookie", value: name, location: res.url });
    }

    const csp = [res.headers.get("content-security-policy"), ...metaCsp(res.text)].filter(Boolean) as string[];
    for (const policy of csp) {
      for (const h of cspHosts(policy)) signals.push({ source: "csp", value: h, location: res.url });
    }

    signals.push({ source: "html", value: res.text, location: res.url });

    for (const ref of resourceRefs(res.text, res.url)) {
      const h = hostOf(ref.url);
      if (h) signals.push({ source: "resource", value: h, location: ref.url });
      if (ref.kind === "script" && isLikelyFirstPartyJs(ref.url, domain)) scriptUrls.add(ref.url);
    }
    inlineScripts.push(...extractInlineScripts(res.text));

    for (const link of anchorHrefs(res.text, res.url)) {
      const h = hostOf(link);
      if (!h || registrableDomain(h) !== domain) continue;
      if (/sub-?processors?|privacy|trust|security|\/legal|\/dpa|data-processing/i.test(link)) legalLinks.add(link.split("#")[0]);
    }
  }

  const scripts = [...scriptUrls].slice(0, MAX_SCRIPTS);
  let budget = MAX_BUNDLE_BYTES;
  const bodies = await pool(scripts, 8, async (url) => {
    try {
      const r = await fetchText(url, { maxBytes: SCRIPT_MAX_BYTES, accept: "*/*" });
      return r.status < 400 ? r.text : "";
    } catch (e) {
      errors.push({ collector: "bundle", message: `${url}: ${(e as Error).message}` });
      return "";
    }
  });
  const parts: string[] = [...inlineScripts];
  for (const b of bodies) {
    if (budget <= 0) break;
    parts.push(b.slice(0, budget));
    budget -= b.length;
  }
  pages.push(...scripts.map((url) => ({ url, status: 200, kind: "script" })));

  return { signals, bundleText: parts.join("\n;\n"), pages, finalUrl, errors, legalLinks: [...legalLinks] };
}

function metaCsp(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi)) {
    const content = /content=["']([^"']+)["']/i.exec(m[0]);
    if (content) out.push(content[1]);
  }
  return out;
}

export function cspHosts(policy: string): string[] {
  const hosts = new Set<string>();
  for (const directive of policy.split(";")) {
    const [, ...sources] = directive.trim().split(/\s+/);
    for (const s of sources) {
      if (s.startsWith("'") || !/[a-z0-9-]\.[a-z]/i.test(s)) continue;
      const cleaned = s.replace(/^[a-z]+:\/\//i, "").replace(/^\*\./, "").split(/[/:]/)[0];
      if (cleaned) hosts.add(cleaned.toLowerCase());
    }
  }
  return [...hosts];
}

interface ResourceRef {
  url: string;
  kind: "script" | "link" | "frame" | "other";
}

export function resourceRefs(html: string, base: string): ResourceRef[] {
  const refs: ResourceRef[] = [];
  const push = (raw: string | undefined, kind: ResourceRef["kind"]) => {
    if (!raw || raw.startsWith("data:")) return;
    try {
      refs.push({ url: new URL(decodeEntities(raw), base).toString(), kind });
    } catch {
      /* ignore malformed */
    }
  };
  for (const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) push(m[1], "script");
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const href = /\bhref=["']([^"']+)["']/i.exec(tag)?.[1];
    const isScript = /rel=["'](?:modulepreload|preload)["']/i.test(tag) && (/as=["']script["']/i.test(tag) || /modulepreload/i.test(tag));
    push(href, isScript ? "script" : "link");
  }
  for (const m of html.matchAll(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/gi)) push(m[1], "frame");
  return refs;
}

function anchorHrefs(html: string, base: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    try {
      out.push(new URL(decodeEntities(m[1]), base).toString());
    } catch {
      /* ignore */
    }
  }
  return out;
}

function extractInlineScripts(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (m[1].trim()) out.push(m[1]);
  }
  return out;
}

function isLikelyFirstPartyJs(url: string, domain: string): boolean {
  const h = hostOf(url);
  if (!h) return false;
  if (registrableDomain(h) === domain) return true;
  // First-party bundles are often served from a CDN host under a different domain.
  return /\.(cloudfront\.net|vercel\.app|netlify\.app|pages\.dev|webflow\.io|framerusercontent\.com|website-files\.com|b-cdn\.net|azureedge\.net|fastly\.net)$/.test(h) || /\/_next\/|\/_nuxt\/|\/assets\/|\/static\/js\//.test(url);
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&#47;/g, "/");
}
