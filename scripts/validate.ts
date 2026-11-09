import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { parse, validate, parseResolver, validateResolver } from "@styleframe/dtcg";

const ROOT = resolve(import.meta.dir, "..");
const SRC_TOKENS = resolve(ROOT, "src/tokens");
const args = process.argv.slice(2);

let failed = false;

function checkTokens(file: string): void {
  const p = resolve(SRC_TOKENS, file);
  if (!existsSync(p)) return;
  const raw = JSON.parse(readFileSync(p, "utf8"));
  const doc = parse(raw);
  const errors = validate(doc);
  if (errors.length === 0) {
    console.log(`✓ ${file}: DTCG validation passed (0 errors).`);
  } else {
    failed = true;
    console.error(`✗ ${file}: ${errors.length} DTCG validation error(s):`);
    for (const e of errors)
      console.error(`  - ${e.path}: expected ${e.expected}, received ${e.received}`);
  }
}

function checkResolver(): void {
  const p = resolve(SRC_TOKENS, "tokens.resolver.json");
  if (!existsSync(p)) return;
  const raw = JSON.parse(readFileSync(p, "utf8"));
  const doc = parseResolver(raw);
  const errors = validateResolver(doc);
  if (errors.length === 0) {
    console.log(`✓ tokens.resolver.json: DTCG resolver validation passed (0 errors).`);
  } else {
    failed = true;
    console.error(`✗ tokens.resolver.json: ${errors.length} resolver validation error(s):`);
    for (const e of errors) console.error(`  - ${e.path}: ${e.message}`);
  }
}

if (args[0]) {
  // validate a specific file
  const target = resolve(args[0]);
  if (!existsSync(target)) {
    console.error(`Tokens file not found: ${target}`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(target, "utf8"));
  const doc = parse(raw);
  const errors = validate(doc);
  if (errors.length === 0) {
    console.log(`✓ ${target}: DTCG validation passed (0 errors).`);
    process.exit(0);
  }
  console.error(`✗ ${target}: ${errors.length} DTCG validation error(s):`);
  for (const e of errors)
    console.error(`  - ${e.path}: expected ${e.expected}, received ${e.received}`);
  process.exit(1);
} else {
  checkTokens("tokens.json");
  checkTokens("tokens.dark.json");
  checkResolver();
  process.exit(failed ? 1 : 0);
}
