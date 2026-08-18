import {
  CANVAS_PRESETS,
  isCanvasSize,
  normalizeCanvasSizes,
  type CanvasSize,
} from "./canvas";

export const EXPORT_SIZES = CANVAS_PRESETS;
export const MAX_BATCH_EXPORT_ASSETS = CANVAS_PRESETS.length * 2;
export const MAX_BATCH_EXPORT_PIXELS = 4096 * 4096 * 2;

export interface ExportOptions {
  size: CanvasSize;
  background: "current" | "transparent";
}

export interface BatchExportOptions {
  sizes: CanvasSize[];
  backgrounds: Array<ExportOptions["background"]>;
}

interface BatchExportAsset {
  options: ExportOptions;
  fileName: string;
}

export interface BatchExportPlan {
  assets: BatchExportAsset[];
  totalPixels: number;
}

export class ExportWorkloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportWorkloadError";
  }
}

export const defaultExportOptions: ExportOptions = {
  size: 1024,
  background: "current",
};

let rendererPromise: Promise<typeof import("html-to-image")> | undefined;

const loadRenderer = () => {
  rendererPromise ??= import("html-to-image");
  return rendererPromise;
};

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const triggerDownload = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
};

export const normalizeExportOptions = (value: unknown): ExportOptions => {
  if (!value || typeof value !== "object") return defaultExportOptions;
  const candidate = value as Record<string, unknown>;
  return {
    size: isCanvasSize(candidate.size)
      ? candidate.size
      : defaultExportOptions.size,
    background:
      candidate.background === "transparent" ? "transparent" : "current",
  };
};

export const normalizeBatchExportOptions = (
  value: unknown,
): BatchExportOptions => {
  if (!value || typeof value !== "object")
    return {
      sizes: [defaultExportOptions.size],
      backgrounds: [defaultExportOptions.background],
    };
  const candidate = value as Record<string, unknown>;
  const backgrounds = Array.isArray(candidate.backgrounds)
    ? candidate.backgrounds.filter(
        (background): background is ExportOptions["background"] =>
          background === "current" || background === "transparent",
      )
    : [];
  return {
    sizes: normalizeCanvasSizes(candidate.sizes),
    backgrounds: backgrounds.length ? [...new Set(backgrounds)] : ["current"],
  };
};

const createTransparentExportNode = (node: HTMLElement) => {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.id = "";
  clone.style.background = "transparent";
  clone
    .querySelectorAll<HTMLElement>("[data-background-layer]")
    .forEach((layer) => {
      layer.style.display = "none";
    });

  document.body.append(clone);
  return clone;
};

const getOpaqueBackgroundColor = (node: HTMLElement) => {
  const backgroundColor = window.getComputedStyle(node).backgroundColor;
  return backgroundColor === "rgba(0, 0, 0, 0)" ? undefined : backgroundColor;
};

export const preloadPngExporter = () => {
  void loadRenderer();
};

const createPngBlob = async (
  node: HTMLElement,
  options: ExportOptions = defaultExportOptions,
): Promise<Blob> => {
  const { toBlob } = await loadRenderer();
  await document.fonts.ready;
  await waitForPaint();

  const exportNode =
    options.background === "transparent"
      ? createTransparentExportNode(node)
      : node;
  try {
    const blob = await toBlob(exportNode, {
      canvasWidth: options.size,
      canvasHeight: options.size,
      pixelRatio: 1,
      skipAutoScale: true,
      backgroundColor:
        options.background === "current"
          ? getOpaqueBackgroundColor(node)
          : undefined,
    });

    if (!blob) throw new Error("The browser could not create the PNG file");
    return blob;
  } finally {
    if (exportNode !== node) exportNode.remove();
  }
};

export const exportFileName = (options: ExportOptions) =>
  `icon-${options.size}${options.background === "transparent" ? "-transparent" : ""}.png`;

export const createBatchExportPlan = (
  options: BatchExportOptions,
): BatchExportPlan => {
  const normalized = normalizeBatchExportOptions(options);
  const assets = normalized.sizes.flatMap((size) =>
    normalized.backgrounds.map((background) => {
      const exportOptions: ExportOptions = { size, background };
      return {
        options: exportOptions,
        fileName: exportFileName(exportOptions),
      };
    }),
  );
  if (assets.length > MAX_BATCH_EXPORT_ASSETS) {
    throw new ExportWorkloadError(
      `Export up to ${MAX_BATCH_EXPORT_ASSETS} PNGs at a time. Reduce the selected sizes or background variants.`,
    );
  }
  const totalPixels = assets.reduce(
    (total, asset) => total + asset.options.size ** 2,
    0,
  );
  if (totalPixels > MAX_BATCH_EXPORT_PIXELS) {
    throw new ExportWorkloadError(
      "The selected pixel workload is too large. Reduce large canvas sizes or background variants.",
    );
  }
  return { assets, totalPixels };
};

export async function exportPreviewAsPng(
  node: HTMLElement,
  options: ExportOptions = defaultExportOptions,
): Promise<void> {
  triggerDownload(await createPngBlob(node, options), exportFileName(options));
}

export async function exportPreviewsAsZip(
  node: HTMLElement,
  options: BatchExportOptions,
  onProgress?: (completed: number, total: number) => void,
): Promise<void> {
  const plan = createBatchExportPlan(options);
  const zipperPromise = import("./zipExport");
  const files: Record<string, Uint8Array> = {};
  const total = plan.assets.length;
  let completed = 0;
  for (const asset of plan.assets) {
    files[asset.fileName] = new Uint8Array(
      await (await createPngBlob(node, asset.options)).arrayBuffer(),
    );
    completed += 1;
    onProgress?.(completed, total);
    await waitForPaint();
  }
  const { createZipArchive } = await zipperPromise;
  triggerDownload(
    new Blob([createZipArchive(files)], { type: "application/zip" }),
    "icon-maker-export.zip",
  );
}
