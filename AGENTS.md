<!-- bun tooling -->

# @farishan-labs/design-tokens — Bun + oxlint/oxfmt

This project uses Bun as runtime, package manager, test runner, and bundler.
Dev tooling is standalone `oxlint` (lint) and `oxfmt` (format).

## Commands

- `bun install` — install dependencies
- `bun test` — run tests
- `bun run lint` — lint with oxlint
- `bun run fmt` — format with oxfmt (writes in place)
- `bun run fmt:check` — check formatting
- `bun run check` — lint + format check + typecheck (CI gate)
- `bun run gen:tokens` — regenerate CSS/TS from src/tokens/tokens.json

## Notes

- Runtime stays dependency-free; `oxlint`/`oxfmt` are devDependencies only.
- Tokens are the single source of truth (W3C DTCG). CSS and TS are generated.
- No pre-commit hook; CI (`bun run check`) is the gate.
- Philosophy: see farishan-labs/ui PHILOSOPHY.md (P4 tokens as SSOT).
