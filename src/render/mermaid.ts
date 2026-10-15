import type { Finding, Report } from "../types.js";
import { SHORT_TIER, grouped, topModels } from "./common.js";

export function toMermaid(report: Report): string {
  const lines: string[] = ["flowchart LR"];
  const groups = grouped(report);
  const has = (key: string) => groups.some((g) => g.key === key);

  lines.push(`  user(["👤 User"])`);
  for (const g of groups) {
    const title = g.key === "app" ? `${report.domain}` : g.title;
    lines.push(`  subgraph ${g.key}["${esc(title)}"]`);
    lines.push(`    direction TB`);
    for (const f of g.findings) lines.push(`    ${nodeId(f)}["${esc(label(f))}"]:::${f.tier}`);
    lines.push("  end");
  }

  const app = has("app") ? "app" : undefined;
  if (has("edge")) {
    lines.push("  user --> edge");
    if (app) lines.push("  edge --> app");
  } else if (app) {
    lines.push("  user --> app");
  }
  const from = app ?? (has("edge") ? "edge" : "user");

  for (const f of groups.find((g) => g.key === "ai")?.findings ?? []) {
    const arrow = f.tier === "account" ? "-.->" : "-->";
    lines.push(`  ${from} ${arrow}|${SHORT_TIER[f.tier]}| ${nodeId(f)}`);
  }
  for (const key of ["aiinfra", "data", "auth", "pay", "telemetry", "comms"]) {
    if (has(key)) lines.push(`  ${from} --> ${key}`);
  }

  lines.push(
    "  classDef observed fill:#0f2e1d,stroke:#22c55e,stroke-width:2px,color:#e5ffe9",
    "  classDef infra fill:#0f2233,stroke:#38bdf8,stroke-width:2px,color:#e0f2fe",
    "  classDef declared fill:#2a1f0b,stroke:#f59e0b,stroke-width:2px,color:#fff7e6",
    "  classDef bundle fill:#1f1633,stroke:#a78bfa,stroke-width:2px,color:#f3eeff",
    "  classDef config fill:#1e1e24,stroke:#94a3b8,stroke-width:1px,color:#e2e8f0",
    "  classDef mention fill:#1a1c22,stroke:#7c8597,stroke-width:1px,color:#d1d5db",
    "  classDef account fill:#1a1a1a,stroke:#6b7280,stroke-width:1px,stroke-dasharray:4 3,color:#d1d5db",
  );
  return lines.join("\n") + "\n";
}

function label(f: Finding): string {
  const models = topModels(f);
  const head = models.length ? `${f.name}<br/><small>${models.join(", ")}</small>` : f.name;
  return f.category === "ai-provider" ? `${head}<br/><small>${SHORT_TIER[f.tier]} · ${Math.round(f.confidence * 100)}%</small>` : head;
}

function nodeId(f: Finding): string {
  return "n_" + f.id.replace(/[^a-z0-9]/gi, "_");
}

function esc(s: string): string {
  return s.replace(/"/g, "#quot;");
}
