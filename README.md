# @farishan-labs/design-tokens

W3C DTCG design tokens for Faris Han Labs. Cross-platform: web (CSS vars),
TypeScript constants, and (later) TUI/native mappings. Apache-2.0.

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
