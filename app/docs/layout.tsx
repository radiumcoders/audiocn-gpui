import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { FrameworkSwitch } from "@/components/docs/framework-switch";
import { pageUrls } from "@/lib/docs/framework";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

// The GPUI docs aren't listed in the root meta.json, so they sit in the
// tree's fallback and the sidebar shows one framework at a time: the GPUI
// folder is a root folder, shown alone on its pages.
const tree = source.getPageTree();

const Layout = ({ children }: { children: React.ReactNode }) => (
  <DocsLayout
    sidebar={{
      // Fumadocs renders the banner in a list of sidebar header items.
      banner: <FrameworkSwitch key="framework" urls={pageUrls(tree)} />,
    }}
    tabs={false}
    tree={tree}
    {...baseOptions({ docs: true })}
  >
    {children}
  </DocsLayout>
);

export default Layout;
