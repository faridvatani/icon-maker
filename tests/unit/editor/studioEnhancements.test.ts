// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { assessContrast } from "@/features/editor/lib/contrast";
import {
  defaultBackgroundEffects,
  sanitizeBackgroundEffects,
  sanitizeIconEffects,
} from "@/features/editor/lib/effects";
import { normalizeBatchExportOptions } from "@/features/editor/lib/exportPng";
import {
  readRecents,
  recordRecentGradient,
  recordRecentIcon,
} from "@/features/editor/lib/recents";
import {
  createBrandKit,
  readBrandKits,
  writeBrandKits,
} from "@/features/editor/lib/brandKits";
import { defaultEditorSettings } from "@/features/editor/lib/editorSettings";
import {
  createPreset,
  readPresets,
  writePresets,
} from "@/features/editor/lib/presets";

const storage = new Map<string, string>();
const storageApi = {
  clear: vi.fn(() => storage.clear()),
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
};
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: storageApi,
});

beforeEach(() => {
  storage.clear();
  vi.clearAllMocks();
  storageApi.getItem.mockImplementation((key) => storage.get(key) ?? null);
  storageApi.setItem.mockImplementation((key, value) =>
    storage.set(key, value),
  );
});

describe("studio enhancement contracts", () => {
  it("clamps effect settings and limits shadows", () => {
    expect(
      sanitizeIconEffects({
        strokeWidth: 20,
        shadows: Array.from({ length: 4 }, () => ({
          color: "#000000",
          x: 0,
          y: 0,
          blur: 0,
          opacity: 1,
        })),
      }).shadows,
    ).toHaveLength(3);
    expect(sanitizeIconEffects({ strokeWidth: 20 }).strokeWidth).toBe(8);
    expect(sanitizeBackgroundEffects({ grain: 4, blur: -2 })).toMatchObject({
      ...defaultBackgroundEffects,
      grain: 1,
      blur: 0,
    });
  });

  it("suggests the strongest worst-case contrast color", () => {
    const result = assessContrast(
      new Uint8ClampedArray([0, 0, 0, 255, 8, 8, 8, 255]),
    );
    expect(result.suggestedColor).toBe("#ffffff");
    expect(result.ratio).toBeGreaterThan(19);
    expect(result.currentRatio).toBe(1);
    expect(result.suggestions).toEqual(["#ffffff", "#000000"]);
  });

  it("retains the newest local recents", () => {
    recordRecentIcon("library:Camera");
    recordRecentIcon("library:AlarmClock");
    recordRecentGradient("sunrise-drift");
    expect(readRecents()).toMatchObject({
      icons: ["library:AlarmClock", "library:Camera"],
      gradients: ["sunrise-drift"],
    });
  });

  it("persists a sanitized browser-local brand kit", () => {
    const kit = createBrandKit("Studio", defaultEditorSettings, {
      size: 1024,
      background: "current",
    });
    writeBrandKits([kit]);
    expect(readBrandKits()).toMatchObject([
      { name: "Studio", defaults: defaultEditorSettings },
    ]);
  });

  it("round trips saved designs through the shared persistence boundary", () => {
    const preset = createPreset("  Launch   icon  ", {
      ...defaultEditorSettings,
      iconSize: 196,
    });

    expect(writePresets([preset])).toEqual({ ok: true });
    expect(readPresets()).toMatchObject([
      { name: "Launch icon", settings: { iconSize: 196 } },
    ]);
  });

  it("applies the same saved-name rules and feature-specific collection limits", () => {
    const name = `  Product    launch ${"x".repeat(60)}  `;
    const presetName = createPreset(name, defaultEditorSettings).name;
    const brandKitName = createBrandKit(name, defaultEditorSettings, {
      size: 1024,
      background: "current",
    }).name;
    expect(presetName).toBe(brandKitName);
    expect(presetName).toHaveLength(48);

    const presets = Array.from({ length: 30 }, (_, index) => ({
      ...createPreset(`Preset ${index}`, defaultEditorSettings),
      id: `preset-${index}`,
    }));
    const kits = Array.from({ length: 18 }, (_, index) => ({
      ...createBrandKit(`Kit ${index}`, defaultEditorSettings, {
        size: 1024,
        background: "current" as const,
      }),
      id: `kit-${index}`,
    }));

    expect(writePresets(presets)).toEqual({ ok: true });
    expect(writeBrandKits(kits)).toEqual({ ok: true });
    expect(readPresets()).toHaveLength(24);
    expect(readBrandKits()).toHaveLength(12);
  });

  it("normalizes malformed collection records without discarding valid data", () => {
    storage.set(
      "icon-maker:presets:v1",
      JSON.stringify([
        null,
        { id: "valid", name: " Saved ", settings: { iconColor: "red" } },
      ]),
    );
    storage.set(
      "icon-maker:brand-kits:v1",
      JSON.stringify([
        {
          id: "kit",
          name: " Legacy ",
          palette: ["#123456", "red"],
          defaults: { bgGradientId: "missing-gradient" },
          exportOptions: { size: 9999, background: "unknown" },
        },
      ]),
    );
    storage.set("icon-maker:recents:v1", "{broken");

    expect(readPresets()).toMatchObject([
      {
        id: "valid",
        name: "Saved",
        settings: { iconColor: defaultEditorSettings.iconColor },
      },
    ]);
    expect(readBrandKits()).toMatchObject([
      {
        id: "kit",
        name: "Legacy",
        palette: ["#123456"],
        defaults: { bgGradientId: null },
        exportOptions: { size: 1024, background: "current" },
      },
    ]);
    expect(readRecents()).toEqual({ icons: [], gradients: [] });
  });

  it("returns typed failures instead of throwing on storage write errors", () => {
    storageApi.setItem.mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });

    expect(writePresets([])).toEqual({
      ok: false,
      reason: "quota-exceeded",
    });
    expect(writeBrandKits([])).toEqual({
      ok: false,
      reason: "quota-exceeded",
    });
    expect(recordRecentIcon("library:Camera")).toEqual({
      ok: false,
      reason: "quota-exceeded",
    });
    expect(recordRecentGradient("sunrise-drift")).toEqual({
      ok: false,
      reason: "quota-exceeded",
    });
  });

  it("returns safe empty collections when browser storage is unavailable", () => {
    storageApi.getItem.mockImplementation(() => {
      throw new DOMException("Storage is unavailable", "SecurityError");
    });

    expect(readRecents()).toEqual({ icons: [], gradients: [] });
    expect(readBrandKits()).toEqual([]);
    expect(readPresets()).toEqual([]);
  });

  it("normalizes ZIP export selections", () => {
    expect(
      normalizeBatchExportOptions({
        sizes: [16, 300, 9999],
        backgrounds: ["transparent", "current", "other"],
      }),
    ).toEqual({ sizes: [16, 300], backgrounds: ["transparent", "current"] });
  });
});
