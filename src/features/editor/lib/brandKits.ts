import { normalizeExportOptions, type ExportOptions } from "./exportPng";
import { sanitizeEditorSettings, type EditorSettings } from "./editorSettings";

const BRAND_KITS_KEY = "icon-maker:brand-kits:v1";
const LIMIT = 12;

export interface BrandKit {
  id: string;
  name: string;
  palette: string[];
  defaults: EditorSettings;
  exportOptions: ExportOptions;
}

const cleanName = (name: string) =>
  name.trim().replace(/\s+/g, " ").slice(0, 48) || "Untitled brand kit";
const isColor = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

export const readBrandKits = (): BrandKit[] => {
  try {
    const data = JSON.parse(localStorage.getItem(BRAND_KITS_KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data
      .flatMap((item): BrandKit[] => {
        if (!item || typeof item !== "object") return [];
        const value = item as Record<string, unknown>;
        if (typeof value.id !== "string" || typeof value.name !== "string")
          return [];
        return [
          {
            id: value.id,
            name: cleanName(value.name),
            palette: Array.isArray(value.palette)
              ? value.palette.filter(isColor).slice(0, 8)
              : [],
            defaults: sanitizeEditorSettings(value.defaults),
            exportOptions: normalizeExportOptions(value.exportOptions),
          },
        ];
      })
      .slice(0, LIMIT);
  } catch {
    return [];
  }
};

export const writeBrandKits = (kits: BrandKit[]) =>
  localStorage.setItem(BRAND_KITS_KEY, JSON.stringify(kits.slice(0, LIMIT)));

export const createBrandKit = (
  name: string,
  defaults: EditorSettings,
  exportOptions: ExportOptions,
): BrandKit => ({
  id: crypto.randomUUID(),
  name: cleanName(name),
  palette: [
    ...new Set(
      [
        defaults.iconColor,
        defaults.bgColor,
        defaults.iconEffects.fill,
        defaults.iconEffects.duotoneColor,
      ].filter(isColor),
    ),
  ].slice(0, 8),
  defaults,
  exportOptions,
});
