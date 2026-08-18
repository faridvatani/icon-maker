import {
  assessContrast,
  type ContrastResult,
} from "@/features/editor/lib/contrast";
import type { HexColor } from "@/features/editor/lib/styleValues";

const SAMPLE_SIZE = 96;
const SAMPLE_COORDINATES = [16, 48, 80] as const;

export async function samplePreviewContrast(
  preview: HTMLElement,
  currentColor: HexColor,
): Promise<ContrastResult> {
  const clone = preview.cloneNode(true) as HTMLElement;
  clone.id = "";
  clone.querySelector("[data-icon-layer]")?.remove();
  clone.style.position = "fixed";
  clone.style.left = "-9999px";
  clone.style.width = `${SAMPLE_SIZE}px`;
  clone.style.height = `${SAMPLE_SIZE}px`;
  document.body.append(clone);

  try {
    const { toCanvas } = await import("html-to-image");
    const canvas = await toCanvas(clone, {
      canvasWidth: SAMPLE_SIZE,
      canvasHeight: SAMPLE_SIZE,
      pixelRatio: 1,
      skipAutoScale: true,
    });
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas rendering is unavailable");
    const pixels = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
    const samples = new Uint8ClampedArray(
      SAMPLE_COORDINATES.length * SAMPLE_COORDINATES.length * 4,
    );
    let offset = 0;
    for (const x of SAMPLE_COORDINATES)
      for (const y of SAMPLE_COORDINATES) {
        const pixelOffset = (y * canvas.width + x) * 4;
        samples.set(pixels.subarray(pixelOffset, pixelOffset + 4), offset);
        offset += 4;
      }
    return assessContrast(samples, currentColor);
  } finally {
    clone.remove();
  }
}
