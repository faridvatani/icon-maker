import type { CSSProperties } from "react";
import { GRADIENTS_BY_ID } from "@/features/editor/data/gradients";
import { cn } from "@/lib/utils";

interface LayeredGradientProps {
  gradientId: string;
  className?: string;
  thumbnail?: boolean;
}

const GRAIN_BACKGROUND =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.48%27/%3E%3C/svg%3E")';

export function LayeredGradient({
  gradientId,
  className,
  thumbnail = false,
}: LayeredGradientProps) {
  const gradient = GRADIENTS_BY_ID.get(gradientId);

  if (!gradient) return null;

  return (
    <div
      data-background-layer
      aria-hidden="true"
      data-gradient-renderer="true"
      className={cn("absolute inset-0 isolate overflow-hidden", className)}
      style={{ backgroundColor: gradient.base }}
    >
      {gradient.layers.map((layer, index) => (
        <div
          key={`${gradient.id}-${index}`}
          className="absolute inset-[-12%]"
          style={{
            background: layer.background,
            backgroundSize: layer.backgroundSize,
            filter: layer.blur
              ? `blur(${Math.round(layer.blur * (thumbnail ? 0.35 : 1))}px)`
              : undefined,
            mixBlendMode: layer.blendMode as CSSProperties["mixBlendMode"],
            opacity: layer.opacity ?? 1,
          }}
        />
      ))}
      {gradient.grain ? (
        <div
          className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_BACKGROUND }}
        />
      ) : null}
    </div>
  );
}
