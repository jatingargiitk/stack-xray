import assert from "node:assert/strict";
import { test } from "node:test";
import { cspHosts, resourceRefs } from "../src/collectors/web.js";
import { analyze } from "../src/engine.js";
import { toMermaid } from "../src/render/mermaid.js";
import { loadSignatures, validateSignatures } from "../src/signatures.js";
import type { Scan, Signal } from "../src/types.js";

const signatures = loadSignatures();

function scanWith(signals: Signal[], bundleText = "", domain = "example.ai"): Scan {
  return { target: domain, domain, scannedAt: "2026-01-01T00:00:00Z", signals, bundleText, pages: [], errors: [] };
}

const find = (report: ReturnType<typeof analyze>, id: string) => report.findings.find((f) => f.id === id);

test("bundled signatures are valid", () => {
  assert.deepEqual(validateSignatures(signatures), []);
  assert.ok(signatures.length > 150);
});

test("DNS verification TXT is account-tier only", () => {
  const r = analyze(scanWith([{ source: "dns-txt", value: "anthropic-domain-verification-abc123=xyz", location: "example.ai" }]), signatures);
  const f = find(r, "anthropic");
  assert.equal(f?.tier, "account");
  assert.ok(f!.confidence < 0.5);
});

test("subprocessor listing outranks DNS account and combines confidence", () => {
  const r = analyze(
    scanWith([
      { source: "dns-txt", value: "openai-domain-verification=dv-1", location: "example.ai" },
      { source: "subprocessors", value: "Subprocessors: OpenAI, L.L.C. — LLM inference — US", location: "https://example.ai/subprocessors" },
    ]),
    signatures,
  );
  const f = find(r, "openai")!;
  assert.equal(f.tier, "declared");
  assert.ok(f.confidence > 0.85);
});

test("generic legal page mentions are weaker than subprocessor lists", () => {
  const r = analyze(scanWith([{ source: "legal", value: "We support SSO providers including Okta and Google.", location: "https://example.ai/security" }]), signatures);
  assert.equal(find(r, "okta")?.tier, "mention");
});

test("text matching is case-sensitive (Cohere the vendor, not 'cohere' the verb)", () => {
  const verb = analyze(scanWith([{ source: "subprocessors", value: "our policies cohere with GDPR", location: "x" }]), signatures);
  assert.equal(find(verb, "cohere"), undefined);
  const vendor = analyze(scanWith([{ source: "subprocessors", value: "Cohere Inc. — embeddings", location: "x" }]), signatures);
  assert.ok(find(vendor, "cohere"));
});

test("Groq and Grok are not confused", () => {
  const r = analyze(scanWith([{ source: "subprocessors", value: "We use Grok for summaries", location: "x" }]), signatures);
  assert.equal(find(r, "groq"), undefined);
});

test("live runtime host is observed tier; CSP-only is config tier", () => {
  const r = analyze(
    scanWith([
      { source: "runtime", value: "api.anthropic.com", location: "https://api.anthropic.com/v1/messages" },
      { source: "csp", value: "api.openai.com", location: "https://example.ai" },
    ]),
    signatures,
  );
  assert.equal(find(r, "anthropic")?.tier, "observed");
  assert.equal(find(r, "openai")?.tier, "config");
});

test("model ids are extracted from bundles, filenames are not", () => {
  const bundle = `const models=["gpt-4o","claude-sonnet-4-5","gemini-2.5-pro"];img="/grok-4-benchmarks.png";`;
  const r = analyze(scanWith([], bundle), signatures);
  assert.deepEqual(find(r, "openai")?.models, ["gpt-4o"]);
  assert.deepEqual(find(r, "anthropic")?.models, ["claude-sonnet-4-5"]);
  assert.deepEqual(find(r, "google-gemini")?.models, ["gemini-2.5-pro"]);
  assert.equal(find(r, "xai"), undefined);
});

test("a company is never reported as its own vendor", () => {
  const r = analyze(scanWith([{ source: "subprocessors", value: "ElevenLabs Inc. and OpenAI", location: "x" }], "", "elevenlabs.io"), signatures);
  assert.equal(find(r, "elevenlabs"), undefined);
  assert.ok(find(r, "openai"));
});

test("infrastructure headers and DNS", () => {
  const r = analyze(
    scanWith([
      { source: "header", value: "x-vercel-id: iad1::abc", location: "https://example.ai" },
      { source: "header", value: "server: cloudflare", location: "https://example.ai" },
      { source: "dns-mx", value: "aspmx.l.google.com", location: "example.ai" },
      { source: "html", value: '<script src="/_next/static/chunks/main.js"></script>', location: "https://example.ai" },
    ]),
    signatures,
  );
  for (const id of ["vercel", "cloudflare", "google-workspace", "nextjs"]) assert.ok(find(r, id), id);
});

test("CSP host parsing", () => {
  const hosts = cspHosts("default-src 'self'; connect-src 'self' https://api.openai.com wss://*.livekit.cloud https://o123.ingest.sentry.io; img-src data: https:");
  assert.deepEqual(hosts.sort(), ["api.openai.com", "livekit.cloud", "o123.ingest.sentry.io"]);
});

test("resource refs include modulepreload scripts", () => {
  const refs = resourceRefs(
    `<script src="https://js.stripe.com/v3"></script><link rel="modulepreload" href="/assets/index-abc.js"><link rel="preconnect" href="https://api.anthropic.com">`,
    "https://example.ai/",
  );
  assert.deepEqual(
    refs.map((r) => `${r.kind} ${r.url}`),
    ["script https://js.stripe.com/v3", "script https://example.ai/assets/index-abc.js", "link https://api.anthropic.com/"],
  );
});

test("mermaid output draws AI edges with evidence labels and dashed account edges", () => {
  const r = analyze(
    scanWith([
      { source: "header", value: "x-vercel-id: iad1", location: "x" },
      { source: "subprocessors", value: "OpenAI", location: "x" },
      { source: "dns-txt", value: "anthropic-domain-verification-z=1", location: "x" },
    ]),
    signatures,
  );
  const m = toMermaid(r);
  assert.match(m, /app -->\|subprocessor\| n_openai/);
  assert.match(m, /app -\.->\|DNS account\| n_anthropic/);
});
