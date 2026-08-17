import { sanitizeEditorSettings, type EditorSettings } from "./editorSettings";

const PRESETS_KEY = "icon-maker:presets:v1";
const MAX_PRESETS = 24;

export interface SavedPreset {
  id: string;
  name: string;
  settings: EditorSettings;
}

const cleanName = (name: string) =>
  name.trim().replace(/\s+/g, " ").slice(0, 48);

export const readPresets = (): SavedPreset[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRESETS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((preset): SavedPreset[] => {
      if (!preset || typeof preset !== "object") return [];
      const record = preset as Record<string, unknown>;
      if (typeof record.id !== "string" || typeof record.name !== "string")
        return [];
      return [
        {
          id: record.id,
          name: cleanName(record.name) || "Untitled preset",
          settings: sanitizeEditorSettings(record.settings),
        },
      ];
    });
  } catch {
    return [];
  }
};

export const writePresets = (presets: SavedPreset[]) =>
  localStorage.setItem(
    PRESETS_KEY,
    JSON.stringify(presets.slice(0, MAX_PRESETS)),
  );

export const createPreset = (
  name: string,
  settings: EditorSettings,
): SavedPreset => ({
  id: crypto.randomUUID(),
  name: cleanName(name) || "Untitled preset",
  settings,
});
