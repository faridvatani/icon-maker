export type BlendMode = "normal" | "multiply" | "screen" | "overlay";

export interface IconShadow {
  color: string;
  x: number;
  y: number;
  blur: number;
  opacity: number;
}

export interface IconEffects {
  fill: string | null;
  strokeWidth: number;
  outlineColor: string | null;
  outlineWidth: number;
  shadows: IconShadow[];
  glowColor: string | null;
  glowBlur: number;
  glowOpacity: number;
  opacity: number;
  blendMode: BlendMode;
  duotoneColor: string | null;
  duotoneOpacity: number;
}

export interface BackgroundEffects {
  blur: number;
  grain: number;
  gradientRotate: number;
  spotlightX: number;
  spotlightY: number;
  spotlightOpacity: number;
  vignette: number;
  blendMode: BlendMode;
  distortion: number;
}

export const defaultIconEffects: IconEffects = {
  fill: null,
  strokeWidth: 2,
  outlineColor: null,
  outlineWidth: 0,
  shadows: [],
  glowColor: null,
  glowBlur: 0,
  glowOpacity: 0,
  opacity: 1,
  blendMode: "normal",
  duotoneColor: null,
  duotoneOpacity: 0,
};

export const defaultBackgroundEffects: BackgroundEffects = {
  blur: 0,
  grain: 0,
  gradientRotate: 0,
  spotlightX: 50,
  spotlightY: 50,
  spotlightOpacity: 0,
  vignette: 0,
  blendMode: "normal",
  distortion: 0,
};

const isColor = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
const numberInRange = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
const blendMode = (value: unknown): BlendMode =>
  value === "multiply" || value === "screen" || value === "overlay"
    ? value
    : "normal";

const sanitizeShadow = (value: unknown): IconShadow | null => {
  if (!value || typeof value !== "object") return null;
  const shadow = value as Record<string, unknown>;
  return {
    color: isColor(shadow.color) ? shadow.color : "#000000",
    x: numberInRange(shadow.x, 0, -48, 48),
    y: numberInRange(shadow.y, 8, -48, 48),
    blur: numberInRange(shadow.blur, 16, 0, 96),
    opacity: numberInRange(shadow.opacity, 0.25, 0, 1),
  };
};

export const sanitizeIconEffects = (value: unknown): IconEffects => {
  if (!value || typeof value !== "object") return defaultIconEffects;
  const effects = value as Record<string, unknown>;
  return {
    fill: isColor(effects.fill) ? effects.fill : null,
    strokeWidth: numberInRange(effects.strokeWidth, 2, 0.5, 8),
    outlineColor: isColor(effects.outlineColor) ? effects.outlineColor : null,
    outlineWidth: numberInRange(effects.outlineWidth, 0, 0, 12),
    shadows: Array.isArray(effects.shadows)
      ? effects.shadows
          .flatMap((shadow) => {
            const clean = sanitizeShadow(shadow);
            return clean ? [clean] : [];
          })
          .slice(0, 3)
      : [],
    glowColor: isColor(effects.glowColor) ? effects.glowColor : null,
    glowBlur: numberInRange(effects.glowBlur, 0, 0, 96),
    glowOpacity: numberInRange(effects.glowOpacity, 0, 0, 1),
    opacity: numberInRange(effects.opacity, 1, 0, 1),
    blendMode: blendMode(effects.blendMode),
    duotoneColor: isColor(effects.duotoneColor) ? effects.duotoneColor : null,
    duotoneOpacity: numberInRange(effects.duotoneOpacity, 0, 0, 1),
  };
};

export const sanitizeBackgroundEffects = (
  value: unknown,
): BackgroundEffects => {
  if (!value || typeof value !== "object") return defaultBackgroundEffects;
  const effects = value as Record<string, unknown>;
  return {
    blur: numberInRange(effects.blur, 0, 0, 32),
    grain: numberInRange(effects.grain, 0, 0, 1),
    gradientRotate: numberInRange(effects.gradientRotate, 0, 0, 360),
    spotlightX: numberInRange(effects.spotlightX, 50, 0, 100),
    spotlightY: numberInRange(effects.spotlightY, 50, 0, 100),
    spotlightOpacity: numberInRange(effects.spotlightOpacity, 0, 0, 1),
    vignette: numberInRange(effects.vignette, 0, 0, 1),
    blendMode: blendMode(effects.blendMode),
    distortion: numberInRange(effects.distortion, 0, 0, 1),
  };
};
