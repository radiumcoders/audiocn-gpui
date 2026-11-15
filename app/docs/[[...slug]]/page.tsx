import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GpuiPageActions } from "@/components/docs/gpui-page-actions";
import { PageActions } from "@/components/docs/page-actions";
import { buildCompactPrompt, markdownUrlFor } from "@/lib/docs/ai-prompt";
import { frameworkOf, GPUI_BASE } from "@/lib/docs/framework";
import {
  registryItemForPath,
  registryItemPath,
  registryItemUrl,
} from "@/lib/docs/registry";
import { siteConfig } from "@/lib/site";
import { getPageMetadata } from "@/lib/social-metadata";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

const GPUI_SECTIONS = new Set(["components", "blocks"]);

/** The Rust module behind a GPUI component or block page, on GitHub. */
const gpuiSourceUrl = (pathname: string): string | undefined => {
  const repo = `https://github.com/${siteConfig.githubRepo}`;
  if (pathname === GPUI_BASE) {
    return `${repo}/tree/main/gpui`;
  }
  const [section, slug, ...rest] = pathname
    .slice(GPUI_BASE.length + 1)
    .split("/");
  if (!GPUI_SECTIONS.has(section) || !slug || rest.length > 0) {
    return undefined;
  }
  return `${repo}/blob/main/gpui/crates/audiocn/src/${section}/${slug.replaceAll("-", "_")}.rs`;
};

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

const Page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const MdxContent = page.data.body;
  const item = registryItemForPath(page.url);
  const gpui = frameworkOf(page.url) === "gpui";

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      {gpui && (
        <GpuiPageActions
          markdownUrl={markdownUrlFor(page.url)}
          sourceUrl={gpuiSourceUrl(page.url)}
          title={page.data.title}
        />
      )}
      {item && (
        <PageActions
          compactPrompt={buildCompactPrompt({
            name: item.name,
            pathname: page.url,
            title: page.data.title,
          })}
          installCommand={`npx shadcn@latest add ${siteConfig.registryNamespace}/${item.name}`}
          markdownUrl={markdownUrlFor(page.url)}
          registryUrl={registryItemUrl(item.name)}
          sourceUrl={registryItemPath(item.name)}
          title={page.data.title}
        />
      )}
      <DocsBody>
        <MdxContent components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
};

export const generateStaticParams = () => source.generateParams();

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const isReactExample =
    page.url.startsWith("/docs/components/") ||
    page.url.startsWith("/docs/blocks/");
  const isGpuiExample =
    page.url.startsWith(`${GPUI_BASE}/components/`) ||
    page.url.startsWith(`${GPUI_BASE}/blocks/`);
  let defaultTitle = page.data.title;
  if (isReactExample) {
    defaultTitle = `${page.data.title} for React`;
  } else if (isGpuiExample) {
    defaultTitle = `${page.data.title} for GPUI`;
  }

  return getPageMetadata({
    description: page.data.seoDescription ?? page.data.description,
    pathname: page.url,
    title: page.data.seoTitle ?? defaultTitle,
  });
};

export default Page;
