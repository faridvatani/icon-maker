import { sanitizeEditorSettings, type EditorSettings } from "./editorSettings";
import {
  normalizeSavedName,
  readSavedCollection,
  writeSavedCollection,
} from "./savedCollections";

const PRESETS_KEY = "icon-maker:presets:v1";
const MAX_PRESETS = 24;

export interface SavedPreset {
  id: string;
  name: string;
  settings: EditorSettings;
}

const UNTITLED_PRESET = "Untitled preset";

const normalizePreset = (value: unknown): SavedPreset | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string")
    return null;

  return {
    id: record.id,
    name: normalizeSavedName(record.name, UNTITLED_PRESET),
    settings: sanitizeEditorSettings(record.settings),
  };
};

export const readPresets = (): SavedPreset[] =>
  readSavedCollection(PRESETS_KEY, normalizePreset, MAX_PRESETS);

export const writePresets = (presets: SavedPreset[]) =>
  writeSavedCollection(PRESETS_KEY, presets, normalizePreset, MAX_PRESETS);

export const createPreset = (
  name: string,
  settings: EditorSettings,
): SavedPreset => ({
  id: crypto.randomUUID(),
  name: normalizeSavedName(name, UNTITLED_PRESET),
  settings,
});
