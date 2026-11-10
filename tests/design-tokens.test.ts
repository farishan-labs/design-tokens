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
  expect((tokens as any).font.weight.bold).toBe(700);
  expect((tokens as any).easing.standard[0]).toBe(0.4);
  expect((tokens as any).opacity.disabled).toBe(0.38);
  expect((tokens as any).border.default.style).toBe("solid");
  expect((tokens as any).strokeStyle.custom.lineCap).toBe("round");
  expect((tokens as any).transition.fast.timingFunction[3]).toBe(1);
  expect((tokens as any).gradient.brand[0].position).toBe(0);
  expect((tokens as any).typography.body.fontFamily).toBe(
    "ui-sans-serif, system-ui, -apple-system, sans-serif",
  );
});

test("generated css file exists and defines vars", () => {
  const css = readFileSync(resolve(ROOT, "src/tokens/tokens.css"), "utf8");
  expect(css).toContain(":root {");
  expect(css).toContain("--ui-color-bg-default: #ffffff;");
  expect(css).toContain("--ui-space-4: 1rem;");
  expect(css).toContain("--ui-font-weight-bold: 700;");
  expect(css).toContain("--ui-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);");
  expect(css).toContain("--ui-opacity-disabled: 0.38;");
  expect(css).toContain("--ui-border-default: 1px solid #e4e4e7;");
  expect(css).toContain("--ui-strokeStyle-custom: 4px 2px;");
  expect(css).toContain("--ui-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;");
  expect(css).toContain("--ui-gradient-brand: linear-gradient(#2563eb 0%, #1d4ed8 100%);");
  expect(css).toContain(
    "--ui-typography-body: 400 1rem/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif;",
  );
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
