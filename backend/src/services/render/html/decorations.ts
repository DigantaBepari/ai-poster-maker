import type { LayoutConfig } from "../../../types/shared.js";
import type { Suggestion } from "../../gemini/gemini.schema.js";
export function decorations(layout: LayoutConfig, s: Suggestion) {
  const c = s.colorScheme;
  const items = layout.decorations
    .map((d) => {
      const color =
        d.type === "footer"
          ? c.footerBg
          : d.type === "circle"
            ? c.footerBg
            : c.accent;
      switch (d.type) {
        case "border":
          return (
            '<rect x="' +
            d.x +
            '" y="' +
            d.y +
            '" width="' +
            d.w +
            '" height="' +
            d.h +
            '" fill="none" stroke="' +
            color +
            '" stroke-width="5"/><rect x="' +
            (d.x + 12) +
            '" y="' +
            (d.y + 12) +
            '" width="' +
            (d.w - 24) +
            '" height="' +
            (d.h - 24) +
            '" fill="none" stroke="' +
            color +
            '"/>'
          );
        case "footer":
          return (
            '<rect x="' +
            d.x +
            '" y="' +
            d.y +
            '" width="' +
            d.w +
            '" height="' +
            d.h +
            '" fill="' +
            color +
            '"/>'
          );
        case "circle":
          return (
            '<ellipse cx="' +
            (d.x + d.w / 2) +
            '" cy="' +
            (d.y + d.h / 2) +
            '" rx="' +
            d.w / 2 +
            '" ry="' +
            d.h / 2 +
            '" fill="' +
            color +
            '" opacity=".7"/>'
          );
        case "rice-paddy":
          return (
            '<g transform="translate(' +
            d.x +
            " " +
            d.y +
            ')" stroke="' +
            color +
            '" fill="' +
            color +
            '"><path d="M0 160Q25 55 85 0M25 160Q40 65 110 25" fill="none" stroke-width="3"/>' +
            [0, 1, 2, 3]
              .map(
                (i) =>
                  '<ellipse cx="' +
                  (85 - i * 13) +
                  '" cy="' +
                  i * 22 +
                  '" rx="5" ry="12" transform="rotate(30 ' +
                  (85 - i * 13) +
                  " " +
                  i * 22 +
                  ')"/>',
              )
              .join("") +
            "</g>"
          );
        case "flourish":
          return (
            '<path d="M40 120Q40 40 120 40M760 120Q760 40 680 40" fill="none" stroke="' +
            color +
            '" stroke-width="3"/>'
          );
      }
    })
    .join("");
  const extras = s.decorations
    .map((kind) =>
      kind === "flag-bands"
        ? '<path d="M30 60H770" stroke="' + c.primary + '" stroke-width="20"/>'
        : kind === "doves"
          ? '<path d="M320 640q40-65 80 0q40-65 80 0q-65-20-80 40q-15-60-80-40" fill="' +
            c.accent +
            '" opacity=".65"/>'
          : kind === "floral"
            ? '<g stroke="' +
              c.accent +
              '" fill="none" opacity=".65"><path d="M70 520q40 100 0 220M730 520q-40 100 0 220"/>' +
              [540, 590, 640, 690]
                .map(
                  (y) =>
                    '<circle cx="70" cy="' +
                    y +
                    '" r="8"/><circle cx="730" cy="' +
                    y +
                    '" r="8"/>',
                )
                .join("") +
              "</g>"
            : kind === "rice-paddy"
              ? '<path d="M60 760Q90 650 140 600M740 760Q710 650 660 600" fill="none" stroke="' +
                c.accent +
                '" stroke-width="4"/>'
              : "",
    )
    .join("");
  return (
    '<svg class="motifs" xmlns="http://www.w3.org/2000/svg" width="' +
    layout.canvas.width +
    '" height="' +
    layout.canvas.height +
    '" viewBox="0 0 ' +
    layout.canvas.width +
    " " +
    layout.canvas.height +
    '">' +
    items +
    extras +
    "</svg>"
  );
}
