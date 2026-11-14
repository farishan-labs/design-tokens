import { tokens as defaultTokens } from "./tokens";
import { tokens as monoTokens } from "./tokens.mono";

export { tokens, cssVar, type Tokens } from "./tokens";
export {
  tokens as monoTokensExport,
  cssVar as monoCssVar,
  type Tokens as MonoTokens,
} from "./tokens.mono";

export const tokensByScheme = {
  default: defaultTokens,
  mono: monoTokens,
} as const;
