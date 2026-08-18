// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
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

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  },
});

beforeEach(() => globalThis.localStorage.clear());

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

  it("normalizes ZIP export selections", () => {
    expect(
      normalizeBatchExportOptions({
        sizes: [16, 300, 9999],
        backgrounds: ["transparent", "current", "other"],
      }),
    ).toEqual({ sizes: [16, 300], backgrounds: ["transparent", "current"] });
  });
});
