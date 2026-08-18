import { useEffect, useRef, useState } from "react";
import { Check, Download, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CANVAS_TARGETS, isCanvasSize } from "@/features/editor/lib/canvas";
import {
  defaultExportOptions,
  exportPreviewAsPng,
  exportPreviewsAsZip,
  preloadPngExporter,
  type BatchExportOptions,
} from "@/features/editor/lib/exportPng";

type ExportState = "idle" | "exporting" | "success" | "error";

const getPreview = () => {
  const preview = document.querySelector("#logo-preview");
  return preview instanceof HTMLElement ? preview : null;
};

export function QuickExportButton({ className }: { className?: string }) {
  const [state, setState] = useState<ExportState>("idle");
  const timeoutRef = useRef<number | undefined>(undefined);
  const exportQuickPng = async () => {
    const preview = getPreview();
    if (!preview || state === "exporting") return;
    setState("exporting");
    try {
      await exportPreviewAsPng(preview, defaultExportOptions);
      setState("success");
      timeoutRef.current = window.setTimeout(() => setState("idle"), 2_000);
    } catch (error) {
      console.error("PNG export failed", error);
      setState("error");
      timeoutRef.current = window.setTimeout(() => setState("idle"), 3_000);
    }
  };
  useEffect(() => {
    window.addEventListener("icon-maker:quick-export", exportQuickPng);
    return () => {
      window.removeEventListener("icon-maker:quick-export", exportQuickPng);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  });
  return (
    <Button
      type="button"
      size="sm"
      className={`gap-1.5 ${className ?? ""}`}
      onPointerEnter={preloadPngExporter}
      onFocus={preloadPngExporter}
      onClick={() => void exportQuickPng()}
      disabled={state === "exporting"}
    >
      {state === "success" ? (
        <Check className="size-4" />
      ) : (
        <Download className="size-4" />
      )}
      {state === "exporting"
        ? "Exporting…"
        : state === "success"
          ? "PNG downloaded"
          : state === "error"
            ? "Try export again"
            : "Export PNG"}
    </Button>
  );
}

export function ExportDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<BatchExportOptions>({
    sizes: [1024],
    backgrounds: ["current"],
  });
  const [customSize, setCustomSize] = useState("");
  const [state, setState] = useState<ExportState>("idle");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  useEffect(() => {
    const openDialog = () => setOpen(true);
    window.addEventListener("icon-maker:open-export", openDialog);
    return () =>
      window.removeEventListener("icon-maker:open-export", openDialog);
  }, []);
  const toggleSize = (size: number) =>
    setOptions((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((value) => value !== size)
        : [...current.sizes, size].sort((left, right) => left - right),
    }));
  const toggleBackground = (background: "current" | "transparent") =>
    setOptions((current) => ({
      ...current,
      backgrounds: current.backgrounds.includes(background)
        ? current.backgrounds.filter((value) => value !== background)
        : [...current.backgrounds, background],
    }));
  const addCustomSize = () => {
    const size = Number(customSize);
    if (!isCanvasSize(size)) return;
    toggleSize(size);
    setCustomSize("");
  };
  const exportBatch = async () => {
    const preview = getPreview();
    if (!preview || !options.sizes.length || !options.backgrounds.length)
      return;
    setState("exporting");
    setProgress({
      completed: 0,
      total: options.sizes.length * options.backgrounds.length,
    });
    try {
      await exportPreviewsAsZip(preview, options, (completed, total) =>
        setProgress({ completed, total }),
      );
      setState("success");
      window.setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 1_200);
    } catch (error) {
      console.error("Batch export failed", error);
      setState("error");
    }
  };
  const assetCount = options.sizes.length * options.backgrounds.length;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onPointerEnter={preloadPngExporter}
          onFocus={preloadPngExporter}
        >
          <Settings2 className="size-4" />
          Advanced export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced export</DialogTitle>
          <DialogDescription>
            Bundle multiple square PNG assets into one ZIP file. For the fastest
            result, use Export PNG.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">Export targets</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CANVAS_TARGETS.map((target) => (
              <Button
                key={target.size}
                type="button"
                variant={
                  options.sizes.includes(target.size) ? "default" : "outline"
                }
                className="h-auto min-h-14 flex-col items-start gap-0.5 px-3 py-2 text-left"
                onClick={() => toggleSize(target.size)}
              >
                <span>{target.label}</span>
                <span className="text-xs font-normal opacity-70">
                  {target.description}
                </span>
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              aria-label="Custom canvas size"
              inputMode="numeric"
              type="number"
              min="16"
              max="4096"
              value={customSize}
              placeholder="Custom size, 16–4096 px"
              className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
              onChange={(event) => setCustomSize(event.target.value)}
            />
            <Button type="button" variant="outline" onClick={addCustomSize}>
              Add
            </Button>
          </div>
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Background</legend>
          {(["current", "transparent"] as const).map((background) => (
            <label
              key={background}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={options.backgrounds.includes(background)}
                onChange={() => toggleBackground(background)}
              />
              {background === "current"
                ? "Use current background"
                : "Transparent icon only"}
            </label>
          ))}
        </fieldset>
        {state === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            Export failed. Try again.
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            className="gap-1.5"
            onClick={() => void exportBatch()}
            disabled={state === "exporting" || !assetCount}
          >
            {state === "exporting" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : state === "success" ? (
              <Check className="size-4" />
            ) : (
              <Download className="size-4" />
            )}
            {state === "exporting"
              ? `Creating ${progress.completed} of ${progress.total}…`
              : state === "success"
                ? "ZIP downloaded"
                : `Export ${assetCount} PNG${assetCount === 1 ? "" : "s"} as ZIP`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
