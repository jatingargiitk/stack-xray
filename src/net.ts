export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 stack-xray/0.1 (+https://github.com/jatingargiitk/stack-xray)";

export interface FetchResult {
  url: string;
  status: number;
  headers: Headers;
  setCookies: string[];
  text: string;
}

export async function fetchText(
  url: string,
  opts: { timeoutMs?: number; maxBytes?: number; accept?: string } = {},
): Promise<FetchResult> {
  const { timeoutMs = 15000, maxBytes = 4_000_000, accept = "text/html,*/*" } = opts;
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": USER_AGENT, accept, "accept-language": "en-US,en;q=0.9" },
  });
  const text = await readCapped(res, maxBytes);
  return {
    url: res.url || url,
    status: res.status,
    headers: res.headers,
    setCookies: res.headers.getSetCookie?.() ?? [],
    text,
  };
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  if (total >= maxBytes) await reader.cancel().catch(() => {});
  return new TextDecoder().decode(concat(chunks).subarray(0, maxBytes));
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

export function registrableDomain(host: string): string {
  const parts = host.toLowerCase().replace(/\.$/, "").split(".");
  if (parts.length <= 2) return parts.join(".");
  const twoLevelSuffix = /^(co|com|net|org|gov|ac|edu)\.[a-z]{2}$/;
  const lastTwo = parts.slice(-2).join(".");
  return twoLevelSuffix.test(lastTwo) ? parts.slice(-3).join(".") : lastTwo;
}

export function normalizeTarget(input: string): { url: string; domain: string; host: string } {
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const u = new URL(withScheme);
  return { url: u.toString(), host: u.hostname, domain: registrableDomain(u.hostname) };
}

export function hostOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

export async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}
