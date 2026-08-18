import { useEffect, useState } from "react";
import { Check, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  assessContrast,
  type ContrastResult,
} from "@/features/editor/lib/contrast";

interface ContrastAdvisorProps {
  fingerprint: string;
  currentColor: string;
  onApply: (color: string) => void;
}

export function ContrastAdvisor({
  fingerprint,
  currentColor,
  onApply,
}: ContrastAdvisorProps) {
  const [result, setResult] = useState<ContrastResult>();
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void (async () => {
        const preview = document.querySelector("#logo-preview");
        if (!(preview instanceof HTMLElement)) return;
        const clone = preview.cloneNode(true) as HTMLElement;
        clone.querySelector("[data-icon-layer]")?.remove();
        clone.style.position = "fixed";
        clone.style.left = "-9999px";
        clone.style.width = "96px";
        clone.style.height = "96px";
        document.body.append(clone);
        try {
          const { toCanvas } = await import("html-to-image");
          const canvas = await toCanvas(clone, {
            canvasWidth: 96,
            canvasHeight: 96,
            pixelRatio: 1,
            skipAutoScale: true,
          });
          const context = canvas.getContext("2d", {
            willReadFrequently: true,
          });
          if (!context) return;
          const pixels = context.getImageData(0, 0, 96, 96).data;
          const samples = new Uint8ClampedArray(36);
          let offset = 0;
          for (const coordinate of [16, 48, 80])
            for (const other of [16, 48, 80]) {
              samples.set(
                pixels.subarray(
                  (other * canvas.width + coordinate) * 4,
                  (other * canvas.width + coordinate + 1) * 4,
                ),
                offset,
              );
              offset += 4;
            }
          setResult(assessContrast(samples, currentColor));
        } catch {
          setResult(undefined);
        } finally {
          clone.remove();
        }
      })();
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [currentColor, fingerprint]);

  if (!result) return null;
  const passes = result.currentRatio >= 4.5;
  return (
    <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-xs">
      <div className="flex items-start gap-2">
        <span className={passes ? "text-emerald-600" : "text-amber-600"}>
          {passes ? (
            <Check className="size-4" />
          ) : (
            <TriangleAlert className="size-4" />
          )}
        </span>
        <span>
          <strong>{passes ? "Contrast passes" : "Contrast is low"}</strong>
          <br />
          <span className="text-muted-foreground">
            Current color: {result.currentRatio.toFixed(2)}:1 worst-case
          </span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1" aria-label="Suggested colors">
          {result.suggestions.map((color) => (
            <Button
              key={color}
              type="button"
              size="icon"
              variant="outline"
              className="size-7"
              aria-label={`Use suggested color ${color}`}
              title={`${color} · ${result.ratio.toFixed(2)}:1 best worst-case`}
              onClick={() => onApply(color)}
            >
              <span
                className="size-4 rounded-full border"
                style={{ background: color }}
              />
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => onApply(result.suggestedColor)}
        >
          <Sparkles className="size-3.5" /> Apply best
        </Button>
      </div>
    </div>
  );
}
