import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { FrameworkSwitch } from "@/components/docs/framework-switch";
import { pageUrls, splitFrameworks } from "@/lib/docs/framework";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

const tree = splitFrameworks(source.getPageTree());

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
