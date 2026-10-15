import { collectDns } from "./collectors/dns.js";
import { collectLegal } from "./collectors/legal.js";
import { collectRea } from "./collectors/rea.js";
import { collectStatus } from "./collectors/status.js";
import { collectWeb } from "./collectors/web.js";
import { analyze } from "./engine.js";
import { normalizeTarget } from "./net.js";
import { loadSignatures } from "./signatures.js";
import type { Report, Scan, Signature } from "./types.js";

/** Origins REA should retain even if the passive scan never saw them referenced. */
const AI_API_HOSTS = [
  "api.openai.com",
  "api.anthropic.com",
  "generativelanguage.googleapis.com",
  "api.mistral.ai",
  "api.cohere.com",
  "api.groq.com",
  "api.x.ai",
  "api.deepseek.com",
  "api.together.xyz",
  "api.fireworks.ai",
  "openrouter.ai",
  "api.perplexity.ai",
  "api.elevenlabs.io",
  "api.deepgram.com",
  "api.assemblyai.com",
  "api.cartesia.ai",
  "api.replicate.com",
  "queue.fal.run",
  "fal.run",
  "ai-gateway.vercel.sh",
];

export interface ScanOptions {
  /** Drive a headless browser through REA for live network evidence. */
  rea?: boolean;
  /** Extra URLs to fetch (e.g. the app subdomain or a pricing page). */
  extraUrls?: string[];
  /** Skip subprocessor / privacy / trust page discovery. */
  skipLegal?: boolean;
  signatures?: Signature[];
  onProgress?: (step: string) => void;
}

export async function scan(target: string, opts: ScanOptions = {}): Promise<Scan> {
  const progress = opts.onProgress ?? (() => {});
  const { url, domain } = normalizeTarget(target);
  const origin = new URL(url).origin;
  const result: Scan = { target, domain, scannedAt: new Date().toISOString(), signals: [], bundleText: "", pages: [], errors: [] };

  progress(`dns ${domain}`);
  const dns = await collectDns(domain);
  result.signals.push(...dns.signals);

  const entries = [url];
  for (const sub of ["app", "chat"]) {
    const host = `${sub}.${domain}`;
    if (dns.liveSubdomains.includes(host) && !url.includes(`//${host}`)) entries.push(`https://${host}/`);
  }
  entries.push(...(opts.extraUrls ?? []));

  progress(`web ${entries.join(", ")}`);
  const web = await collectWeb(entries, domain);
  result.signals.push(...web.signals);
  result.pages.push(...web.pages);
  result.errors.push(...web.errors);
  result.finalUrl = web.finalUrl;
  const bundles = [web.bundleText];

  const tasks: Promise<void>[] = [];
  if (!opts.skipLegal) {
    tasks.push(
      (async () => {
        progress("legal pages");
        const legal = await collectLegal(web.finalUrl ? new URL(web.finalUrl).origin : origin, domain, web.legalLinks, dns.liveSubdomains);
        result.signals.push(...legal.signals);
        result.pages.push(...legal.pages);
        result.errors.push(...legal.errors);
      })(),
    );
  }
  tasks.push(
    (async () => {
      const status = await collectStatus(domain, dns.liveSubdomains);
      result.signals.push(...status.signals);
      result.pages.push(...status.pages);
      result.errors.push(...status.errors);
    })(),
  );
  if (opts.rea) {
    tasks.push(
      (async () => {
        progress("rea deep observation");
        const candidateHosts = [
          ...new Set([...result.signals.filter((s) => s.source === "csp" || s.source === "resource").map((s) => s.value), ...AI_API_HOSTS]),
        ].filter((h) => /^[a-z0-9.-]+$/.test(h));
        const rea = await collectRea(web.finalUrl ?? url, { candidateHosts });
        result.signals.push(...rea.signals);
        result.errors.push(...rea.errors);
        bundles.push(rea.bundleText);
        for (const id of rea.evidenceIds) result.pages.push({ url: `rea:${id}`, status: 0, kind: "rea-evidence" });
      })(),
    );
  }
  await Promise.all(tasks);

  result.bundleText = bundles.filter(Boolean).join("\n;\n");
  return result;
}

export async function xray(target: string, opts: ScanOptions = {}): Promise<Report> {
  const signatures = opts.signatures ?? loadSignatures();
  const s = await scan(target, opts);
  return analyze(s, signatures);
}
