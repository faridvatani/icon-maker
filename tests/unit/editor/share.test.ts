import { describe, expect, it } from "vitest";
import {
  createShareSearch,
  parseSharedSettings,
} from "@/features/editor/lib/share";
import { defaultEditorSettings } from "@/features/editor/lib/editorSettings";

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
  });
});
