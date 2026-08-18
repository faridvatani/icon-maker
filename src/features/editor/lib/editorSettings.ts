import { normalizeIconValue, type IconValue } from "./iconTypes";
import {
  defaultBackgroundEffects,
  defaultIconEffects,
  sanitizeBackgroundEffects,
  sanitizeIconEffects,
  type BackgroundEffects,
  type IconEffects,
} from "./effects";
import {
  normalizeBackgroundValue,
  normalizeGradientId,
  normalizeHexColor,
  type BackgroundValue,
  type GradientId,
  type HexColor,
} from "./styleValues";

export interface EditorSettings {
  icon: IconValue;
  iconColor: HexColor;
  iconSize: number;
  iconRotate: number;
  bgColor: BackgroundValue;
  bgGradientId: GradientId | null;
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
  return {
    icon: normalizeIconValue(stored.icon),
    iconColor: normalizeHexColor(
      stored.iconColor,
      defaultEditorSettings.iconColor,
    ),
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
    bgColor: normalizeBackgroundValue(
      stored.bgColor,
      defaultEditorSettings.bgColor,
    ),
    bgGradientId: normalizeGradientId(stored.bgGradientId),
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
