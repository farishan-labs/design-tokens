import { test, expect } from "bun:test";
import { tokens } from "../src/tokens";

test("tokens expose color.bg.default", () => {
  expect((tokens as any).color.bg.default).toBe("#ffffff");
});

test("tokens expose space.4", () => {
  expect((tokens as any).space["4"]).toBe("1rem");
});

test("generated css exists", async () => {
  const fs = await import("node:fs");
  const path = new URL("../src/tokens/tokens.css", import.meta.url).pathname;
  expect(fs.existsSync(path)).toBe(true);
});
