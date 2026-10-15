import type { Evidence, EvidenceTier, Finding, Report, Scan, Signal, SignalSource, Signature } from "./types.js";

export const TIER_WEIGHT: Record<EvidenceTier, number> = {
  observed: 0.95,
  infra: 0.9,
  declared: 0.85,
  bundle: 0.7,
  config: 0.6,
  mention: 0.45,
  account: 0.35,
};

export const TIER_ORDER: EvidenceTier[] = ["observed", "infra", "declared", "bundle", "config", "mention", "account"];

export const TIER_LABEL: Record<EvidenceTier, string> = {
  observed: "seen in live traffic / loaded resources",
  infra: "DNS or HTTP infrastructure",
  declared: "named on subprocessor, trust or status page",
  bundle: "referenced in shipped JavaScript",
  config: "allowed by Content-Security-Policy",
  mention: "mentioned on a privacy / security page",
  account: "domain-verified account only (may be internal use)",
};

const MAX_EVIDENCE_PER_FINDING = 8;
const MAX_MODELS = 30;

export function analyze(scan: Scan, signatures: Signature[]): Report {
  const bySource = groupBySource(scan.signals);
  const findings: Finding[] = [];

  for (const sig of signatures) {
    if (isSelf(sig, scan.domain)) continue;
    const evidence: Evidence[] = [];
    const add = (e: Evidence) => {
      if (!evidence.some((x) => x.source === e.source && x.pattern === e.pattern && x.matched === e.matched)) evidence.push(e);
    };
    const m = sig.match;

    for (const p of m.dnsTxt ?? []) {
      for (const s of matchSignals(bySource["dns-txt"], p)) {
        add({ tier: /^v=spf1/i.test(s.signal.value) ? "infra" : "account", source: "dns-txt", pattern: p, matched: s.signal.value, location: s.signal.location });
      }
    }
    for (const [key, source] of [["cname", "dns-cname"], ["ns", "dns-ns"], ["mx", "dns-mx"], ["headers", "header"], ["cookies", "cookie"]] as const) {
      for (const p of m[key] ?? []) {
        for (const s of matchSignals(bySource[source], p)) add({ tier: "infra", source, pattern: p, matched: s.signal.value, location: s.signal.location });
      }
    }
    for (const p of m.html ?? []) {
      for (const s of matchSignals(bySource.html, p)) add({ tier: "observed", source: "html", pattern: p, matched: s.snippet, location: s.signal.location });
    }
    for (const p of m.hosts ?? []) {
      for (const source of ["runtime", "resource"] as const) {
        for (const s of matchSignals(bySource[source], p)) add({ tier: "observed", source, pattern: p, matched: s.signal.value, location: s.signal.location });
      }
      for (const s of matchSignals(bySource.csp, p)) add({ tier: "config", source: "csp", pattern: p, matched: s.signal.value, location: s.signal.location });
      const hit = firstMatch(scan.bundleText, p);
      if (hit) add({ tier: "bundle", source: "bundle", pattern: p, matched: hit, location: "javascript bundles" });
    }
    for (const p of m.js ?? []) {
      const hit = firstMatch(scan.bundleText, p, "");
      if (hit) add({ tier: "bundle", source: "bundle", pattern: p, matched: hit, location: "javascript bundles" });
    }
    for (const p of m.text ?? []) {
      for (const source of ["subprocessors", "status", "legal"] as const) {
        const tier = source === "legal" ? "mention" : "declared";
        for (const s of matchSignals(bySource[source], p, "")) add({ tier, source, pattern: p, matched: s.snippet, location: s.signal.location });
      }
    }

    const models = extractModels(scan.bundleText, sig.models ?? []);
    if (models.length) add({ tier: "bundle", source: "bundle", pattern: "models", matched: models.slice(0, 6).join(", "), location: "javascript bundles" });

    if (!evidence.length) continue;
    evidence.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
    findings.push({
      id: sig.id,
      name: sig.name,
      category: sig.category,
      website: sig.website,
      confidence: combine(evidence),
      tier: evidence[0].tier,
      evidence: evidence.slice(0, MAX_EVIDENCE_PER_FINDING),
      models,
      note: sig.note,
    });
  }

  findings.sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name));
  return {
    target: scan.target,
    domain: scan.domain,
    finalUrl: scan.finalUrl,
    scannedAt: scan.scannedAt,
    findings,
    pages: scan.pages,
    errors: scan.errors,
    stats: { signals: scan.signals.length, bundleBytes: scan.bundleText.length },
  };
}

/** Independent-evidence combination: 1 - Π(1 - w), counting each tier once. */
function combine(evidence: Evidence[]): number {
  const tiers = new Set(evidence.map((e) => e.tier));
  let miss = 1;
  for (const t of tiers) miss *= 1 - TIER_WEIGHT[t];
  return Math.round(Math.min(0.99, 1 - miss) * 100) / 100;
}

function groupBySource(signals: Signal[]): Record<SignalSource, Signal[]> {
  const out = {} as Record<SignalSource, Signal[]>;
  for (const s of signals) (out[s.source] ??= []).push(s);
  return out;
}

const regexCache = new Map<string, RegExp>();
function re(pattern: string, flags = "i"): RegExp {
  const key = flags + pattern;
  let r = regexCache.get(key);
  if (!r) regexCache.set(key, (r = new RegExp(pattern, flags)));
  return r;
}

function matchSignals(signals: Signal[] | undefined, pattern: string, flags = "i"): { signal: Signal; snippet: string }[] {
  if (!signals) return [];
  const r = re(pattern, flags);
  const out: { signal: Signal; snippet: string }[] = [];
  for (const signal of signals) {
    const m = r.exec(signal.value);
    if (m) out.push({ signal, snippet: snippet(signal.value, m.index, m[0].length) });
  }
  return out;
}

function firstMatch(text: string, pattern: string, flags = "i"): string | undefined {
  if (!text) return undefined;
  const m = re(pattern, flags).exec(text);
  return m ? snippet(text, m.index, m[0].length) : undefined;
}

function snippet(text: string, index: number, len: number, pad = 50): string {
  if (text.length <= len + pad * 2) return text.trim();
  const start = Math.max(0, index - pad);
  const end = Math.min(text.length, index + len + pad);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}

function extractModels(text: string, patterns: string[]): string[] {
  if (!text || !patterns.length) return [];
  const found = new Set<string>();
  for (const p of patterns) {
    for (const m of text.matchAll(re(p, "g"))) {
      const id = (m[1] ?? m[0]).toLowerCase();
      if (/\.(?:png|jpe?g|svg|webp|gif|mp4|webm|json|js|css|html?)$/.test(id)) continue;
      found.add(id);
      if (found.size >= MAX_MODELS) break;
    }
  }
  return [...found].sort();
}

/** Don't report a company as its own vendor (ElevenLabs on elevenlabs.io). */
function isSelf(sig: Signature, domain: string): boolean {
  if (!sig.website) return false;
  try {
    const host = new URL(sig.website).hostname.replace(/^www\./, "");
    return host === domain || host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}
