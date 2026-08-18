import { normalizeIconValue, type IconValue } from "./iconTypes";
import {
  defaultBackgroundEffects,
  defaultIconEffects,
  sanitizeBackgroundEffects,
  sanitizeIconEffects,
  type BackgroundEffects,
  type IconEffects,
} from "./effects";

export interface EditorSettings {
  icon: IconValue;
  iconColor: string;
  iconSize: number;
  iconRotate: number;
  bgColor: string;
  bgGradientId: string | null;
  bgRounded: number;
  bgPadding: number;
  iconEffects: IconEffects;
  backgroundEffects: BackgroundEffects;
}

export const defaultEditorSettings: EditorSettings = {
  icon: "FaceSlightlySmiling",
  iconColor: "#09203f",
  iconSize: 280,
  iconRotate: 0,
  bgColor: "#E2E2E2",
  bgGradientId: null,
  bgRounded: 30,
  bgPadding: 10,
  iconEffects: defaultIconEffects,
  backgroundEffects: defaultBackgroundEffects,
};

const readString = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;

const readNumber = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;

export const sanitizeEditorSettings = (value: unknown): EditorSettings => {
  if (!value || typeof value !== "object") return defaultEditorSettings;

  const stored = value as Record<string, unknown>;
  const storedBackground = readString(
    stored.bgColor,
    defaultEditorSettings.bgColor,
  );
  const bgColor = storedBackground.includes("images.unsplash.com")
    ? `url("${import.meta.env.BASE_URL}backgrounds/nebula.svg")`
    : storedBackground;

  return {
    icon: normalizeIconValue(stored.icon),
    iconColor: readString(stored.iconColor, defaultEditorSettings.iconColor),
    iconSize: readNumber(
      stored.iconSize,
      defaultEditorSettings.iconSize,
      16,
      512,
    ),
    iconRotate: readNumber(
      stored.iconRotate,
      defaultEditorSettings.iconRotate,
      0,
      360,
    ),
    bgColor,
    bgGradientId:
      typeof stored.bgGradientId === "string" ? stored.bgGradientId : null,
    bgRounded: readNumber(
      stored.bgRounded,
      defaultEditorSettings.bgRounded,
      0,
      512,
    ),
    bgPadding: readNumber(
      stored.bgPadding,
      defaultEditorSettings.bgPadding,
      0,
      100,
    ),
    iconEffects: sanitizeIconEffects(stored.iconEffects),
    backgroundEffects: sanitizeBackgroundEffects(stored.backgroundEffects),
  };
};

export const editorSettingsEqual = (
  left: EditorSettings,
  right: EditorSettings,
) => JSON.stringify(left) === JSON.stringify(right);
