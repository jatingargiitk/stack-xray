import type { EvidenceTier, Finding, Report } from "../types.js";
import { SHORT_TIER, byCategory, grouped, topModels } from "./common.js";

const TIER_COLOR: Record<EvidenceTier, string> = {
  observed: "#22c55e",
  infra: "#38bdf8",
  declared: "#f59e0b",
  bundle: "#a78bfa",
  config: "#94a3b8",
  mention: "#7c8597",
  account: "#6b7280",
};

/** A self-contained 1200×675 card (X/Twitter image ratio) showing the stack as a left-to-right flow. */
export function toCardHtml(report: Report): string {
  const groups = grouped(report);
  const get = (k: string) => groups.find((g) => g.key === k)?.findings ?? [];
  const ai = get("ai");
  const lower = ["aiinfra", "data", "auth", "pay", "telemetry", "comms"]
    .map((k) => groups.find((g) => g.key === k))
    .filter(Boolean) as { title: string; findings: Finding[] }[];
  const team = byCategory(report, "team-tools");

  const box = (title: string, items: Finding[], cls = "") =>
    `<div class="box ${cls}"><div class="box-title">${esc(title)}</div>${items.map(chip).join("") || `<div class="muted">not detected</div>`}</div>`;

  const aiRows = ai.length
    ? ai
        .map((f) => {
          const models = topModels(f, 3);
          return `<div class="ai-row" style="--c:${TIER_COLOR[f.tier]}">
  <div class="ai-name">${esc(f.name)}${models.length ? `<span class="models">${models.map(esc).join(" · ")}</span>` : ""}</div>
  <div class="badge${f.tier === "account" ? " dashed" : ""}">${SHORT_TIER[f.tier]}</div>
</div>`;
        })
        .join("")
    : `<div class="muted">No AI provider visible from outside</div>`;

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(report.domain)} · stack-xray</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:1200px;height:675px;background:radial-gradient(1200px 600px at 80% -10%,#1b2340 0%,#0a0d17 55%,#07090f 100%);color:#e6e9f2;font:15px/1.35 ui-sans-serif,-apple-system,"Inter","Segoe UI",sans-serif;padding:30px 36px 24px;overflow:hidden;display:flex;flex-direction:column;gap:16px}
  header{display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:34px;font-weight:700;letter-spacing:-.02em}
  h1 b{background:linear-gradient(90deg,#7dd3fc,#c4b5fd);-webkit-background-clip:text;color:transparent}
  .brand{font:600 14px ui-monospace,Menlo,monospace;color:#8b93a7}
  .flow{display:grid;grid-template-columns:56px 18px 190px 18px minmax(0,1fr) 18px 440px;align-items:start;gap:8px}
  .arrow{align-self:center;color:#4b5570;font-size:22px;text-align:center}
  .box{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px 14px;min-width:0}
  .box-title{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#8b93a7;margin-bottom:8px}
  .user{display:flex;align-items:center;justify-content:center;padding:14px 0;font-size:26px;align-self:center}
  .chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:3px 8px;margin:0 6px 6px 0;font-size:13px;white-space:nowrap}
  .dot{width:7px;height:7px;border-radius:50%;background:var(--c);flex:none}
  .ai{border-color:rgba(167,139,250,.4);background:linear-gradient(180deg,rgba(124,58,237,.14),rgba(255,255,255,.02));box-shadow:0 0 40px rgba(124,58,237,.15)}
  .ai-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05)}
  .ai-row:last-child{border-bottom:0}
  .ai-name{font-weight:600;font-size:16px;display:flex;flex-direction:column;min-width:0}
  .models{font:12px ui-monospace,Menlo,monospace;color:#a5adc2;font-weight:400;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px}
  .badge{font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid var(--c);color:var(--c);white-space:nowrap}
  .badge.dashed{border-style:dashed}
  .lower{display:grid;grid-template-columns:repeat(${Math.max(1, Math.min(lower.length, 6))},minmax(0,1fr));gap:12px;align-items:start}
  .lower .chip{white-space:normal}
  .lower .box{min-width:0}
  .muted{color:#5d667c;font-size:13px}
  footer{margin-top:auto;display:flex;justify-content:space-between;align-items:center;color:#7a8299;font-size:12px}
  .legend span{margin-right:12px;display:inline-flex;align-items:center;gap:5px}
  .team{color:#8b93a7}
  code{font:12px ui-monospace,Menlo,monospace;color:#c4b5fd}
</style></head>
<body>
<header>
  <h1>What <b>${esc(report.domain)}</b> really runs on</h1>
  <div class="brand">stack-xray</div>
</header>
<div class="flow">
  <div class="box user">👤</div><div class="arrow">→</div>

  ${box("Edge & DNS", get("edge"))}<div class="arrow">→</div>
  ${box("App", get("app"))}<div class="arrow">→</div>
  <div class="box ai"><div class="box-title">AI providers</div>${aiRows}</div>
</div>
<div class="lower">${lower.map((g) => box(g.title, g.findings.slice(0, 4))).join("")}</div>
${team.length ? `<div class="team">Team uses: ${team.slice(0, 12).map((f) => esc(f.name)).join(" · ")}</div>` : ""}
<footer>
  <div class="legend">${(["observed", "infra", "declared", "bundle", "config", "mention", "account"] as EvidenceTier[])
    .map((t) => `<span><i class="dot" style="--c:${TIER_COLOR[t]}"></i>${SHORT_TIER[t]}</span>`)
    .join("")}</div>
  <code>npx stack-xray ${esc(report.domain)}</code>
</footer>
</body></html>
`;
}

function chip(f: Finding): string {
  return `<span class="chip" style="--c:${TIER_COLOR[f.tier]}"><i class="dot"></i>${esc(f.name)}</span>`;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}
