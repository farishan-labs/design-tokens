import { test, expect } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dir, "..");

test("tokens module exposes structured DTCG values", async () => {
  const { tokens } = await import("../src/tokens");
  expect((tokens as any).color.bg.default.colorSpace).toBe("srgb");
  expect((tokens as any).color.bg.default.hex).toBe("#ffffff");
  expect((tokens as any).space["4"].value).toBe(1);
  expect((tokens as any).space["4"].unit).toBe("rem");
  expect((tokens as any).motion.duration.fast.value).toBe(100);
  expect((tokens as any).shadow.sm.color.hex).toBe("#000000");
});

test("generated css file exists and defines vars", () => {
  const css = readFileSync(resolve(ROOT, "src/tokens/tokens.css"), "utf8");
  expect(css).toContain(":root {");
  expect(css).toContain("--ui-color-bg-default: #ffffff;");
  expect(css).toContain("--ui-space-4: 1rem;");
  expect(css).toContain("prefers-color-scheme: dark");
});

test("validate command passes", () => {
  const r = spawnSync("bun", ["run", "validate"], { cwd: ROOT, encoding: "utf8" });
  expect(r.status).toBe(0);
  expect(r.stdout).toContain("0 errors");
});

test("gen:tokens regenerates outputs", () => {
  const r = spawnSync("bun", ["run", "gen:tokens"], { cwd: ROOT, encoding: "utf8" });
  expect(r.status).toBe(0);
  expect(existsSync(resolve(ROOT, "src/tokens/tokens.css"))).toBe(true);
  expect(existsSync(resolve(ROOT, "src/tokens/tokens.ts"))).toBe(true);
  expect(existsSync(resolve(ROOT, "dist/tokens.css"))).toBe(true);
});

test("preview command generates html", () => {
  const r = spawnSync("bun", ["run", "preview"], { cwd: ROOT, encoding: "utf8" });
  expect(r.status).toBe(0);
  const html = readFileSync(resolve(ROOT, "dist/preview.html"), "utf8");
  expect(html).toContain("<!DOCTYPE html>");
  expect(html).toContain("Design tokens preview");
});
