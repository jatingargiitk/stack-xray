import { promises as systemDns } from "node:dns";
import type { Signal } from "../types.js";

const SUBDOMAINS = ["www", "app", "api", "chat", "docs", "status", "help", "trust"];

const publicResolver = new systemDns.Resolver({ timeout: 4000, tries: 2 });
publicResolver.setServers(["1.1.1.1", "8.8.8.8"]);

/** Some local resolvers refuse large TXT answers (TCP fallback); retry against public resolvers. */
const dns = {
  resolveTxt: (n: string) => systemDns.resolveTxt(n).catch(() => publicResolver.resolveTxt(n)),
  resolveMx: (n: string) => systemDns.resolveMx(n).catch(() => publicResolver.resolveMx(n)),
  resolveNs: (n: string) => systemDns.resolveNs(n).catch(() => publicResolver.resolveNs(n)),
  resolveCname: (n: string) => systemDns.resolveCname(n).catch(() => publicResolver.resolveCname(n)),
  resolve4: (n: string) => systemDns.resolve4(n).catch(() => publicResolver.resolve4(n)),
};

/** TXT, MX, NS on the apex; CNAME chains on common subdomains. */
export async function collectDns(domain: string): Promise<{ signals: Signal[]; liveSubdomains: string[] }> {
  const signals: Signal[] = [];

  const [txt, mx, ns] = await Promise.all([
    dns.resolveTxt(domain).catch(() => [] as string[][]),
    dns.resolveMx(domain).catch(() => [] as { exchange: string }[]),
    dns.resolveNs(domain).catch(() => [] as string[]),
  ]);
  for (const rec of txt) signals.push({ source: "dns-txt", value: rec.join(""), location: domain });
  for (const rec of mx) signals.push({ source: "dns-mx", value: rec.exchange.toLowerCase(), location: domain });
  for (const rec of ns) signals.push({ source: "dns-ns", value: rec.toLowerCase(), location: domain });

  const liveSubdomains: string[] = [];
  await Promise.all(
    SUBDOMAINS.map(async (sub) => {
      const name = `${sub}.${domain}`;
      const chain = await cnameChain(name);
      if (chain.length) {
        liveSubdomains.push(name);
        for (const target of chain) signals.push({ source: "dns-cname", value: target, location: name });
        return;
      }
      const a = await dns.resolve4(name).catch(() => []);
      if (a.length) liveSubdomains.push(name);
    }),
  );

  return { signals, liveSubdomains: liveSubdomains.sort() };
}

async function cnameChain(name: string, depth = 0): Promise<string[]> {
  if (depth > 5) return [];
  const targets = await dns.resolveCname(name).catch(() => [] as string[]);
  if (!targets.length) return [];
  const t = targets[0].toLowerCase();
  return [t, ...(await cnameChain(t, depth + 1))];
}
