import {
  defaultEditorSettings,
  sanitizeEditorSettings,
  type EditorSettings,
} from "./editorSettings";
import {
  readFirstJson,
  writeJson,
  type StorageWriteResult,
} from "./safeStorage";

export const EDITOR_SETTINGS_KEY = "icon-maker:settings:v4";
export const PREVIOUS_EDITOR_SETTINGS_KEYS = [
  "icon-maker:settings:v3",
  "icon-maker:settings:v2",
  "value",
] as const;

export interface PersistedEditorSettings {
  settings: EditorSettings;
  sourceKey: string | null;
  needsMigration: boolean;
}

export const readPersistedEditorSettings = (): PersistedEditorSettings => {
  const result = readFirstJson([
    EDITOR_SETTINGS_KEY,
    ...PREVIOUS_EDITOR_SETTINGS_KEYS,
  ]);
  if (!result.ok) {
    return {
      settings: defaultEditorSettings,
      sourceKey: null,
      needsMigration: false,
    };
  }

  return {
    settings: sanitizeEditorSettings(result.value),
    sourceKey: result.key,
    needsMigration: result.key !== EDITOR_SETTINGS_KEY,
  };
};

export const writePersistedEditorSettings = (
  settings: EditorSettings,
): StorageWriteResult =>
  writeJson(EDITOR_SETTINGS_KEY, sanitizeEditorSettings(settings));
