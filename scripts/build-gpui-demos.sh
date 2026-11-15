#!/usr/bin/env bash
# Builds the live GPUI examples for the docs (/docs/gpui): the gallery crate in
# gpui/, compiled to WebAssembly, written to public/gpui.
#
#   pnpm gpui:build            # always rebuild
#   pnpm build                 # runs this with --if-needed
#
# On Vercel or CI it installs its own Rust toolchain and wasm-bindgen first (the
# build image's Rust is too old for GPUI). Locally it needs cargo, the
# wasm32-unknown-unknown target and wasm-bindgen-cli 0.2.129; without cargo it
# skips, and the GPUI examples show "GPUI demo not built".
set -euo pipefail
WASM_BINDGEN_VERSION=0.2.129
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/gpui"

if [ "${1:-}" = "--if-needed" ] && [ -f "$OUT/gallery_bg.wasm" ] &&
  [ -z "$(find "$ROOT/gpui/crates" "$ROOT/app/globals.css" -newer "$OUT/gallery_bg.wasm" -type f -print -quit)" ]; then
  echo "GPUI demos are up to date ($OUT)."
  exit 0
fi

if [ -n "${VERCEL:-}${CI:-}" ]; then
  export CARGO_HOME="${CARGO_HOME:-$HOME/.cargo}" RUSTUP_HOME="${RUSTUP_HOME:-$HOME/.rustup}"
  if [ ! -x "$CARGO_HOME/bin/rustup" ]; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs |
      sh -s -- -y --profile minimal --default-toolchain stable --no-modify-path
  fi
  export PATH="$CARGO_HOME/bin:$PATH"
  rustup toolchain install stable --profile minimal --target wasm32-unknown-unknown
  rustup default stable
  if ! wasm-bindgen --version 2>/dev/null | grep -q "$WASM_BINDGEN_VERSION"; then
    mkdir -p "$HOME/.local/bin"
    curl -sSfL "https://github.com/wasm-bindgen/wasm-bindgen/releases/download/${WASM_BINDGEN_VERSION}/wasm-bindgen-${WASM_BINDGEN_VERSION}-x86_64-unknown-linux-musl.tar.gz" |
      tar -xz -C "$HOME/.local/bin" --strip-components=1 \
        "wasm-bindgen-${WASM_BINDGEN_VERSION}-x86_64-unknown-linux-musl/wasm-bindgen"
    export PATH="$HOME/.local/bin:$PATH"
  fi
elif ! command -v cargo >/dev/null 2>&1; then
  echo "warning: cargo not found; skipping the GPUI demos (the /docs/gpui examples won't load)." >&2
  exit 0
fi

bash "$ROOT/gpui/scripts/build-wasm.sh" "$OUT"
