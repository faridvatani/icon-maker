import { GRADIENTS_BY_ID } from "@/features/editor/data/gradients";
import { isCustomIconValue, type IconValue } from "./iconTypes";

const RECENTS_KEY = "icon-maker:recents:v1";
const LIMIT = 12;

export interface RecentSelections {
  icons: IconValue[];
  gradients: string[];
}

const emptyRecents: RecentSelections = { icons: [], gradients: [] };
const moveToFront = <T>(items: T[], item: T) =>
  [item, ...items.filter((value) => value !== item)].slice(0, LIMIT);

export const readRecents = (): RecentSelections => {
  try {
    const value = JSON.parse(
      localStorage.getItem(RECENTS_KEY) ?? "{}",
    ) as Partial<RecentSelections>;
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
        ? value.gradients
            .filter(
              (id): id is string =>
                typeof id === "string" && GRADIENTS_BY_ID.has(id),
            )
            .slice(0, LIMIT)
        : [],
    };
  } catch {
    return emptyRecents;
  }
};

export const recordRecentIcon = (icon: IconValue) => {
  const current = readRecents();
  localStorage.setItem(
    RECENTS_KEY,
    JSON.stringify({ ...current, icons: moveToFront(current.icons, icon) }),
  );
};

export const recordRecentGradient = (gradientId: string) => {
  if (!GRADIENTS_BY_ID.has(gradientId)) return;
  const current = readRecents();
  localStorage.setItem(
    RECENTS_KEY,
    JSON.stringify({
      ...current,
      gradients: moveToFront(current.gradients, gradientId),
    }),
  );
};
