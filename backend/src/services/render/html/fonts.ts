import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
let cached: Promise<string> | undefined;
export function embeddedFonts() {
  cached ??= Promise.all(
    [
      [
        "Noto Sans Bengali",
        "@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-400-normal.woff2",
        "400",
      ],
      [
        "Noto Sans Bengali",
        "@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-700-normal.woff2",
        "700",
      ],
      [
        "Hind Siliguri",
        "@fontsource/hind-siliguri/files/hind-siliguri-bengali-700-normal.woff2",
        "700",
      ],
      [
        "Tiro Bangla",
        "@fontsource/tiro-bangla/files/tiro-bangla-bengali-400-normal.woff2",
        "400",
      ],
      [
        "Noto Sans Bengali",
        "@fontsource/noto-sans-bengali/files/noto-sans-bengali-latin-400-normal.woff2",
        "400",
      ],
      [
        "Noto Sans Bengali",
        "@fontsource/noto-sans-bengali/files/noto-sans-bengali-latin-700-normal.woff2",
        "700",
      ],
    ].map(async ([name, file, weight]) => {
      const data = await readFile(require.resolve(file));
      return (
        '@font-face{font-family:"' +
        name +
        '";font-weight:' +
        weight +
        ";src:url(data:font/woff2;base64," +
        data.toString("base64") +
        ') format("woff2");font-display:block;}'
      );
    }),
  ).then((f) => f.join(""));
  return cached;
}
