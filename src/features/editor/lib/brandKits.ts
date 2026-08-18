import { normalizeExportOptions, type ExportOptions } from "./exportPng";
import { sanitizeEditorSettings, type EditorSettings } from "./editorSettings";
import { isHexColor, type HexColor } from "./styleValues";
import {
  normalizeSavedName,
  readSavedCollection,
  writeSavedCollection,
} from "./savedCollections";

const BRAND_KITS_KEY = "icon-maker:brand-kits:v1";
const LIMIT = 12;

export interface BrandKit {
  id: string;
  name: string;
  palette: HexColor[];
  defaults: EditorSettings;
  exportOptions: ExportOptions;
}

const UNTITLED_BRAND_KIT = "Untitled brand kit";

const normalizeBrandKitName = (name: string) =>
  normalizeSavedName(name, UNTITLED_BRAND_KIT);

const normalizeBrandKit = (item: unknown): BrandKit | null => {
  if (!item || typeof item !== "object") return null;
  const value = item as Record<string, unknown>;
  if (typeof value.id !== "string" || typeof value.name !== "string")
    return null;

  return {
    id: value.id,
    name: normalizeBrandKitName(value.name),
    palette: Array.isArray(value.palette)
      ? value.palette.filter(isHexColor).slice(0, 8)
      : [],
    defaults: sanitizeEditorSettings(value.defaults),
    exportOptions: normalizeExportOptions(value.exportOptions),
  };
};

export const readBrandKits = (): BrandKit[] =>
  readSavedCollection(BRAND_KITS_KEY, normalizeBrandKit, LIMIT);

export const writeBrandKits = (kits: BrandKit[]) =>
  writeSavedCollection(BRAND_KITS_KEY, kits, normalizeBrandKit, LIMIT);

export const createBrandKit = (
  name: string,
  defaults: EditorSettings,
  exportOptions: ExportOptions,
): BrandKit => ({
  id: crypto.randomUUID(),
  name: normalizeBrandKitName(name),
  palette: [
    ...new Set(
      [
        defaults.iconColor,
        defaults.bgColor,
        defaults.iconEffects.fill,
        defaults.iconEffects.duotoneColor,
      ].filter(isHexColor),
    ),
  ].slice(0, 8),
  defaults,
  exportOptions,
});
