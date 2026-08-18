import { describe, expect, it } from "vitest";
import {
  createShareSearch,
  parseSharedSettings,
} from "@/features/editor/lib/share";
import { defaultEditorSettings } from "@/features/editor/lib/editorSettings";
import { encodeBase64Url } from "@/features/editor/lib/base64Url";

describe("share links", () => {
  it("round-trips a built-in design", () => {
    const settings = {
      ...defaultEditorSettings,
      icon: "library:Camera" as const,
    };
    const search = createShareSearch(settings);

    expect(search).not.toBeNull();
    expect(parseSharedSettings(search ?? "")).toMatchObject(settings);
  });

  it("does not share device-local custom icons", () => {
    expect(
      createShareSearch({ ...defaultEditorSettings, icon: "custom:local" }),
    ).toBeNull();
  });

  it("rejects malformed or unsupported links", () => {
    expect(parseSharedSettings("?design=not-a-share-link")).toBeNull();
    expect(
      parseSharedSettings(
        `?design=${encodeBase64Url(JSON.stringify({ v: 2, settings: {} }))}`,
      ),
    ).toBeNull();
    expect(
      parseSharedSettings(
        `?design=${encodeBase64Url(JSON.stringify({ v: 1 }))}`,
      ),
    ).toBeNull();
  });

  it("sanitizes invalid editor values from a shared design", () => {
    const search = `?design=${encodeBase64Url(
      JSON.stringify({
        v: 1,
        settings: {
          ...defaultEditorSettings,
          iconSize: Number.POSITIVE_INFINITY,
          bgPadding: -10,
          iconEffects: { opacity: 8, shadows: "invalid" },
        },
      }),
    )}`;

    expect(parseSharedSettings(search)).toMatchObject({
      iconSize: defaultEditorSettings.iconSize,
      bgPadding: 0,
      iconEffects: { opacity: 1, shadows: [] },
    });
  });
});
