import type { CSSProperties } from "react";
import { GRADIENTS_BY_ID } from "@/features/editor/data/gradients";
import { cn } from "@/lib/utils";
import type { BackgroundEffects } from "@/features/editor/lib/effects";

interface LayeredGradientProps {
  gradientId: string;
  className?: string;
  thumbnail?: boolean;
  effects?: BackgroundEffects;
}

export const GRAIN_BACKGROUND =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.48%27/%3E%3C/svg%3E")';

export function LayeredGradient({
  gradientId,
  className,
  thumbnail = false,
  effects,
}: LayeredGradientProps) {
  const gradient = GRADIENTS_BY_ID.get(gradientId);

  if (!gradient) return null;

  return (
    <div
      data-background-layer
      aria-hidden="true"
      data-gradient-renderer="true"
      className={cn("absolute inset-0 isolate overflow-hidden", className)}
      style={{
        backgroundColor: gradient.base,
        filter:
          [
            effects?.blur ? `blur(${effects.blur}px)` : "",
            effects?.distortion
              ? `contrast(${1 + effects.distortion * 0.35}) saturate(${1 + effects.distortion * 0.5})`
              : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined,
        transform: effects?.gradientRotate
          ? `scale(1.06) rotate(${effects.gradientRotate}deg)`
          : undefined,
        mixBlendMode: effects?.blendMode,
      }}
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
      {gradient.grain || effects?.grain ? (
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage: GRAIN_BACKGROUND,
            opacity: Math.min(
              0.5,
              (gradient.grain ? 0.14 : 0) + (effects?.grain ?? 0) * 0.36,
            ),
          }}
        />
      ) : null}
      {effects?.spotlightOpacity ? (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${effects.spotlightX}% ${effects.spotlightY}%, rgba(255,255,255,${effects.spotlightOpacity}), transparent 46%)`,
          }}
        />
      ) : null}
      {effects?.vignette ? (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle, transparent 42%, rgba(0,0,0,${effects.vignette}) 100%)`,
          }}
        />
      ) : null}
    </div>
  );
}
