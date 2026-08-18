import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Download, Loader2, Settings2 } from "lucide-react";
import { motion } from "motion/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useEditorEvent } from "@/features/editor/hooks/useEditorEvent";
import {
  editorEvent,
  getEditorEventFocusTarget,
} from "@/features/editor/lib/editorEvents";
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
  ExportWorkloadError,
  exportPreviewAsPng,
  exportPreviewsAsZip,
  preloadPngExporter,
  type BatchExportOptions,
} from "@/features/editor/lib/exportPng";
import { usePreviewElement } from "@/features/editor/state/PreviewElementContext";

type ExportState = "idle" | "exporting" | "success" | "error";
type QuickExportState = "idle" | "exporting" | "error";

export function QuickExportButton({ className }: { className?: string }) {
  const [state, setState] = useState<QuickExportState>("idle");
  const [announcement, setAnnouncement] = useState("");
  const timeoutRef = useRef<number | undefined>(undefined);
  const isExportingRef = useRef(false);
  const { getPreviewElement } = usePreviewElement();
  const exportQuickPng = useCallback(async () => {
    const preview = getPreviewElement();
    if (!preview || isExportingRef.current) return;
    isExportingRef.current = true;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setState("exporting");
    try {
      await exportPreviewAsPng(preview, defaultExportOptions);
      setState("idle");
      setAnnouncement("PNG downloaded.");
      timeoutRef.current = window.setTimeout(() => setAnnouncement(""), 2_000);
    } catch (error) {
      console.error("PNG export failed", error);
      setState("error");
      timeoutRef.current = window.setTimeout(() => setState("idle"), 3_000);
    } finally {
      isExportingRef.current = false;
    }
  }, [getPreviewElement]);
  useEditorEvent(editorEvent.quickExport, exportQuickPng);
  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    },
    [],
  );
  const statusLabel =
    state === "exporting"
      ? "Exporting…"
      : state === "error"
        ? "Try export again"
        : "Export PNG";
  return (
    <Button
      type="button"
      size="sm"
      className={`gap-1.5 ${className ?? ""}`}
      onPointerEnter={preloadPngExporter}
      onFocus={preloadPngExporter}
      onClick={() => void exportQuickPng()}
      disabled={state === "exporting"}
      aria-label={statusLabel}
      aria-busy={state === "exporting"}
    >
      <motion.span
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        className="flex items-center gap-1.5"
      >
        {state === "exporting" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {statusLabel}
      </motion.span>
      <span role="status" className="sr-only" aria-live="polite">
        {announcement}
      </span>
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
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const { getPreviewElement } = usePreviewElement();
  useEditorEvent(editorEvent.openExport, (event) => {
    returnFocusRef.current = getEditorEventFocusTarget(event);
    setOpen(true);
  });
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
    const preview = getPreviewElement();
    if (!preview || !options.sizes.length || !options.backgrounds.length)
      return;
    setState("exporting");
    setErrorMessage("");
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
      if (!(error instanceof ExportWorkloadError)) {
        console.error("Batch export failed", error);
      }
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Try the export again.",
      );
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
      <DialogContent
        className="max-h-[90dvh] max-w-lg overflow-y-auto"
        onCloseAutoFocus={(event) => {
          const target = returnFocusRef.current;
          returnFocusRef.current = null;
          if (!target?.isConnected) return;
          event.preventDefault();
          target.focus();
        }}
      >
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
            <Input
              aria-label="Custom canvas size"
              inputMode="numeric"
              type="number"
              min="16"
              max="4096"
              value={customSize}
              placeholder="Custom size, 16–4096 px"
              className="h-9 min-w-0 flex-1"
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
              <Checkbox
                checked={options.backgrounds.includes(background)}
                onCheckedChange={() => toggleBackground(background)}
              />
              {background === "current"
                ? "Use current background"
                : "Transparent icon only"}
            </label>
          ))}
        </fieldset>
        {state === "error" ? (
          <Alert variant="destructive">
            <AlertTitle>Export failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
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
