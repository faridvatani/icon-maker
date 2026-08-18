import { sanitizeEditorSettings, type EditorSettings } from "./editorSettings";
import { isCustomIconValue } from "./iconTypes";
import { decodeBase64Url, encodeBase64Url } from "./base64Url";

const SHARE_PARAM = "design";

export function createShareSearch(settings: EditorSettings): string | null {
  if (isCustomIconValue(settings.icon)) return null;
  return `?${SHARE_PARAM}=${encodeBase64Url(JSON.stringify({ v: 1, settings }))}`;
}

export function parseSharedSettings(search: string): EditorSettings | null {
  try {
    const value = new URLSearchParams(search).get(SHARE_PARAM);
    if (!value) return null;
    const decoded = JSON.parse(decodeBase64Url(value)) as {
      v?: unknown;
      settings?: unknown;
    };
    if (decoded.v !== 1 || !decoded.settings) return null;
    const settings = sanitizeEditorSettings(decoded.settings);
    return isCustomIconValue(settings.icon) ? null : settings;
  } catch {
    return null;
  }
}

export function createShareUrl(settings: EditorSettings, location: Location) {
  const search = createShareSearch(settings);
  if (!search) return null;
  return `${location.origin}${location.pathname}${search}`;
}
