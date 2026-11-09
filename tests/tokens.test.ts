import { test, expect } from "bun:test";
import { tokens } from "../src/tokens";

test("tokens expose color.bg.default as DTCG color", () => {
  expect((tokens as any).color.bg.default.colorSpace).toBe("srgb");
  expect((tokens as any).color.bg.default.hex).toBe("#ffffff");
});

test("tokens expose space.4 as DTCG dimension", () => {
  expect((tokens as any).space["4"].value).toBe(1);
  expect((tokens as any).space["4"].unit).toBe("rem");
});

test("generated css exists", async () => {
  const fs = await import("node:fs");
  const path = new URL("../src/tokens/tokens.css", import.meta.url).pathname;
  expect(fs.existsSync(path)).toBe(true);
});
