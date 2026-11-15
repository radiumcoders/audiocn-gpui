import type { Folder, Node, Root } from "fumadocs-core/page-tree";

/**
 * audiocn ships for two frameworks: the React registry (`/docs/...`) and the
 * Rust crate for GPUI (`/docs/gpui/...`). Both use the same slugs, so a page
 * in one has its twin at the same path in the other.
 */
export type Framework = "react" | "gpui";

export const GPUI_BASE = "/docs/gpui";

export const frameworkOf = (pathname: string): Framework =>
  pathname === GPUI_BASE || pathname.startsWith(`${GPUI_BASE}/`)
    ? "gpui"
    : "react";

/** `pathname`'s twin in `target`, without checking that the page exists. */
export const twinPath = (pathname: string, target: Framework): string => {
  const from = frameworkOf(pathname);
  if (from === target) {
    return pathname;
  }
  if (target === "gpui") {
    return `${GPUI_BASE}${pathname.slice("/docs".length)}`;
  }
  return `/docs${pathname.slice(GPUI_BASE.length)}`;
};

const isGpuiFolder = (node: Node): node is Folder =>
  node.type === "folder" &&
  (node.index?.url === GPUI_BASE ||
    node.children.some(
      (child) => child.type === "page" && frameworkOf(child.url) === "gpui"
    ) ||
    node.$id?.endsWith("gpui") === true);

/**
 * Splits the docs tree into a React root and the GPUI root, so the sidebar
 * shows one framework at a time: Fumadocs shows the root folder that holds the
 * current page.
 */
export const splitFrameworks = (tree: Root): Root => {
  const gpui = tree.children.find(isGpuiFolder);
  if (!gpui) {
    return tree;
  }
  const react: Folder = {
    $id: "react",
    children: tree.children.filter((node) => node !== gpui),
    name: "React",
    root: true,
    type: "folder",
  };
  return {
    ...tree,
    children: [react, { ...gpui, root: true }],
  };
};

/** Every page URL in the tree, for the switch to know which twins exist. */
export const pageUrls = (tree: Root): string[] => {
  const urls: string[] = [];
  const visit = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.type === "page") {
        urls.push(node.url);
      } else if (node.type === "folder") {
        if (node.index) {
          urls.push(node.index.url);
        }
        visit(node.children);
      }
    }
  };
  visit(tree.children);
  return urls;
};
