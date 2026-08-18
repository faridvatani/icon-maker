import { useEffect, useState } from "react";
import { Check, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ContrastResult } from "@/features/editor/lib/contrast";
import { samplePreviewContrast } from "@/features/editor/lib/contrastSampling";
import type { HexColor } from "@/features/editor/lib/styleValues";
import { usePreviewElement } from "@/features/editor/state/PreviewElementContext";

interface ContrastAdvisorProps {
  fingerprint: string;
  currentColor: HexColor;
  onApply: (color: HexColor) => void;
}

interface CalculatedContrast {
  fingerprint: string;
  currentColor: HexColor;
  value: ContrastResult;
}

export function ContrastAdvisor({
  fingerprint,
  currentColor,
  onApply,
}: ContrastAdvisorProps) {
  const [calculation, setCalculation] = useState<CalculatedContrast>();
  const { getPreviewElement } = usePreviewElement();
  useEffect(() => {
    let ownsResult = true;
    const timeout = window.setTimeout(() => {
      void (async () => {
        const preview = getPreviewElement();
        if (!preview) return;
        try {
          const nextResult = await samplePreviewContrast(preview, currentColor);
          if (ownsResult) {
            setCalculation({
              fingerprint,
              currentColor,
              value: nextResult,
            });
          }
        } catch {
          if (ownsResult) setCalculation(undefined);
        }
      })();
    }, 300);
    return () => {
      ownsResult = false;
      window.clearTimeout(timeout);
    };
  }, [currentColor, fingerprint, getPreviewElement]);

  const result =
    calculation?.fingerprint === fingerprint &&
    calculation.currentColor === currentColor
      ? calculation.value
      : undefined;
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
