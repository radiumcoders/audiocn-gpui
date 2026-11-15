"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GPUI_BASE, frameworkOf, twinPath } from "@/lib/docs/framework";
import type { Framework } from "@/lib/docs/framework";
import { cn } from "@/lib/utils";

const FRAMEWORKS: { label: string; title: string; value: Framework }[] = [
  { label: "React", title: "audiocn for React and shadcn/ui", value: "react" },
  { label: "GPUI", title: "audiocn for GPUI, in Rust", value: "gpui" },
];

/**
 * React | GPUI at the top of the docs sidebar. Switching keeps the current
 * page when it exists for the other framework, and opens that framework's
 * introduction otherwise.
 */
export const FrameworkSwitch = ({ urls }: { urls: string[] }) => {
  const pathname = usePathname();
  const current = frameworkOf(pathname);
  const known = new Set(urls);

  const hrefFor = (target: Framework) => {
    const twin = twinPath(pathname, target);
    if (known.has(twin)) {
      return twin;
    }
    return target === "gpui" ? GPUI_BASE : "/docs";
  };

  return (
    <nav
      aria-label="Framework"
      className="bg-muted/50 grid grid-cols-2 gap-0.5 rounded-lg border p-0.5"
    >
      {FRAMEWORKS.map((framework) =>
        framework.value === current ? (
          <span
            aria-current="page"
            className="bg-background text-foreground flex h-7 items-center justify-center rounded-md text-xs font-medium shadow-xs"
            key={framework.value}
            title={framework.title}
          >
            {framework.label}
          </span>
        ) : (
          <Link
            className={cn(
              "text-muted-foreground hover:text-foreground flex h-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
              "focus-visible:ring-ring outline-none focus-visible:ring-2"
            )}
            href={hrefFor(framework.value)}
            key={framework.value}
            title={framework.title}
          >
            {framework.label}
          </Link>
        )
      )}
    </nav>
  );
};
