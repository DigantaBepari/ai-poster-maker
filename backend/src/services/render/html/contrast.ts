const luminance = (hex: string) => {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
const ratio = (a: string, b: string) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
export function readableColor(preferred: string, backgrounds: string[]) {
  if (backgrounds.every((bg) => ratio(preferred, bg) >= 3)) return preferred;
  const score = (c: string) =>
    Math.min(...backgrounds.map((bg) => ratio(c, bg)));
  return score("#ffffff") >= score("#111111") ? "#ffffff" : "#111111";
}
