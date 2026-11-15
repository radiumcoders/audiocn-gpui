import { ServerCodeBlock } from "fumadocs-ui/components/codeblock.rsc";

import { ComponentPreviewTabs } from "@/components/docs/component-preview-tabs";
import { GpuiPreview } from "@/components/docs/gpui-preview";
import { codeThemes } from "@/lib/docs/code-themes";
import { readGpuiExample } from "@/lib/docs/gpui-source";

interface GpuiExampleProps {
  /** Rust to show in the Code tab instead of the gallery's source. */
  code?: string;
  /** The gallery page (`knob`). */
  demo: string;
  eager?: boolean;
  /** Height before the demo measures itself. */
  height?: number;
  /** The example on that page; `default` is the first one. */
  variant?: string;
}

/**
 * `<ComponentPreview>` for GPUI: the live wasm example, and the Rust that
 * draws it, read from the gallery crate so it can't drift.
 */
export const GpuiExample = async ({
  code,
  demo,
  eager,
  height,
  variant = "default",
}: GpuiExampleProps) => {
  const source = code ?? (await readGpuiExample(demo, variant));

  return (
    <ComponentPreviewTabs
      className="p-0 sm:p-0"
      code={<ServerCodeBlock code={source} lang="rust" themes={codeThemes} />}
      preview={
        <GpuiPreview
          className="rounded-xl"
          demo={demo}
          eager={eager}
          initialHeight={height}
          variant={variant}
        />
      }
    />
  );
};
