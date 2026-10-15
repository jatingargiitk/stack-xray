import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Category, Signature } from "./types.js";

export const CATEGORIES: Category[] = [
  "ai-provider",
  "ai-infra",
  "hosting",
  "edge",
  "framework",
  "backend",
  "auth",
  "payments",
  "analytics",
  "monitoring",
  "email",
  "support",
  "compliance",
  "team-tools",
];

export function defaultSignatureDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "signatures");
}

/** Each file holds either one signature object or an array of them. */
export function loadSignatures(dirs: string[] = [defaultSignatureDir()]): Signature[] {
  const out: Signature[] = [];
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as Signature | Signature[];
      out.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    }
  }
  return out;
}

export function validateSignatures(sigs: Signature[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const s of sigs) {
    const where = s.id ?? "(missing id)";
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) problems.push(`${where}: id must be lowercase kebab-case`);
    if (ids.has(s.id)) problems.push(`${where}: duplicate id`);
    ids.add(s.id);
    if (!s.name) problems.push(`${where}: missing name`);
    if (!CATEGORIES.includes(s.category)) problems.push(`${where}: unknown category "${s.category}"`);
    const patterns = [...Object.values(s.match ?? {}).flat(), ...(s.models ?? [])];
    if (!patterns.length) problems.push(`${where}: no match patterns`);
    for (const p of patterns) {
      try {
        new RegExp(p as string, "i");
      } catch (e) {
        problems.push(`${where}: invalid regex ${p}: ${(e as Error).message}`);
      }
    }
  }
  return problems;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".json")) out.push(p);
  }
  return out;
}
