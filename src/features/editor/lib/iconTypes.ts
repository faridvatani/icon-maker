import type { icons } from "lucide-react";
import { resolveIconName } from "@/features/editor/data/iconConstants";
import type { IconName as StaticIconName } from "@/features/editor/data/iconRegistry";

export type CatalogIconName = keyof typeof icons;
export type CatalogIconValue = `library:${CatalogIconName}`;
export type CustomIconValue = `custom:${string}`;
export type IconValue = StaticIconName | CatalogIconValue | CustomIconValue;

export const isCatalogIconValue = (
  value: IconValue | string,
): value is CatalogIconValue => value.startsWith("library:");

export const isCustomIconValue = (
  value: IconValue | string,
): value is CustomIconValue =>
  value.startsWith("custom:") && value.length > "custom:".length;

export const getCatalogIconName = (value: CatalogIconValue): CatalogIconName =>
  value.slice("library:".length) as CatalogIconName;

export const normalizeIconValue = (value: unknown): IconValue => {
  if (typeof value !== "string") return "FaceSlightlySmiling";
  if (value.startsWith("custom:")) {
    return isCustomIconValue(value) ? value : "FaceSlightlySmiling";
  }
  if (isCustomIconValue(value)) return value;
  if (value.startsWith("library:") && value.length > "library:".length) {
    return value as CatalogIconValue;
  }
  return resolveIconName(value);
};

export const formatIconLabel = (value: IconValue): string => {
  if (isCustomIconValue(value)) return "Custom SVG";
  const name = isCatalogIconValue(value) ? getCatalogIconName(value) : value;
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};
