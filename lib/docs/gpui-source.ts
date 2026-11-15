import { readSource } from "@/lib/docs/read-source";

const GALLERY_DEMOS = "gpui/crates/gallery/src/demos";

/** The gallery file for a docs slug: `level-meter` → `level_meter.rs`. */
export const gpuiDemoPath = (demo: string): string =>
  `${GALLERY_DEMOS}/${demo.replaceAll("-", "_")}.rs`;

const escape = (text: string) =>
  text.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");

/** From the `{` at `open`, the index just past its matching `}`. */
const matchBrace = (code: string, open: number): number => {
  let depth = 0;
  let inString = false;
  for (let i = open; i < code.length; i += 1) {
    const char = code[i];
    if (inString) {
      if (char === "\\") {
        i += 1;
      } else if (char === '"') {
        inString = false;
      }
    } else if (char === '"') {
      inString = true;
    } else if (char === "/" && code[i + 1] === "/") {
      i = code.indexOf("\n", i);
      if (i === -1) {
        return code.length;
      }
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return i + 1;
      }
    }
  }
  return code.length;
};

/** `fn name(...)` with its doc comment, or undefined. */
const extractFn = (code: string, name: string): string | undefined => {
  const match = new RegExp(
    `^(?:[ \\t]*///.*\\n)*[ \\t]*(?:pub(?:\\([^)]*\\))? )?fn ${escape(name)}\\b`,
    "mu"
  ).exec(code);
  if (!match) {
    return undefined;
  }
  const open = code.indexOf("{", match.index + match[0].length);
  if (open === -1) {
    return undefined;
  }
  return code.slice(match.index, matchBrace(code, open));
};

const DEVICE = "_device";

/**
 * The Rust behind one gallery example: the function that `render` calls for
 * `variant` (`"metal" => metal(cx)`), or the whole file when there's no
 * single function to show. Some examples have a `<name>_device` twin for
 * native builds with the `device` feature.
 */
export const readGpuiExample = async (
  demo: string,
  variant = "default"
): Promise<string> => {
  const code = await readSource(gpuiDemoPath(demo));
  const arm = new RegExp(
    `"${escape(variant)}"\\s*=>\\s*(?:\\{\\s*)?(?:#\\[[^\\]]*\\]\\s*\\{?\\s*)*([a-z_][a-z0-9_]*)\\s*\\(`,
    "u"
  ).exec(code);
  if (!arm) {
    return code;
  }
  const [, name] = arm;
  const base = name.endsWith(DEVICE) ? name.slice(0, -DEVICE.length) : name;
  // A microphone example's native twin opens the real microphone, which is
  // what readers want to copy; elsewhere the portable function is the point.
  const order = variant.includes("microphone")
    ? [`${base}${DEVICE}`, base]
    : [base, `${base}${DEVICE}`];
  return extractFn(code, order[0]) ?? extractFn(code, order[1]) ?? code;
};
