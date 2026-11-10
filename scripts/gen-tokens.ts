import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseResolver, resolveResolver, validate, validateResolver } from "@styleframe/dtcg";

const ROOT = resolve(import.meta.dir, "..");
const SRC_TOKENS = resolve(ROOT, "src/tokens");
const DIST = resolve(ROOT, "dist");

type TokenNode = { $value?: unknown; $type?: string; [k: string]: unknown };

function isToken(node: unknown): node is { $value: unknown } {
  return typeof node === "object" && node !== null && "$value" in (node as object);
}

type Entry = { path: string[]; type: string; value: unknown };

function walk(node: TokenNode, path: string[], out: Entry[]): void {
  if (isToken(node)) {
    out.push({ path, type: String((node as { $type?: string }).$type ?? ""), value: node.$value });
    return;
  }
  if (typeof node === "object" && node !== null) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      walk(v as TokenNode, [...path, k], out);
    }
  }
}

function cssVarName(path: string[]): string {
  return "--ui-" + path.join("-");
}

function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v);
}

function colorToCss(v: unknown): string {
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  if (o.hex && typeof o.hex === "string") {
    const alpha = typeof o.alpha === "number" ? o.alpha : 1;
    if (alpha < 1) {
      const comps = o.components as number[];
      const [r, g, b] = comps.map((c) => Math.round(c * 255));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return o.hex as string;
  }
  const comps = o.components as number[];
  if (Array.isArray(comps)) {
    const [r, g, b] = comps.map((c) => Math.round(c * 255));
    const alpha = typeof o.alpha === "number" ? o.alpha : 1;
    return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
  }
  return String(v);
}

function dimToCss(v: unknown): string {
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  if (num(o.value) === 0) return "0";
  return `${o.value}${o.unit}`;
}

function durationToCss(v: unknown): string {
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return `${o.value}${o.unit}`;
}

function shadowToCss(v: unknown): string {
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  const color = colorToCss(o.color);
  const ox = dimToCss(o.offsetX);
  const oy = dimToCss(o.offsetY);
  const blur = dimToCss(o.blur);
  const spread = dimToCss(o.spread);
  const inset = o.inset ? "inset " : "";
  return `${inset}${ox} ${oy} ${blur} ${spread} ${color}`.trim();
}

function toCss(type: string, value: unknown): string {
  switch (type) {
    case "color":
      return colorToCss(value);
    case "dimension":
      return dimToCss(value);
    case "duration":
      return durationToCss(value);
    case "shadow":
      return shadowToCss(value);
    case "fontFamily":
      return typeof value === "string" ? value : String(value);
    default:
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      return JSON.stringify(value);
  }
}

function buildNested(entries: Entry[]): unknown {
  const root: Record<string, unknown> = {};
  for (const { path, value } of entries) {
    let cur: Record<string, unknown> = root;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]!;
      if (typeof cur[key] !== "object" || cur[key] === null) cur[key] = {};
      cur = cur[key] as Record<string, unknown>;
    }
    cur[path[path.length - 1]!] = value;
  }
  return root;
}

function entriesFromDoc(doc: unknown): Entry[] {
  const entries: Entry[] = [];
  walk(doc as TokenNode, [], entries);
  // remove $schema if present as token? walk skips $-prefixed keys, so fine
  return entries;
}

function buildCss(entries: Entry[]): string {
  const lines: string[] = [":root {"];
  for (const { path, type, value } of entries) {
    lines.push(`  ${cssVarName(path)}: ${toCss(type, value)};`);
  }
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

async function resolveMode(mode: "light" | "dark"): Promise<Entry[]> {
  const resolverRaw = JSON.parse(readFileSync(resolve(SRC_TOKENS, "tokens.resolver.json"), "utf8"));
  const resolver = parseResolver(resolverRaw);
  const rErrors = validateResolver(resolver);
  if (rErrors.length) {
    console.error("Resolver validation errors:");
    for (const e of rErrors) console.error(`  - ${e.path}: ${e.message}`);
    process.exit(1);
  }
  const loader = async (ref: string) => {
    const p = resolve(SRC_TOKENS, ref);
    return JSON.parse(readFileSync(p, "utf8"));
  };
  const resolved = await resolveResolver(resolver, { theme: mode }, loader);
  // validate resolved
  const vErrors = validate(resolved);
  if (vErrors.length) {
    console.error(`Resolved (${mode}) validation errors:`);
    for (const e of vErrors)
      console.error(`  - ${e.path}: expected ${e.expected}, received ${e.received}`);
    process.exit(1);
  }
  return entriesFromDoc(resolved);
}

const lightEntries = await resolveMode("light");
const darkEntries = await resolveMode("dark");

// Light CSS
const lightCss = buildCss(lightEntries);

// Dark CSS: override vars under media query + data-theme
const darkLines: string[] = [];
darkLines.push("@media (prefers-color-scheme: dark) {");
darkLines.push('  :root:not([data-theme="light"]) {');
for (const { path, type, value } of darkEntries) {
  darkLines.push(`    ${cssVarName(path)}: ${toCss(type, value)};`);
}
darkLines.push("  }");
darkLines.push("}");
darkLines.push("");
darkLines.push(':root[data-theme="dark"] {');
for (const { path, type, value } of darkEntries) {
  darkLines.push(`  ${cssVarName(path)}: ${toCss(type, value)};`);
}
darkLines.push("}");
darkLines.push("");
const darkCss = darkLines.join("\n");

const css = lightCss + "\n" + darkCss;

// TS (light structured values)
const nested = buildNested(lightEntries);
const ts = `// Generated by scripts/gen-tokens.ts — do not edit by hand.\n// Source: src/tokens/tokens.json (W3C DTCG) + resolver (light mode).\n\nexport const tokens = ${JSON.stringify(nested, null, 2)} as const;\n\nexport type Tokens = typeof tokens;\n\nexport const cssVar = (path: string[]): string => "--ui-" + path.join("-");\n`;

mkdirSync(SRC_TOKENS, { recursive: true });
writeFileSync(resolve(SRC_TOKENS, "tokens.css"), css);
writeFileSync(resolve(SRC_TOKENS, "tokens.ts"), ts);

// Keep generated TS formatted (oxfmt) so CI's fmt:check passes.
const oxfmtBin = resolve(ROOT, "node_modules", ".bin", "oxfmt");
const fmtResult = Bun.spawnSync([oxfmtBin, resolve(SRC_TOKENS, "tokens.ts")], {
  stdout: "inherit",
  stderr: "inherit",
});
if (fmtResult.exitCode !== 0) {
  console.error("oxfmt failed on generated tokens.ts");
  process.exit(fmtResult.exitCode ?? 1);
}

mkdirSync(DIST, { recursive: true });
writeFileSync(resolve(DIST, "tokens.css"), css);

console.log(
  `Generated ${lightEntries.length} tokens (light) + ${darkEntries.length} (dark) -> src/tokens/tokens.css, src/tokens/tokens.ts, dist/tokens.css`,
);
