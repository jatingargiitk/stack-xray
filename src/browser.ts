import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
];

export function findChrome(): string | undefined {
  return CANDIDATES.find((p) => p && existsSync(p)) as string | undefined;
}

/** Render a JS-heavy page (e.g. a Vanta/SafeBase trust center) and return the resulting DOM. */
export async function renderDom(url: string, budgetMs = 8000): Promise<string | undefined> {
  const chrome = findChrome();
  if (!chrome || process.env.STACK_XRAY_NO_BROWSER) return undefined;
  const profile = mkdtempSync(join(tmpdir(), "stack-xray-dom-"));
  try {
    const { stdout } = await promisify(execFile)(
      chrome,
      ["--headless=new", "--disable-gpu", `--user-data-dir=${profile}`, `--virtual-time-budget=${budgetMs}`, "--dump-dom", url],
      { maxBuffer: 64 * 1024 * 1024, timeout: budgetMs + 20000 },
    );
    return stdout;
  } catch {
    return undefined;
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}
