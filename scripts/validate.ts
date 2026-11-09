import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse, validate } from "@styleframe/dtcg";

const ROOT = resolve(import.meta.dir, "..");
const DEFAULT_TOKENS = resolve(ROOT, "src/tokens/tokens.json");
const args = process.argv.slice(2);
const inputPath = resolve(args[0] ?? DEFAULT_TOKENS);

if (!existsSync(inputPath)) {
  console.error(`Tokens file not found: ${inputPath}`);
  process.exit(1);
}

const raw = JSON.parse(readFileSync(inputPath, "utf8"));
const doc = parse(raw);
const errors = validate(doc);

if (errors.length === 0) {
  console.log(`✓ ${inputPath}: DTCG validation passed (0 errors).`);
  process.exit(0);
}

console.error(`✗ ${inputPath}: ${errors.length} DTCG validation error(s):`);
for (const e of errors) {
  console.error(`  - ${e.path}: expected ${e.expected}, received ${e.received}`);
}
process.exit(1);
