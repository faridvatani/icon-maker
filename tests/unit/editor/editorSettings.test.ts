import { describe, expect, it } from "vitest";
import {
  defaultEditorSettings,
  sanitizeEditorSettings,
} from "@/features/editor/lib/editorSettings";

const bundledBackground = (file: string) =>
  `url("${import.meta.env.BASE_URL}backgrounds/${file}")`;

describe("sanitizeEditorSettings", () => {
  it("migrates valid stored values and clamps unsafe numeric values", () => {
    expect(
      sanitizeEditorSettings({
        icon: "library:Camera",
        iconSize: 9999,
        iconRotate: -4,
        bgPadding: 999,
        bgRounded: 999,
        bgColor: "#123456",
      }),
    ).toMatchObject({
      icon: "library:Camera",
      iconSize: 512,
      iconRotate: 0,
      bgPadding: 100,
      bgRounded: 512,
      bgColor: "#123456",
    });
  });

  it("falls back to defaults for invalid values", () => {
    expect(sanitizeEditorSettings({ icon: "custom:" })).toEqual(
      defaultEditorSettings,
    );
  });

  it("accepts only supported CSS-backed editor values", () => {
    expect(
      sanitizeEditorSettings({
        iconColor: "red",
        bgColor: 'url("https://assets.example/background.svg")',
        bgGradientId: "missing-gradient",
        iconEffects: {
          fill: "url(https://assets.example/fill.svg)",
          outlineColor: "rgb(0, 0, 0)",
          glowColor: "#12",
          duotoneColor: "var(--external-color)",
          shadows: [{ color: "currentColor" }],
        },
      }),
    ).toMatchObject({
      iconColor: defaultEditorSettings.iconColor,
      bgColor: defaultEditorSettings.bgColor,
      bgGradientId: null,
      iconEffects: {
        fill: null,
        outlineColor: null,
        glowColor: null,
        duotoneColor: null,
        shadows: [{ color: "#000000" }],
      },
    });

    expect(
      sanitizeEditorSettings({
        bgColor: 'url("data:image/svg+xml,<svg />")',
      }).bgColor,
    ).toBe(defaultEditorSettings.bgColor);
  });

  it("preserves supported colors, bundled backgrounds, and gradient IDs", () => {
    expect(
      sanitizeEditorSettings({
        iconColor: "#a1B2c3",
        bgColor: 'url("/icon-maker/backgrounds/sunset.svg")',
        bgGradientId: "sunrise-drift",
      }),
    ).toMatchObject({
      iconColor: "#a1B2c3",
      bgColor: bundledBackground("sunset.svg"),
      bgGradientId: "sunrise-drift",
    });
  });

  it("normalizes legacy background paths without preserving remote URLs", () => {
    expect(
      sanitizeEditorSettings({
        bgColor: 'url("https://images.unsplash.com/photo-legacy")',
      }).bgColor,
    ).toBe(bundledBackground("nebula.svg"));

    expect(
      sanitizeEditorSettings({
        bgColor: 'url("backgrounds/lagoon.svg")',
      }).bgColor,
    ).toBe(bundledBackground("lagoon.svg"));
  });
});
