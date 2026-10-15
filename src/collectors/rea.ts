import { spawn, execFile } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { promisify } from "node:util";
import { findChrome } from "../browser.js";
import { USER_AGENT } from "../net.js";
import type { CollectorError, Signal } from "../types.js";

const run = promisify(execFile);

export interface ReaResult {
  signals: Signal[];
  bundleText: string;
  errors: CollectorError[];
  evidenceIds: string[];
}

/**
 * Deep mode: drive a throwaway headless Chrome and let REA (github.com/morluto/rea)
 * passively observe the page through CDP. REA owns the observation and evidence;
 * stack-xray opens the page, passes the candidate third-party origins found by the
 * passive scan (REA only retains explicitly allowed origins), and scrolls during the
 * capture window. Hosts REA sees at runtime are upgraded to "observed".
 */
export async function collectRea(url: string, opts: { observationMs?: number; candidateHosts?: string[] } = {}): Promise<ReaResult> {
  const observationMs = opts.observationMs ?? 12000;
  const origins = [...new Set([new URL(url).origin, ...(opts.candidateHosts ?? []).map((h) => `https://${h}`)])].slice(0, 300);
  const originArgs = origins.flatMap((o) => ["--allowed-origins", o]);
  const errors: CollectorError[] = [];
  const signals: Signal[] = [];
  const evidenceIds: string[] = [];
  let bundleText = "";

  const chrome = findChrome();
  if (!chrome) {
    return { signals, bundleText, evidenceIds, errors: [{ collector: "rea", message: "No Chrome-family browser found; set CHROME_PATH." }] };
  }

  const port = await freePort();
  const profile = mkdtempSync(join(tmpdir(), "stack-xray-"));
  const browser = spawn(
    chrome,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      "--remote-debugging-address=127.0.0.1",
      `--user-data-dir=${profile}`,
      `--user-agent=${USER_AGENT.replace(/ stack-xray.*$/, "")}`,
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  const endpoint = `http://127.0.0.1:${port}`;

  try {
    await waitFor(async () => (await fetch(`${endpoint}/json/version`)).ok, 15000);
    const target = (await (await fetch(`${endpoint}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })).json()) as {
      id: string;
      webSocketDebuggerUrl: string;
    };
    await sleep(4000);

    const rea = await reaCommand();
    const inspect = runRea(rea, ["inspect-web-page", endpoint, target.id, "--observation-ms", String(observationMs), ...originArgs, "--format", "json"]);
    await sleep(1500);
    // REA rejects navigation mid-capture (target_changed), so scroll instead to trigger lazy chunks and beacons.
    await cdp(target.webSocketDebuggerUrl, "Runtime.evaluate", {
      expression: `(async()=>{for(let i=1;i<=8;i++){scrollTo(0,document.body.scrollHeight*i/8);await new Promise(r=>setTimeout(r,500))}scrollTo(0,0)})()`,
      awaitPromise: true,
    }).catch((e) => errors.push({ collector: "rea", message: `scroll failed: ${(e as Error).message}` }));
    const inspected = await inspect;

    if (inspected.ok) {
      const data = inspected.json as Record<string, any>;
      if (data.evidence_id) evidenceIds.push(data.evidence_id);
      const n = data.normalized_result ?? data;
      for (const u of collectUrls(n.network)) signals.push({ source: "runtime", value: hostname(u), location: u });
      for (const u of collectUrls(n.resources)) signals.push({ source: "runtime", value: hostname(u), location: u });
      for (const u of collectUrls(n.workers)) signals.push({ source: "runtime", value: hostname(u), location: u });
      const sources: string[] = [];
      for (const s of n.scripts?.items ?? []) {
        if (s.url) signals.push({ source: "runtime", value: hostname(s.url), location: s.url });
        const text = s.source?.text ?? s.source?.content;
        if (typeof text === "string") sources.push(text);
      }
      bundleText = sources.join("\n;\n");
    } else {
      errors.push({ collector: "rea", message: `inspect-web-page: ${inspected.error}` });
    }

    const bundle = await runRea(rea, ["analyze-web-bundle", endpoint, target.id, "--observation-ms", "1500", "--format", "json"]);
    if (bundle.ok) {
      const data = bundle.json as Record<string, any>;
      if (data.evidence_id) evidenceIds.push(data.evidence_id);
      const n = data.normalized_result ?? data;
      for (const ep of n.observations?.endpoints ?? []) {
        const u = typeof ep === "string" ? ep : ep.url ?? ep.value;
        if (typeof u === "string" && /^https?:/.test(u)) signals.push({ source: "runtime", value: hostname(u), location: u });
      }
    } else {
      errors.push({ collector: "rea", message: `analyze-web-bundle: ${bundle.error}` });
    }
  } catch (e) {
    errors.push({ collector: "rea", message: (e as Error).message });
  } finally {
    browser.kill("SIGTERM");
    await sleep(300);
    rmSync(profile, { recursive: true, force: true });
  }

  return { signals: signals.filter((s) => s.value), bundleText, errors, evidenceIds };
}

async function reaCommand(): Promise<string[]> {
  try {
    await run("rea", ["--version"]);
    return ["rea"];
  } catch {
    return ["npx", "-y", "rea-agents@latest"];
  }
}

async function runRea(cmd: string[], args: string[]): Promise<{ ok: boolean; json?: unknown; error?: string }> {
  try {
    const { stdout } = await run(cmd[0], [...cmd.slice(1), ...args], { maxBuffer: 256 * 1024 * 1024, timeout: 180000 });
    const json = JSON.parse(stdout);
    if (json && typeof json === "object" && "code" in json && "message" in json && !("normalized_result" in json)) {
      return { ok: false, error: String((json as { message: string }).message).split("\n")[0] };
    }
    return { ok: true, json };
  } catch (e) {
    const err = e as Error & { stdout?: string; stderr?: string };
    const detail = [err.stdout, err.stderr]
      .filter(Boolean)
      .join("\n")
      .split("\n")
      .filter((l) => l.trim() && !/EBADENGINE|npm warn/.test(l))
      .slice(-4)
      .join(" ");
    return { ok: false, error: detail || err.message.split("\n")[0] };
  }
}

function cdp(wsUrl: string, method: string, params: object): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("CDP timeout"));
    }, 10000);
    ws.onopen = () => ws.send(JSON.stringify({ id: 1, method, params }));
    ws.onmessage = (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id === 1) {
        clearTimeout(timer);
        ws.close();
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    };
    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error("CDP websocket error"));
    };
  });
}

function collectUrls(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    if (/^(https?|wss?):\/\//.test(node)) out.push(node);
  } else if (Array.isArray(node)) {
    for (const v of node) collectUrls(v, out);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectUrls(v, out);
  }
  return out;
}

function hostname(u: string): string {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      srv.close(() => (typeof addr === "object" && addr ? resolve(addr.port) : reject(new Error("no port"))));
    });
  });
}

async function waitFor(check: () => Promise<boolean>, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check().catch(() => false)) return;
    await sleep(250);
  }
  throw new Error("Timed out waiting for Chrome DevTools endpoint");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
