import { loadSignatures, validateSignatures } from "../src/signatures.js";

const sigs = loadSignatures();
const problems = validateSignatures(sigs);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
const byCat = new Map<string, number>();
for (const s of sigs) byCat.set(s.category, (byCat.get(s.category) ?? 0) + 1);
console.log(`${sigs.length} signatures OK`);
for (const [c, n] of [...byCat].sort()) console.log(`  ${c.padEnd(12)} ${n}`);
