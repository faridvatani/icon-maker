import { describe, expect, it } from "vitest";
import {
  defaultEditorSettings,
  sanitizeEditorSettings,
} from "@/features/editor/lib/editorSettings";

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
});
