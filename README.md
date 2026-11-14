# @farishan-labs/design-tokens

![License](https://img.shields.io/github/license/farishan-labs/design-tokens) ![Stars](https://img.shields.io/github/stars/farishan-labs/design-tokens)

## Get the toolkit

[![npm](https://img.shields.io/npm/v/@farishan-labs/design-tokens)](https://www.npmjs.com/package/@farishan-labs/design-tokens)
[![npm downloads](https://img.shields.io/npm/dm/@farishan-labs/design-tokens)](https://www.npmjs.com/package/@farishan-labs/design-tokens)
[![Gumroad](https://img.shields.io/badge/Gumroad-OpenCode%20Dev%20Toolkit-ff90e8)](https://farishan1.gumroad.com/l/sknrfm)

Part of Faris Han Labs. Buy the OpenCode Dev Toolkit on Gumroad.


W3C DTCG design tokens for Faris Han Labs. Cross-platform: web (CSS vars),
TypeScript constants, and (later) TUI/native mappings. GPL-3.0.

![preview](demo/preview.png)

## Install

```bash
bun add @farishan-labs/design-tokens
```

## Usage

```ts
import { tokens } from "@farishan-labs/design-tokens";
```

```html
<link rel="stylesheet" href="node_modules/@farishan-labs/design-tokens/src/tokens/tokens.css" />
```

## Preview

Render a local, offline swatch preview of any DTCG tokens file:

```bash
bun run preview                      # uses src/tokens/tokens.json
bun run preview -- path/to/tokens.json
```

Writes `dist/preview.html` and opens it in the default browser. View-only
(no editing). Reuse Engramma if an embedded editor is needed.

## Token types

All 13 W3C DTCG types are represented and generated to CSS/TS:

`color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`,
`number`, `border`, `strokeStyle`, `transition`, `shadow`, `gradient`,
`typography`.

## Multi-mode (light/dark)

Tokens resolve per color scheme via the DTCG Resolver Module:
`src/tokens/tokens.resolver.json` (modifier `theme`: light/dark).
`gen:tokens` emits `:root` (light) plus dark overrides under
`prefers-color-scheme: dark` and `[data-theme="dark"]`.

## Validate

Check DTCG compliance of tokens + resolver:

```bash
bun run validate                      # tokens.json, tokens.dark.json, resolver
bun run validate -- path/to/tokens.json
```

Exits non-zero on any validation error.

## Development

```bash
bun install
bun run check
bun test
bun run gen:tokens
```

## Research basis

`research/topics/farishan-labs-ui/` (P4 tokens as SSOT).

## Installation

```bash
npm install design-tokens
```
