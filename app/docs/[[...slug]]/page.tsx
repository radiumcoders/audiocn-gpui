import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageActions } from "@/components/docs/page-actions";
import {
  buildCompactPrompt,
  buildGpuiCompactPrompt,
  markdownUrlFor,
} from "@/lib/docs/ai-prompt";
import { GPUI_BASE, frameworkOf, twinPath } from "@/lib/docs/framework";
import { gpuiModulePath } from "@/lib/docs/gpui-source";
import {
  registryItemForPath,
  registryItemPath,
  registryItemUrl,
} from "@/lib/docs/registry";
import { siteConfig } from "@/lib/site";
import { getPageMetadata } from "@/lib/social-metadata";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

/** A GPUI page's Rust module, as raw text the "Copy component source" action can fetch. */
const gpuiRawSourceUrl = (pathname: string): string | undefined => {
  const file = gpuiModulePath(pathname);
  return (
    file &&
    `https://raw.githubusercontent.com/${siteConfig.githubRepo}/main/${file}`
  );
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
  const gpui = frameworkOf(page.url) === "gpui";
  // A GPUI page gets the same actions as its React twin, for the Rust crate.
  const item = registryItemForPath(
    gpui ? twinPath(page.url, "react") : page.url
  );
  const gpuiSource = gpui ? gpuiRawSourceUrl(page.url) : undefined;

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      {item && gpuiSource && (
        <PageActions
          compactPrompt={buildGpuiCompactPrompt({
            pathname: page.url,
            title: page.data.title,
          })}
          installCommand="cargo add audiocn"
          language="rust"
          markdownUrl={markdownUrlFor(page.url)}
          sourceUrl={gpuiSource}
          title={page.data.title}
        />
      )}
      {item && !gpui && (
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
