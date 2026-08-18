import { describe, expect, it } from "vitest";
import {
  createBatchExportPlan,
  ExportWorkloadError,
  normalizeExportOptions,
} from "@/features/editor/lib/exportPng";

describe("normalizeExportOptions", () => {
  it("accepts supported PNG sizes and transparency", () => {
    expect(
      normalizeExportOptions({ size: 2048, background: "transparent" }),
    ).toEqual({ size: 2048, background: "transparent" });
  });

  it("accepts a valid custom square size and normalizes invalid backgrounds", () => {
    expect(normalizeExportOptions({ size: 300, background: "other" })).toEqual({
      size: 300,
      background: "current",
    });
  });
});

describe("createBatchExportPlan", () => {
  it("preserves the current filename and iteration order", () => {
    const plan = createBatchExportPlan({
      sizes: [1024, 32],
      backgrounds: ["transparent", "current"],
    });

    expect(plan.assets.map(({ fileName }) => fileName)).toEqual([
      "icon-32-transparent.png",
      "icon-32.png",
      "icon-1024-transparent.png",
      "icon-1024.png",
    ]);
  });

  it("accepts every built-in target with both background variants", () => {
    const plan = createBatchExportPlan({
      sizes: [16, 32, 48, 180, 192, 400, 512, 1024, 1080, 2048],
      backgrounds: ["current", "transparent"],
    });

    expect(plan.assets).toHaveLength(20);
  });

  it("accepts both variants at the maximum custom canvas size", () => {
    const plan = createBatchExportPlan({
      sizes: [4096],
      backgrounds: ["current", "transparent"],
    });

    expect(plan.totalPixels).toBe(4096 * 4096 * 2);
  });

  it("rejects too many files before rendering starts", () => {
    expect(() =>
      createBatchExportPlan({
        sizes: Array.from({ length: 21 }, (_, index) => 16 + index),
        backgrounds: ["current"],
      }),
    ).toThrowError(ExportWorkloadError);
  });

  it("rejects a workload larger than two maximum-size canvases", () => {
    expect(() =>
      createBatchExportPlan({
        sizes: [4094, 4095, 4096],
        backgrounds: ["current"],
      }),
    ).toThrowError(/pixel workload/i);
  });
});
