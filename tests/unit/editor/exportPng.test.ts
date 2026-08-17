import { describe, expect, it } from "vitest";
import { normalizeExportOptions } from "@/features/editor/lib/exportPng";

describe("normalizeExportOptions", () => {
  it("accepts supported PNG sizes and transparency", () => {
    expect(
      normalizeExportOptions({ size: 2048, background: "transparent" }),
    ).toEqual({ size: 2048, background: "transparent" });
  });

  it("falls back to the production default", () => {
    expect(normalizeExportOptions({ size: 300, background: "other" })).toEqual({
      size: 1024,
      background: "current",
    });
  });
});
