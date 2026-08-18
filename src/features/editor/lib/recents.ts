import { isCustomIconValue, type IconValue } from "./iconTypes";
import { readJson, writeJson } from "./safeStorage";
import {
  isGradientId,
  normalizeGradientId,
  type GradientId,
} from "./styleValues";

const RECENTS_KEY = "icon-maker:recents:v1";
const LIMIT = 12;

export interface RecentSelections {
  icons: IconValue[];
  gradients: GradientId[];
}

const emptyRecents: RecentSelections = { icons: [], gradients: [] };
const moveToFront = <T>(items: T[], item: T) =>
  [item, ...items.filter((value) => value !== item)].slice(0, LIMIT);

export const readRecents = (): RecentSelections => {
  const result = readJson(RECENTS_KEY);
  if (!result.ok || !result.value || typeof result.value !== "object")
    return emptyRecents;

  const value = result.value as Partial<RecentSelections>;
  return {
    icons: Array.isArray(value.icons)
      ? value.icons
          .filter(
            (icon): icon is IconValue =>
              typeof icon === "string" &&
              (isCustomIconValue(icon) || icon.length > 0),
          )
          .slice(0, LIMIT)
      : [],
    gradients: Array.isArray(value.gradients)
      ? value.gradients.filter(isGradientId).slice(0, LIMIT)
      : [],
  };
};

export const recordRecentIcon = (icon: IconValue) => {
  const current = readRecents();
  return writeJson(RECENTS_KEY, {
    ...current,
    icons: moveToFront(current.icons, icon),
  });
};

export const recordRecentGradient = (gradientId: string) => {
  const validGradientId = normalizeGradientId(gradientId);
  if (!validGradientId) return { ok: true } as const;
  const current = readRecents();
  return writeJson(RECENTS_KEY, {
    ...current,
    gradients: moveToFront(current.gradients, validGradientId),
  });
};
