import type { Category, EvidenceTier, Finding, Report } from "../types.js";

export const SHORT_TIER: Record<EvidenceTier, string> = {
  observed: "live",
  infra: "infra",
  declared: "subprocessor",
  bundle: "in bundle",
  config: "CSP",
  mention: "mentioned",
  account: "DNS account",
};

export const GROUPS: { key: string; title: string; categories: Category[]; min: number; max: number }[] = [
  { key: "edge", title: "Edge & DNS", categories: ["edge"], min: 0.5, max: 4 },
  { key: "app", title: "App", categories: ["hosting", "framework"], min: 0.5, max: 6 },
  { key: "ai", title: "AI providers", categories: ["ai-provider"], min: 0, max: 8 },
  { key: "aiinfra", title: "AI infra", categories: ["ai-infra"], min: 0.5, max: 6 },
  { key: "data", title: "Data & backend", categories: ["backend"], min: 0.5, max: 6 },
  { key: "auth", title: "Auth", categories: ["auth"], min: 0.5, max: 4 },
  { key: "pay", title: "Payments", categories: ["payments"], min: 0.5, max: 4 },
  { key: "telemetry", title: "Analytics & monitoring", categories: ["analytics", "monitoring"], min: 0.5, max: 8 },
  { key: "comms", title: "Email & support", categories: ["email", "support"], min: 0.5, max: 6 },
];

export function grouped(report: Report): { key: string; title: string; findings: Finding[] }[] {
  return GROUPS.map((g) => ({
    key: g.key,
    title: g.title,
    findings: report.findings.filter((f) => g.categories.includes(f.category) && f.confidence >= g.min).slice(0, g.max),
  })).filter((g) => g.findings.length);
}

export function byCategory(report: Report, category: Category): Finding[] {
  return report.findings.filter((f) => f.category === category);
}

/** Pick the most useful model ids to display: newest-looking, deduped, capped. */
export function topModels(f: Finding, n = 3): string[] {
  return [...f.models].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })).slice(0, n);
}
