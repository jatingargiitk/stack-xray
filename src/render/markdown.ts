import { TIER_LABEL } from "../engine.js";
import type { Finding, Report } from "../types.js";
import { SHORT_TIER, byCategory, grouped } from "./common.js";
import { toMermaid } from "./mermaid.js";

export function toMarkdown(report: Report): string {
  const out: string[] = [];
  out.push(`# What ${report.domain} runs on`, "");
  out.push(`Scanned ${report.finalUrl ?? report.target} at ${report.scannedAt} · ${report.stats.signals} signals · ${(report.stats.bundleBytes / 1e6).toFixed(1)} MB of JavaScript inspected`, "");
  out.push("```mermaid", toMermaid(report).trimEnd(), "```", "");

  const ai = byCategory(report, "ai-provider");
  out.push("## AI providers", "");
  if (!ai.length) {
    out.push("No AI provider evidence found from the outside. Server-side calls are invisible to a passive scan; see Limitations.", "");
  } else {
    out.push("| Provider | Strongest evidence | Confidence | Models seen |", "| --- | --- | --- | --- |");
    for (const f of ai) out.push(`| ${f.name} | ${TIER_LABEL[f.tier]} | ${pct(f)} | ${f.models.slice(0, 6).join(", ") || "—"} |`);
    out.push("");
  }

  for (const g of grouped(report)) {
    if (g.key === "ai") continue;
    out.push(`## ${g.title}`, "");
    for (const f of g.findings) out.push(`- **${f.name}** — ${SHORT_TIER[f.tier]}, ${pct(f)}`);
    out.push("");
  }

  const team = byCategory(report, "team-tools");
  if (team.length) {
    out.push("## Team tools (from DNS verification records)", "", team.map((f) => f.name).join(" · "), "");
  }

  out.push("## Evidence", "");
  for (const f of report.findings) out.push(evidenceBlock(f));

  out.push("## Limitations", "");
  out.push(
    "- This is an outside-in scan. Calls a backend makes to an LLM API never touch the browser, so they only show up if the company declares them (subprocessor list, trust center, status page) or ships references in client code.",
    "- `DNS account` evidence means the company verified its domain with that vendor. That often means employees use it (e.g. ChatGPT Enterprise, Claude for Work), not that the product calls it.",
    "- `in bundle` means shipped JavaScript references the vendor or model id. Model pickers and marketing pages can mention models that are routed through another provider.",
    "- Run with `--rea` to add live network observation through REA (github.com/morluto/rea).",
    "",
  );
  if (report.errors.length) {
    out.push("<details><summary>Collector errors</summary>", "", ...report.errors.map((e) => `- ${e.collector}: ${e.message}`), "", "</details>", "");
  }
  return out.join("\n");
}

function evidenceBlock(f: Finding): string {
  const lines = [`<details><summary><b>${f.name}</b> · ${f.category} · ${pct(f)}</summary>`, ""];
  if (f.note) lines.push(`> ${f.note}`, "");
  for (const e of f.evidence) {
    lines.push(`- \`${e.tier}\` ${e.source} @ ${e.location}: \`${truncate(e.matched, 140).replace(/`/g, "'")}\``);
  }
  lines.push("", "</details>", "");
  return lines.join("\n");
}

function pct(f: Finding): string {
  return `${Math.round(f.confidence * 100)}%`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
