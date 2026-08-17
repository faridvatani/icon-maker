import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";
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
import {
  EXPORT_SIZES,
  exportPreviewAsPng,
  preloadPngExporter,
  type ExportOptions,
} from "@/features/editor/lib/exportPng";

export function ExportDialog() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    size: 1024,
    background: "current",
  });
  const [state, setState] = useState<
    "idle" | "exporting" | "success" | "error"
  >("idle");

  const exportPng = async () => {
    const preview = document.querySelector("#logo-preview");
    if (!(preview instanceof HTMLElement)) return;
    setState("exporting");
    try {
      await exportPreviewAsPng(preview, options);
      setState("success");
      window.setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 900);
    } catch (error) {
      console.error("PNG export failed", error);
      setState("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-1 gap-1.5 text-sm"
          onPointerEnter={preloadPngExporter}
          onFocus={preloadPngExporter}
        >
          <Download className="size-4" />
          Download PNG
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export PNG</DialogTitle>
          <DialogDescription>
            Choose the final dimensions and background treatment.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">Dimensions</legend>
          <div className="grid grid-cols-3 gap-2">
            {EXPORT_SIZES.map((size) => (
              <Button
                key={size}
                type="button"
                variant={options.size === size ? "default" : "outline"}
                onClick={() => setOptions((current) => ({ ...current, size }))}
              >
                {size}px
              </Button>
            ))}
          </div>
        </fieldset>
        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">Background</legend>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
            <input
              type="radio"
              name="export-background"
              checked={options.background === "current"}
              onChange={() =>
                setOptions((current) => ({ ...current, background: "current" }))
              }
            />
            Use current background
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
            <input
              type="radio"
              name="export-background"
              checked={options.background === "transparent"}
              onChange={() =>
                setOptions((current) => ({
                  ...current,
                  background: "transparent",
                }))
              }
            />
            Transparent icon only
          </label>
        </fieldset>
        {state === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            Export failed. Try again.
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            onClick={() => void exportPng()}
            disabled={state === "exporting"}
          >
            {state === "exporting" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {state === "success" ? <Check className="size-4" /> : null}
            {state === "exporting"
              ? "Creating PNG…"
              : state === "success"
                ? "Downloaded"
                : "Download PNG"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
