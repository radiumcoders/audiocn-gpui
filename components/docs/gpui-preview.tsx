"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";

import { useSiteTheme } from "@/components/docs/theme-picker";
import { cn } from "@/lib/utils";

interface GpuiPreviewProps {
  className?: string;
  /** The gallery page, as in `crates/gallery/src/demos` (`knob`, `level-meter`). */
  demo: string;
  /** Load straight away instead of when scrolled near. */
  eager?: boolean;
  /** Height before the demo has measured itself, in CSS pixels. */
  initialHeight?: number;
  /** The example on that page; `default` is the first one. */
  variant?: string;
}

const subscribeNothing = () => () => {
  // Nothing changes: the value only differs between server and client.
};
const MIN_HEIGHT = 288;

/** Where the wasm build of the gallery lives (`pnpm gpui:build`). */
export const GPUI_DEMO_ROOT = process.env.NEXT_PUBLIC_GPUI_DEMO_ROOT ?? "/gpui";

/**
 * A live GPUI example: the real Rust component, compiled to WebAssembly and
 * drawn by GPUI's web platform. GPUI owns the whole document it runs in, so
 * each example is its own iframe; the wasm module is shared through the HTTP
 * cache. The demo reports its height, and follows the site's light/dark mode
 * and colour theme.
 */
export const GpuiPreview = ({
  className,
  demo,
  eager,
  initialHeight = MIN_HEIGHT,
  variant = "default",
}: GpuiPreviewProps) => {
  const { resolvedTheme } = useTheme();
  const [preset] = useSiteTheme();
  // Wait for the client, so the iframe loads once and in the right theme.
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  );
  const frame = useRef<HTMLIFrameElement>(null);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [height, setHeight] = useState(initialHeight);
  const [failed, setFailed] = useState(false);

  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const params = new URLSearchParams({ demo, preset, theme, variant });
  const src = mounted ? `${GPUI_DEMO_ROOT}/index.html?${params}` : null;
  const ready = src !== null && readySrc === src;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const iframe = frame.current;
      if (!iframe || event.source !== iframe.contentWindow) {
        return;
      }
      const data = event.data as { type?: string; height?: number };
      if (data?.type === "audiocn-gpui:ready") {
        setReadySrc(iframe.getAttribute("src"));
      } else if (
        data?.type === "audiocn-gpui:size" &&
        typeof data.height === "number"
      ) {
        setHeight(Math.max(MIN_HEIGHT, Math.ceil(data.height)));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div
      className={cn("relative h-(--gpui-height) w-full", className)}
      data-slot="gpui-preview"
      style={{ "--gpui-height": `${height}px` } as CSSProperties}
    >
      {src && (
        // The demo is this site's own page; it needs scripts and its origin to load the wasm.
        // oxlint-disable-next-line react/iframe-missing-sandbox
        <iframe
          className={cn(
            "absolute inset-0 size-full rounded-xl border-0 transition-opacity duration-300",
            ready ? "opacity-100" : "opacity-0"
          )}
          key={src}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          ref={frame}
          src={src}
          title={`${demo} ${variant} — live GPUI example`}
        />
      )}
      <div
        aria-hidden={ready}
        className={cn(
          "text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-xs tracking-widest uppercase transition-opacity duration-300",
          ready ? "opacity-0" : "opacity-100"
        )}
      >
        {failed ? "GPUI demo not built" : "Loading GPUI"}
      </div>
    </div>
  );
};
