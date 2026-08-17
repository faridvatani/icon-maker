export const EXPORT_SIZES = [512, 1024, 2048] as const;

export interface ExportOptions {
  size: (typeof EXPORT_SIZES)[number];
  background: "current" | "transparent";
}

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
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
  if (!value || typeof value !== "object") return DEFAULT_EXPORT_OPTIONS;
  const candidate = value as Record<string, unknown>;
  return {
    size: EXPORT_SIZES.includes(candidate.size as ExportOptions["size"])
      ? (candidate.size as ExportOptions["size"])
      : DEFAULT_EXPORT_OPTIONS.size,
    background:
      candidate.background === "transparent" ? "transparent" : "current",
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

export async function exportPreviewAsPng(
  node: HTMLElement,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS,
): Promise<void> {
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

    const suffix = options.background === "transparent" ? "-transparent" : "";
    triggerDownload(blob, `icon-${options.size}${suffix}.png`);
  } finally {
    if (exportNode !== node) exportNode.remove();
  }
}
