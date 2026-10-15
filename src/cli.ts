#!/usr/bin/env node
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";
import { TIER_LABEL } from "./engine.js";
import { toCardHtml } from "./render/card.js";
import { byCategory, grouped, SHORT_TIER } from "./render/common.js";
import { toMarkdown } from "./render/markdown.js";
import { toMermaid } from "./render/mermaid.js";
import { xray } from "./scan.js";
import { defaultSignatureDir, loadSignatures } from "./signatures.js";
import type { Report } from "./types.js";

const HELP = `stack-xray — see what any startup's product really runs on, including its AI providers.

Usage
  stack-xray <domain> [more domains...] [options]

Options
  --out <dir>          Output directory (default: ./stack-xray-out)
  --rea                Add live network observation via REA (needs Chrome; uses npx rea-agents)
  --png                Render card.png with headless Chrome
  --url <url>          Extra page to scan (repeatable), e.g. https://app.example.com/login
  --signatures <dir>   Extra signature directory (repeatable)
  --json               Print the JSON report to stdout instead of the summary
  --no-legal           Skip subprocessor / privacy / trust page discovery
  -h, --help           Show help

Writes report.md, stack.json, diagram.mmd and card.html per domain.
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: "string", default: "stack-xray-out" },
      rea: { type: "boolean", default: false },
      png: { type: "boolean", default: false },
      url: { type: "string", multiple: true },
      signatures: { type: "string", multiple: true },
      json: { type: "boolean", default: false },
      "no-legal": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help || !positionals.length) {
    process.stdout.write(HELP);
    process.exit(positionals.length ? 0 : 1);
  }

  const signatures = loadSignatures([defaultSignatureDir(), ...(values.signatures ?? []).map((d) => resolve(d))]);
  const log = (s: string) => !values.json && process.stderr.write(dim(`  · ${s}\n`));

  for (const target of positionals) {
    if (!values.json) process.stderr.write(`\n${bold("stack-xray")} ${target}\n`);
    const report = await xray(target, {
      rea: values.rea,
      extraUrls: values.url,
      skipLegal: values["no-legal"],
      signatures,
      onProgress: log,
    });

    const dir = join(values.out!, report.domain);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "stack.json"), JSON.stringify(report, null, 2));
    writeFileSync(join(dir, "report.md"), toMarkdown(report));
    writeFileSync(join(dir, "diagram.mmd"), toMermaid(report));
    const cardPath = join(dir, "card.html");
    writeFileSync(cardPath, toCardHtml(report));
    if (values.png) await renderPng(resolve(cardPath), resolve(join(dir, "card.png"))).catch((e) => log(`png failed: ${e.message}`));

    if (values.json) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    else printSummary(report, dir);
  }
}

function printSummary(report: Report, dir: string) {
  const ai = byCategory(report, "ai-provider");
  const out: string[] = [""];
  out.push(bold(`  AI providers`));
  if (!ai.length) out.push(dim("    none visible from outside"));
  for (const f of ai) {
    const models = f.models.length ? dim(` [${f.models.slice(0, 4).join(", ")}${f.models.length > 4 ? ", …" : ""}]`) : "";
    out.push(`    ${tierMark(f.tier)} ${f.name.padEnd(28)} ${String(Math.round(f.confidence * 100)).padStart(3)}%  ${dim(TIER_LABEL[f.tier])}${models}`);
  }
  for (const g of grouped(report)) {
    if (g.key === "ai") continue;
    out.push(`  ${bold(g.title.padEnd(24))} ${g.findings.map((f) => `${f.name}${dim(`(${SHORT_TIER[f.tier]})`)}`).join(", ")}`);
  }
  const team = byCategory(report, "team-tools");
  if (team.length) out.push(`  ${bold("Team tools".padEnd(24))} ${dim(team.map((f) => f.name).join(", "))}`);
  out.push("", dim(`  → ${dir}/report.md · card.html · diagram.mmd · stack.json`), "");
  process.stdout.write(out.join("\n") + "\n");
}

async function renderPng(htmlPath: string, pngPath: string) {
  const chrome = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find((p) => p && existsSync(p));
  if (!chrome) throw new Error("no Chrome found; set CHROME_PATH");
  await promisify(execFile)(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--window-size=1200,675",
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ]);
}

const tty = process.stdout.isTTY;
const bold = (s: string) => (tty ? `\x1b[1m${s}\x1b[0m` : s);
const dim = (s: string) => (tty ? `\x1b[2m${s}\x1b[0m` : s);
function tierMark(t: Report["findings"][number]["tier"]): string {
  const colors: Record<string, number> = { observed: 32, infra: 36, declared: 33, bundle: 35, config: 37, mention: 37, account: 90 };
  return tty ? `\x1b[${colors[t]}m●\x1b[0m` : "●";
}

main().catch((e) => {
  process.stderr.write(`stack-xray: ${(e as Error).message}\n`);
  process.exit(1);
});
