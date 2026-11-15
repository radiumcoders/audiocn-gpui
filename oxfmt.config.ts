import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    ".agents/**",
    ".claude/**",
    ".source/**",
    "public/r/**",
    "test-results/**",
    "playwright-report/**",
    // The Rust port: checked by its own CI (cargo fmt, clippy); its scripts are dev tools.
    "gpui/**",
    // Built by `pnpm gpui:build`.
    "public/gpui/**",
  ],
});
