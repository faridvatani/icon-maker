// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  EDITOR_SETTINGS_KEY,
  PREVIOUS_EDITOR_SETTINGS_KEYS,
  readPersistedEditorSettings,
  writePersistedEditorSettings,
} from "@/features/editor/lib/editorSettingsStorage";
import { defaultEditorSettings } from "@/features/editor/lib/editorSettings";

const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);
const values = new Map<string, string>();
const storage = {
  clear: () => values.clear(),
  getItem: (key: string) => values.get(key) ?? null,
  key: (index: number) => [...values.keys()][index] ?? null,
  get length() {
    return values.size;
  },
  removeItem: (key: string) => values.delete(key),
  setItem: (key: string, value: string) => values.set(key, value),
} satisfies Storage;

beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
});

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalStorage);
  } else {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});

describe("editor settings persistence", () => {
  it("round trips current settings", () => {
    const settings = { ...defaultEditorSettings, iconSize: 320 };

    expect(writePersistedEditorSettings(settings)).toEqual({ ok: true });
    expect(readPersistedEditorSettings()).toEqual({
      settings,
      sourceKey: EDITOR_SETTINGS_KEY,
      needsMigration: false,
    });
  });

  it("normalizes settings before they reach browser storage", () => {
    expect(
      writePersistedEditorSettings({
        ...defaultEditorSettings,
        iconColor: "red",
        bgGradientId: "external-gradient",
      } as never),
    ).toEqual({ ok: true });

    expect(JSON.parse(storage.getItem(EDITOR_SETTINGS_KEY)!)).toMatchObject({
      iconColor: defaultEditorSettings.iconColor,
      bgGradientId: null,
    });
  });

  it("loads and normalizes the oldest supported record", () => {
    const legacyKey =
      PREVIOUS_EDITOR_SETTINGS_KEYS[PREVIOUS_EDITOR_SETTINGS_KEYS.length - 1];
    storage.setItem(
      legacyKey,
      JSON.stringify({
        icon: "library:Camera",
        iconColor: "red",
        bgColor: 'url("backgrounds/aurora.svg")',
      }),
    );

    expect(readPersistedEditorSettings()).toMatchObject({
      sourceKey: legacyKey,
      needsMigration: true,
      settings: {
        icon: "library:Camera",
        iconColor: defaultEditorSettings.iconColor,
        bgColor: `url("${import.meta.env.BASE_URL}backgrounds/nebula.svg")`,
      },
    });
  });

  it("falls back from malformed current data to a valid previous version", () => {
    storage.setItem(EDITOR_SETTINGS_KEY, "{broken");
    storage.setItem(
      PREVIOUS_EDITOR_SETTINGS_KEYS[0],
      JSON.stringify({ iconSize: 144 }),
    );

    expect(readPersistedEditorSettings()).toMatchObject({
      sourceKey: PREVIOUS_EDITOR_SETTINGS_KEYS[0],
      needsMigration: true,
      settings: { iconSize: 144 },
    });
  });

  it("uses defaults when storage is unavailable", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });

    expect(readPersistedEditorSettings()).toEqual({
      settings: defaultEditorSettings,
      sourceKey: null,
      needsMigration: false,
    });
  });
});
