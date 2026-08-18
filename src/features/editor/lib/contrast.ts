export interface ContrastResult {
  ratio: number;
  suggestedColor: "#000000" | "#ffffff";
  currentRatio: number;
  suggestions: Array<"#000000" | "#ffffff">;
}

const hexToRgb = (color: HexColor) => {
  const matched = /^#([0-9a-f]{6})$/i.exec(color);
  if (!matched) return null;
  const value = Number.parseInt(matched[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
};

const luminance = (channel: number) => {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (red: number, green: number, blue: number) =>
  0.2126 * luminance(red) +
  0.7152 * luminance(green) +
  0.0722 * luminance(blue);

const contrastRatio = (foreground: number, background: number) =>
  (Math.max(foreground, background) + 0.05) /
  (Math.min(foreground, background) + 0.05);

export const assessContrast = (
  pixels: Uint8ClampedArray,
  currentColor: HexColor = "#000000",
): ContrastResult => {
  let blackWorst = Infinity;
  let whiteWorst = Infinity;
  const currentRgb = hexToRgb(currentColor) ?? [0, 0, 0];
  const currentLuminance = relativeLuminance(...currentRgb);
  let currentWorst = Infinity;
  for (let index = 0; index < pixels.length; index += 4) {
    const background = relativeLuminance(
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
    );
    blackWorst = Math.min(blackWorst, contrastRatio(0, background));
    whiteWorst = Math.min(whiteWorst, contrastRatio(1, background));
    currentWorst = Math.min(
      currentWorst,
      contrastRatio(currentLuminance, background),
    );
  }
  const suggestedColor = whiteWorst > blackWorst ? "#ffffff" : "#000000";
  return {
    ratio: Math.max(blackWorst, whiteWorst),
    suggestedColor,
    currentRatio: currentWorst,
    suggestions:
      suggestedColor === "#ffffff"
        ? ["#ffffff", "#000000"]
        : ["#000000", "#ffffff"],
  };
};
import type { HexColor } from "./styleValues";
