import { BACKGROUND_IMAGES } from "@/features/editor/data/backgroundPresets";
import { GRADIENTS_BY_ID } from "@/features/editor/data/gradients";

export type HexColor = `#${string}`;

declare const backgroundImageBrand: unique symbol;
export type BundledBackgroundImage = string & {
  readonly [backgroundImageBrand]: true;
};

declare const gradientIdBrand: unique symbol;
export type GradientId = string & { readonly [gradientIdBrand]: true };

export type BackgroundValue = HexColor | BundledBackgroundImage;

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export const isHexColor = (value: unknown): value is HexColor =>
  typeof value === "string" && HEX_COLOR_PATTERN.test(value);

export const normalizeHexColor = (
  value: unknown,
  fallback: HexColor,
): HexColor => (isHexColor(value) ? value : fallback);

const backgroundImageValue = (file: string) =>
  `url("${import.meta.env.BASE_URL}backgrounds/${file}")` as BundledBackgroundImage;

export const BUNDLED_BACKGROUND_PRESETS = BACKGROUND_IMAGES.map(
  ({ name, file }) => ({
    name,
    background: backgroundImageValue(file),
  }),
);

const canonicalBackgrounds = new Set<BundledBackgroundImage>(
  BUNDLED_BACKGROUND_PRESETS.map(({ background }) => background),
);
const backgroundMigrations = new Map<string, BundledBackgroundImage>();

for (const { file } of BACKGROUND_IMAGES) {
  const canonical = backgroundImageValue(file);
  for (const path of [
    `backgrounds/${file}`,
    `/backgrounds/${file}`,
    `/icon-maker/backgrounds/${file}`,
  ]) {
    backgroundMigrations.set(`url("${path}")`, canonical);
  }
}

const nebulaBackground = backgroundImageValue("nebula.svg");
for (const path of [
  "backgrounds/aurora.svg",
  "/backgrounds/aurora.svg",
  "/icon-maker/backgrounds/aurora.svg",
]) {
  backgroundMigrations.set(`url("${path}")`, nebulaBackground);
}

export const isBundledBackgroundImage = (
  value: unknown,
): value is BundledBackgroundImage =>
  typeof value === "string" &&
  canonicalBackgrounds.has(value as BundledBackgroundImage);

export const normalizeBackgroundValue = (
  value: unknown,
  fallback: BackgroundValue,
): BackgroundValue => {
  if (isHexColor(value) || isBundledBackgroundImage(value)) return value;
  if (typeof value !== "string") return fallback;

  if (value.includes("images.unsplash.com")) return nebulaBackground;
  return backgroundMigrations.get(value) ?? fallback;
};

export const isGradientId = (value: unknown): value is GradientId =>
  typeof value === "string" && GRADIENTS_BY_ID.has(value);

export const normalizeGradientId = (value: unknown): GradientId | null =>
  isGradientId(value) ? value : null;
