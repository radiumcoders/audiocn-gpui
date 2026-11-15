"use client";

import {
  GithubLogoIcon,
  MarkdownLogoIcon,
  TerminalIcon,
} from "@phosphor-icons/react";
import { useRef } from "react";
import { toast } from "sonner";

import { CopyStateIcon } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export const GPUI_INSTALL_COMMAND = "cargo add audiocn";

interface GpuiPageActionsProps {
  /** The Markdown twin of this page. */
  markdownUrl: string;
  /** The Rust source on GitHub, when the page documents one module. */
  sourceUrl?: string;
  title: string;
}

/** The GPUI pages' actions: copy the install command or the page, view the Rust. */
export const GpuiPageActions = ({
  markdownUrl,
  sourceUrl,
  title,
}: GpuiPageActionsProps) => {
  const success = useRef("Copied");
  const install = useCopyToClipboard({
    onCopyError: () => toast.error("Could not copy to clipboard"),
    onCopySuccess: () => toast.success(success.current),
  });
  const page = useCopyToClipboard({
    onCopyError: () => toast.error("Could not copy to clipboard"),
    onCopySuccess: () => toast.success(`${title} copied as Markdown`),
  });

  return (
    <div className="not-prose mb-6 flex flex-wrap items-center gap-1">
      <Button
        onClick={() => {
          success.current = "Install command copied";
          install.copy(GPUI_INSTALL_COMMAND);
        }}
        size="sm"
        variant="secondary"
      >
        <CopyStateIcon idleIcon={<TerminalIcon />} state={install.state} />
        <code className="font-mono text-xs">{GPUI_INSTALL_COMMAND}</code>
      </Button>
      <Button
        onClick={() =>
          page.copy(async () => {
            const response = await fetch(markdownUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${markdownUrl}`);
            }
            return response.text();
          })
        }
        size="sm"
        variant="ghost"
      >
        <CopyStateIcon idleIcon={<MarkdownLogoIcon />} state={page.state} />
        Copy page
      </Button>
      {sourceUrl && (
        <Button
          nativeButton={false}
          render={
            <a
              aria-label="Rust source on GitHub"
              href={sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            />
          }
          size="sm"
          variant="ghost"
        >
          <GithubLogoIcon />
          Rust source
        </Button>
      )}
    </div>
  );
};
